import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, MapPin, Gavel, Heart, Share2, ShieldCheck, User, TrendingUp, 
  Trophy, Zap, AlertCircle, ChevronRight, Crown, Star, CheckCircle 
} from 'lucide-react';
import { formatCurrency, formatTimeLeft } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { placeBidSchema } from '../../schemas/auction.schemas';
import { validateForm } from '../../utils/validation';
import auctionService from '../../services/auctionService';
import userService from '../../services/userService'

export default function BiddingSection({ product }) {
  const { user } = useAuth();
  
  // --- TÍNH TOÁN GIÁ TRỊ BAN ĐẦU AN TOÀN ---
  const currentPrice = Number(product?.currentPrice) || 0;
  const stepPrice = Number(product?.biddingStep || product?.stepPrice) || 0;
  const buyNowPrice = product?.buyNowPrice ? Number(product.buyNowPrice) : null;
  const initialBid = currentPrice + stepPrice;
  
  const [bidAmount, setBidAmount] = useState(initialBid);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  
  //Trạng thái hiển thị hiệu ứng Loading khi đang gửi bid
  const [loading, setLoading] = useState(false); 

  // [CẬP NHẬT] Tự động cập nhật giá gợi ý nếu có người khác vừa bid xong \
  useEffect(() => {
    if (product) {
        const newCurrent = Number(product.currentPrice) || 0;
        const newStep = Number(product.biddingStep || product.stepPrice) || 0;
        // Chỉ cập nhật nếu user chưa nhập gì (đang ở giá mặc định) hoặc giá mới cao hơn
        setBidAmount(prev => {
            const newMin = newCurrent + newStep;
            return prev < newMin ? newMin : prev;
        });
    }
  }, [product]);

  const handleWatchlist = () => {
    setIsWatchlisted(!isWatchlisted);
  };

  // --- HÀM XỬ LÝ ĐẤU GIÁ TỰ ĐỘNG ---
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    // 1. Kiểm tra đăng nhập
    if (!user) {
        // Chuyển hướng login (dùng window.location để đảm bảo redirect mượt)
        window.location.href = '/login'; 
        return;
    }

    // 2. Validate dữ liệu ở Client (dùng Zod schema)
    // Logic: Giá đặt phải >= Giá hiện tại + Bước giá
    const validation = validateForm(placeBidSchema, { 
      bidAmount: parseFloat(bidAmount),
      currentPrice: currentPrice,
      stepPrice: stepPrice 
    });

    if (!validation.success) {
      alert(validation.message);
      return;
    }

    // 3. Gọi API Đấu giá tự động (Backend Service)
    setLoading(true); // Bật trạng thái loading 
    try {
        // Gọi hàm placeBid trong auctionService (Hàm này gọi API POST /auction/:id/bid)
        // Hệ thống backend sẽ tự động tính toán logic Auto-bid
        await auctionService.placeBid(product.id, bidAmount);
        
        // Thông báo thành công
        alert(`Thành công! Hệ thống đã ghi nhận mức giá tối đa ${formatCurrency(bidAmount)} của bạn. Chúng tôi sẽ tự động trả giá giúp bạn.`);
        
        // Tải lại trang để cập nhật giá mới nhất và lịch sử đấu giá
        window.location.reload(); 
    } catch (err) {
        console.error(err);
        alert(err.message || "Đấu giá thất bại. Vui lòng thử lại.");
    } finally {
        setLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  // Bảo vệ component không render nếu thiếu dữ liệu
  if (!product) return null;

  return (
    <div className="rounded-3xl border overflow-hidden relative shadow-2xl backdrop-blur-sm transition-all duration-300"
         style={{ 
           backgroundColor: 'var(--bg-soft)',
           borderColor: 'var(--border)'
         }}>
      
      {/* Top Gradient Line*/}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] via-orange-500 to-[var(--accent)]"></div>

      <div className="p-6 md:p-8">
        
        {/* --- HEADER: Trạng thái & Tiêu đề --- */}
        <div className="mb-8">
          <div className="flex justify-between items-start gap-4 mb-4">
             {/* Trạng thái đấu giá (Active/Ended) */}
             <div className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full border w-fit"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                <span className={`w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                <span className="uppercase tracking-wider text-xs">{product.status}</span>
             </div>
             
             {/* Nút Like & Share */}
             <div className="flex gap-2">
               <button 
                 onClick={handleWatchlist}
                 className="p-2.5 rounded-full border transition-all hover:scale-110 active:scale-95"
                 style={{ 
                   borderColor: 'var(--border)',
                   backgroundColor: isWatchlisted ? 'var(--danger-soft)' : 'transparent',
                   color: isWatchlisted ? 'var(--danger)' : 'var(--text-muted)'
                 }}>
                 <Heart size={20} className={isWatchlisted ? "fill-current" : ""} />
               </button>
               <button className="p-2.5 rounded-full border transition-all hover:bg-[var(--bg-hover)]"
                 style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                 <Share2 size={20} />
               </button>
             </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4" style={{ color: 'var(--text)' }}>
            {product.title}
          </h1>

          {/* Thông tin người bán */}
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold">
               {product.sellerName ? product.sellerName[0].toUpperCase() : 'S'}
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs">Seller</p>
              <Link to={`/profile/${product.sellerName}`} className="font-bold hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text)' }}>
                @{product.sellerName || 'Unknown'}
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)]">
               <Star size={12} className="text-[var(--accent)] fill-current" />
               <span>4.9</span>
               <span className="text-[var(--text-muted)]">(120)</span>
            </div>
          </div>
        </div>

        {/* --- PRICING CARD (Khu vực đấu giá chính) --- */}
        <div className="p-6 rounded-2xl mb-8 relative overflow-hidden group"
             style={{ backgroundColor: 'var(--bg)' }}>
           
           {/* Icon nền mờ trang trí (Gavel lớn) */}
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Gavel size={80} />
           </div>

           <div className="relative z-10">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Current Bid</p>
              
              {/* Giá hiện tại to rõ */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
                  {formatCurrency(currentPrice)}
                </span>
                <span className="text-sm font-medium text-[var(--text-muted)]">
                  {product.bidCount || 0} bids
                </span>
              </div>

              {/* Giá mua ngay (nếu có) */}
              {buyNowPrice && (
                <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-green-500/10 text-green-600 w-fit mb-4">
                   <Zap size={16} className="fill-current" />
                   Buy Now: {formatCurrency(buyNowPrice)}
                </div>
              )}
              
              <div className="h-px w-full bg-[var(--border)] my-4"></div>

              {/* --- [FORM NHẬP GIÁ] Đã tích hợp Auto Bid --- */}
              <form onSubmit={handlePlaceBid} className="space-y-4 mb-6">
                
                {/* Label có Badge Auto-Bid để người dùng hiểu tính năng */}
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[var(--text)]">Your Maximum Bid</label>
                    <span className="text-[10px] bg-[var(--accent)] text-black px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1 cursor-help" title="System will bid for you automatically up to this amount">
                        <Zap size={10} fill="black" /> AUTO-BID
                    </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">₫</span>
                  </div>
                  <input 
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="block w-full pl-8 pr-4 py-4 rounded-xl font-bold text-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all outline-none"
                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    placeholder={`Min ${formatCurrency(initialBid)}`}
                  />
                </div>
                
                {/* Giải thích cơ chế tự động */}
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  Enter {formatCurrency(initialBid)} or more. We'll bid automatically for you.
                </p>

                {/* Nút đặt giá */}
                <button 
                    type="submit" 
                    disabled={loading || product.status !== 'active'}
                    className="w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--accent)', color: '#1A1205' }}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1A1205]"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            Place Bid
                            <Gavel size={20} />
                        </>
                    )}
                </button>
              </form>
           </div>
        </div>

        {/* --- FOOTER INFO (Thời gian & Bước giá) --- */}
        <div className="grid grid-cols-2 gap-4 text-center">
           <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1">Time Left</p>
              <div className="font-bold flex items-center justify-center gap-1" style={{ color: 'var(--text)' }}>
                 <Clock size={14} />
                 {formatTimeLeft(product.endTime).timeLeft}
              </div>
           </div>
           <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-[var(--text-muted)] mb-1">Step</p>
              <div className="font-bold flex items-center justify-center gap-1" style={{ color: 'var(--text)' }}>
                 <TrendingUp size={14} />
                 {formatCurrency(stepPrice)}
              </div>
           </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-semibold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-green-600" />
            Secure Bidding
          </div>
          <div className="flex items-center gap-1.5">
            <Star size={14} style={{ color: 'var(--accent)' }} />
            Verified Item
          </div>
        </div>
      </div>
    </div>
  );
}