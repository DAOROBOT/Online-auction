import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNav } from '../hooks/useNavigate';
import { formatCurrency, formatTimeLeft } from '../utils/format.js';
import productService from '../services/productService.js';
import {
  ProductImageGallery,
  ProductInfo,
  BiddingSection,
  TopBiddersSection,
  CommentsSection
} from '../components/ProductDetail';

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNav();
  const [product, setProduct] = useState(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState({ timeLeft: '', urgencyLevel: 'normal' });
  const [top3Bidders, setTop3Bidders] = useState([]);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      try {
        // Load product
        const productData = await productService.getById(id);
        if (productData) {
          setProduct(productData);
          setBidAmount(productData.currentPrice + productData.biddingStep);
          
          // Load top bidders using product.id to ensure correct matching
          const bidders = await productService.getTopBidders(productData.id, 3);
          setTop3Bidders(bidders);

          // Load comments using product.id
          const commentsData = await productService.getComments(productData.id);
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Error loading product data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  useEffect(() => {
    if (product) {
      const updateTime = () => {
        const time = formatTimeLeft(product.endTime);
        setTimeLeft(time);
      };
      updateTime();
      const timer = setInterval(updateTime, 1000);
      return () => clearInterval(timer);
    }
  }, [product]);

  const handleBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= product.currentPrice) {
      alert('Bid amount must be higher than current price');
      return;
    }
    
    try {
      const result = await productService.placeBid(product.id, parseFloat(bidAmount));
      if (result.success) {
        alert(`Bid placed: ${formatCurrency(parseFloat(bidAmount))}`);
        // Optionally refresh top bidders
        const bidders = await productService.getTopBidders(product.id, 3);
        setTop3Bidders(bidders);
      }
    } catch (error) {
      alert('Failed to place bid. Please try again.');
      console.error('Error placing bid:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out this auction: ${product.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !product) return;
    
    try {
      const newComment = await productService.addComment(product.id, comment);
      setComments([newComment, ...comments]);
      setComment('');
    } catch (error) {
      alert('Failed to add comment. Please try again.');
      console.error('Error adding comment:', error);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!product) return;
    
    try {
      const result = await productService.toggleWatchlist(product.id, isWatchlisted);
      if (result.success) {
        setIsWatchlisted(result.isWatchlisted);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--text)' }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--text)' }}>Product not found</p>
          <button 
            onClick={() => nav.home()} 
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button 
            onClick={() => nav.back()} 
            className="text-sm hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Product Images and Description */}
          <div className="space-y-6">
            <ProductImageGallery
              product={product}
              isWatchlisted={isWatchlisted}
              onWatchlistToggle={handleWatchlistToggle}
              onShare={handleShare}
            />
            <ProductInfo product={product} />
          </div>

          {/* RIGHT COLUMN - Product Details, Bidding, Top Bidders, Comments */}
          <div className="space-y-6">
            <BiddingSection
              product={product}
              bidAmount={bidAmount}
              onBidAmountChange={setBidAmount}
              onBid={handleBid}
              timeLeft={timeLeft}
            />
            <TopBiddersSection topBidders={top3Bidders} />
            <CommentsSection
              comments={comments}
              comment={comment}
              onCommentChange={setComment}
              onCommentSubmit={handleComment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
