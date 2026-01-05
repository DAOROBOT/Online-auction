import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate, formatTimeAgo } from '../../utils/format';

// Status step mapping
const STATUS_STEPS = {
  pending_payment: 1,
  pending_confirmation: 2,
  pending_delivery: 2,
  pending_receipt: 3,
  pending_review: 4,
  completed: 5,
  cancelled: -1,
};

const STEP_LABELS = [
  'Payment',
  'Confirmation',
  'Delivery',
  'Review',
];

export default function OrderCompletion() {
  const { auctionId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    paymentProofUrl: '',
    shippingAddress: '',
    buyerPhone: '',
    notes: '',
  });
  const [confirmForm, setConfirmForm] = useState({
    shippingProofUrl: '',
    trackingNumber: '',
    shippingNotes: '',
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 1,
    comment: '',
  });
  const [cancelForm, setCancelForm] = useState({
    reason: '',
    giveNegativeReview: false,
    reviewComment: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Determine user role
  const isSeller = user?.id === order?.sellerId;
  const isBuyer = user?.id === order?.buyerId;
  const isParticipant = isSeller || isBuyer;

  useEffect(() => {
    loadData();
  }, [auctionId]);

  useEffect(() => {
    if (order?.id) {
      loadMessages();
    }
  }, [order?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getByAuctionId(auctionId);
      console.log('Order Data:', orderData);
      // orderData.order contains { order, auction, buyer, seller }
      const orderDetails = orderData.order;
      if (orderDetails) {
        // Flatten the structure for easier access
        setOrder({
          ...orderDetails.order,
          auction: orderDetails.auction,
          buyer: orderDetails.buyer,
          seller: orderDetails.seller,
        });
        setAuction(orderDetails.auction);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await orderService.getMessages(order.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      await orderService.sendMessage(order.id, newMessage.trim());
      setNewMessage('');
      await loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const result = await orderService.submitPayment(order.id, paymentForm);
      setOrder(result.order);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const result = await orderService.confirmPayment(order.id, confirmForm);
      setOrder(result.order);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (submitting) return;

    if (!confirm('Are you sure you have received the item?')) return;

    try {
      setSubmitting(true);
      const result = await orderService.confirmReceipt(order.id);
      setOrder(result.order);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const result = await orderService.submitReview(order.id, reviewForm);
      setOrder(result.order);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const result = await orderService.cancelOrder(order.id, cancelForm);
      setOrder(result.order);
      setShowCancelModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentStep = () => {
    return STATUS_STEPS[order?.status] || 1;
  };

  const canUserReview = () => {
    if (order?.status !== 'pending_review' && order?.status !== 'completed') return false;
    if (isBuyer && !order?.buyerReviewSubmitted) return true;
    if (isSeller && !order?.sellerReviewSubmitted) return true;
    return false;
  };

  const hasUserReviewed = () => {
    if (isBuyer) return order?.buyerReviewSubmitted;
    if (isSeller) return order?.sellerReviewSubmitted;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/" className="text-blue-500 hover:underline">Go back to home</Link>
        </div>
      </div>
    );
  }

  if (!isParticipant) {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-(--card) rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-(--text) mb-4">Auction Ended</h1>
            <p className="text-(--text-muted) mb-6">
              This auction has ended. Only the seller and winner can view the order details.
            </p>
            {auction && (
              <div className="border border-(--border) rounded-xl p-6 mb-6">
                <img
                  src={auction.image || auction.images?.[0]}
                  alt={auction.title}
                  className="w-48 h-48 object-cover rounded-lg mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-(--text)">{auction.title}</h2>
                <p className="text-(--text-muted) mt-2">
                  Final Price: <span className="text-green-500 font-bold">{formatCurrency(auction.currentPrice)}</span>
                </p>
              </div>
            )}
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Browse Other Auctions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-(--card) rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-(--text)">Order Completion</h1>
              <p className="text-(--text-muted) mt-1">
                {isSeller ? 'You are the seller' : 'You are the buyer'}
              </p>
            </div>
            {order?.status !== 'cancelled' && order?.status !== 'completed' && isSeller && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Cancelled Status */}
        {order?.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-700">Order Cancelled</h3>
                {order?.cancelReason && (
                  <p className="text-red-600 mt-1">Reason: {order.cancelReason}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {order?.status !== 'cancelled' && (
          <div className="bg-(--card) rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              {STEP_LABELS.map((label, index) => {
                const stepNum = index + 1;
                const currentStep = getCurrentStep();
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                return (
                  <div key={label} className="flex-1 relative">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          stepNum
                        )}
                      </div>
                      <span className={`mt-2 text-sm font-medium ${isCurrent ? 'text-blue-500' : 'text-(--text-muted)'}`}>
                        {label}
                      </span>
                    </div>
                    {index < STEP_LABELS.length - 1 && (
                      <div
                        className={`absolute top-5 left-1/2 w-full h-0.5 ${
                          stepNum < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Info */}
            <div className="bg-(--card) rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-(--text) mb-4">Auction Details</h2>
              {auction && (
                <div className="flex gap-4">
                  <img
                    src={auction.image || auction.images?.[0]}
                    alt={auction.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-(--text) truncate">{auction.title}</h3>
                    <p className="text-(--text-muted) text-sm mt-1">
                      Final Price: <span className="text-green-500 font-bold">{formatCurrency(order?.finalPrice)}</span>
                    </p>
                    <p className="text-(--text-muted) text-sm mt-1">
                      Order ID: <span className="font-mono">{order?.id}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 1: Payment (Buyer) */}
            {order?.status === 'pending_payment' && isBuyer && (
              <div className="bg-(--card) rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-(--text) mb-4">Submit Payment Details</h2>
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-(--text) mb-2">
                      Payment Proof (Receipt/Screenshot URL)
                    </label>
                    <input
                      type="url"
                      value={paymentForm.paymentProofUrl}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentProofUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/receipt.png"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--text) mb-2">
                      Shipping Address
                    </label>
                    <textarea
                      value={paymentForm.shippingAddress}
                      onChange={(e) => setPaymentForm({ ...paymentForm, shippingAddress: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your full shipping address..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--text) mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={paymentForm.buyerPhone}
                      onChange={(e) => setPaymentForm({ ...paymentForm, buyerPhone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+84 xxx xxx xxx"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--text) mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Any special delivery instructions..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Payment Details'}
                  </button>
                </form>
              </div>
            )}

            {/* Step 1: Waiting for Payment (Seller) */}
            {order?.status === 'pending_payment' && isSeller && (
              <div className="bg-(--card) rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-(--text) mb-4">Waiting for Payment</h2>
                <div className="flex items-center gap-3 text-yellow-600">
                  <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <p>Waiting for the buyer to submit payment details and shipping address.</p>
                </div>
              </div>
            )}

            {/* Step 2: Confirm Payment (Seller) */}
            {order?.status === 'pending_confirmation' && isSeller && (
              <div className="bg-(--card) rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-(--text) mb-4">Confirm Payment & Ship</h2>
                
                {/* Show buyer's payment info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                  <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Buyer's Payment Info</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-(--text-muted)">Payment Proof:</span>{' '}
                      <a href={order?.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        View Receipt
                      </a>
                    </p>
                    <p><span className="text-(--text-muted)">Shipping Address:</span>{' '}
                      <span className="text-(--text)">{order?.shippingAddress}</span>
                    </p>
                    <p><span className="text-(--text-muted)">Contact Phone:</span>{' '}
                      <span className="text-(--text)">{order?.buyerPhone}</span>
                    </p>
                    {order?.buyerNotes && (
                      <p><span className="text-(--text-muted)">Notes:</span>{' '}
                        <span className="text-(--text)">{order?.buyerNotes}</span>
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleConfirmPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-(--text) mb-2">
                      Shipping Invoice URL
                    </label>
                    <input
                      type="url"
                      value={confirmForm.shippingProofUrl}
                      onChange={(e) => setConfirmForm({ ...confirmForm, shippingProofUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/shipping-invoice.png"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--text) mb-2">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={confirmForm.trackingNumber}
                      onChange={(e) => setConfirmForm({ ...confirmForm, trackingNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tracking number..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-(--text) mb-2">
                      Shipping Notes (Optional)
                    </label>
                    <textarea
                      value={confirmForm.shippingNotes}
                      onChange={(e) => setConfirmForm({ ...confirmForm, shippingNotes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Estimated delivery time, carrier info..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Confirming...' : 'Confirm Payment & Send Shipping Info'}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Waiting for Confirmation (Buyer) */}
            {order?.status === 'pending_confirmation' && isBuyer && (
              <div className="bg-(--card) rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-(--text) mb-4">Payment Submitted</h2>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p>Your payment details have been submitted successfully!</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-yellow-600">
                  <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <p>Waiting for the seller to confirm payment and provide shipping information.</p>
                </div>
              </div>
            )}

            {/* Step 3: Waiting for Delivery/Receipt */}
            {(order?.status === 'pending_delivery' || order?.status === 'pending_receipt') && (
              <div className="bg-(--card) rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-(--text) mb-4">
                  {isBuyer ? 'Item Shipped' : 'Item in Transit'}
                </h2>
                
                {/* Shipping info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
                  <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Shipping Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-(--text-muted)">Shipping Invoice:</span>{' '}
                      <a href={order?.shippingProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        View Invoice
                      </a>
                    </p>
                    <p><span className="text-(--text-muted)">Tracking Number:</span>{' '}
                      <span className="text-(--text) font-mono">{order?.trackingNumber}</span>
                    </p>
                    {order?.shippingNotes && (
                      <p><span className="text-(--text-muted)">Notes:</span>{' '}
                        <span className="text-(--text)">{order?.shippingNotes}</span>
                      </p>
                    )}
                  </div>
                </div>

                {isBuyer && (
                  <button
                    onClick={handleConfirmReceipt}
                    disabled={submitting}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Confirming...' : 'I Have Received the Item'}
                  </button>
                )}

                {isSeller && (
                  <div className="flex items-center gap-3 text-yellow-600">
                    <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p>Waiting for the buyer to confirm receipt of the item.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {(order?.status === 'pending_review' || order?.status === 'completed') && (
              <div className="bg-(--card) rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-(--text) mb-4">
                  {order?.status === 'completed' ? 'Transaction Completed' : 'Leave a Review'}
                </h2>

                {order?.status === 'completed' && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3 text-green-600">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p>This transaction has been completed successfully!</p>
                    </div>
                  </div>
                )}

                {canUserReview() ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-(--text) mb-3">
                        Rate the {isBuyer ? 'seller' : 'buyer'}
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: 1 })}
                          className={`flex-1 py-4 rounded-xl border-2 transition ${
                            reviewForm.rating === 1
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-(--border) hover:border-green-300'
                          }`}
                        >
                          <span className="text-3xl">👍</span>
                          <p className="text-sm font-medium text-(--text) mt-1">Positive</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: -1 })}
                          className={`flex-1 py-4 rounded-xl border-2 transition ${
                            reviewForm.rating === -1
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-(--border) hover:border-red-300'
                          }`}
                        >
                          <span className="text-3xl">👎</span>
                          <p className="text-sm font-medium text-(--text) mt-1">Negative</p>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-(--text) mb-2">
                        Comment (Optional)
                      </label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Share your experience..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : hasUserReviewed() ? 'Update Review' : 'Submit Review'}
                    </button>
                  </form>
                ) : hasUserReviewed() ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-(--text-muted)">
                      You have already submitted your review. You can update it anytime.
                    </p>
                    <button
                      onClick={() => {/* Load existing review into form */}}
                      className="mt-3 text-blue-500 hover:underline text-sm"
                    >
                      Edit your review
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-yellow-600">
                    <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p>Waiting for the other party to complete their review.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-(--card) rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="p-4 border-b border-(--border)">
                <h2 className="font-semibold text-(--text)">Chat with {isSeller ? 'Buyer' : 'Seller'}</h2>
              </div>
              
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-(--text-muted) text-sm py-8">
                    No messages yet. Start a conversation!
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.senderId === user?.id
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-(--text) rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-blue-100' : 'text-(--text-muted)'}`}>
                          {formatTimeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-(--border)">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-(--card) rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-(--text) mb-4">Cancel Order</h3>
            <form onSubmit={handleCancelOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-(--text) mb-2">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelForm.reason}
                  onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Explain why you are cancelling..."
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="negativeReview"
                  checked={cancelForm.giveNegativeReview}
                  onChange={(e) => setCancelForm({ ...cancelForm, giveNegativeReview: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="negativeReview" className="text-sm text-(--text)">
                  Give negative review to buyer
                </label>
              </div>
              {cancelForm.giveNegativeReview && (
                <div>
                  <label className="block text-sm font-medium text-(--text) mb-2">
                    Review Comment
                  </label>
                  <textarea
                    value={cancelForm.reviewComment}
                    onChange={(e) => setCancelForm({ ...cancelForm, reviewComment: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Explain your rating..."
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 border border-(--border) text-(--text) rounded-xl font-semibold hover:bg-(--hover) transition"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
