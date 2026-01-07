import { useState, useEffect } from 'react';
import { Heart, Clock, Shield, Calendar, Sparkles } from 'lucide-react';
import { useNav } from '../../hooks/useNavigate.js';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import { formatCurrency, formatTimeLeft, formatDate, formatBidderName } from '../../utils/format.js';
import './AuctionCard.css'

export default function AuctionCard({ product }) {
  const nav = useNav();
  const { user } = useAuth();

  const [isLiked, setIsLiked] = useState(product.isFavorited || false);
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();

    if (!user) {
      alert("Please login to add items to your watchlist");
      return;
    }

    if (loading) {
      alert("Please wait...");
      return;
    }

    const previousState = isLiked;
    setIsLiked(!previousState);
    setLoading(true);

    try {
      await userService.toggleFavorite(product.id);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setIsLiked(previousState); 
      alert("Failed to update watchlist");
    } finally {
      setLoading(false);
    }
  };

  const [timeLeft, setTimeLeft] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('normal');

  const isNew = (new Date() - new Date(product.createdAt) < 96 * 60 * 60 * 1000);

  useEffect(() => {
    const updateTimeLeft = () => {
      const { timeLeft, urgencyLevel } = formatTimeLeft(product.endTime);
      setTimeLeft(timeLeft);
      setUrgencyLevel(urgencyLevel);
    };
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [product.endTime]);

  const handleCardClick = () => {
    // if (product.status == 'active')
      nav.auction(product.id);
    // nav.order(product.id);
  };

  const timerStyles = {
    normal: 'bg-black/50 text-white',
    warning: 'bg-yellow-500/90 text-white',
    critical: 'bg-red-600/90 text-white animate-pulse'
  };

  return (
    <div 
      onClick={handleCardClick}
      className={
        `group cursor-pointer relative w-full max-w-sm rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-2xl
        ${isNew ? 'ring-2 ring-offset-2 ring-(--auction-accent)' : 'shadow-sm'}`
      }
      style={{ 
        backgroundColor: 'var(--auction-bg)', 
        borderColor: isNew ? 'var(--auction-accent)' : 'var(--auction-border)',
        boxShadow: isNew ? '0 0 15px -3px var(--auction-accent)' : 'var(--auction-shadow)'
      }}
      >
        
        {/* --- Image Section --- */}
        <div className="relative aspect-4/3 overflow-hidden bg-(--auction-badge-bg)">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
            {/* Category Badge */}
            <span className="px-2.5 py-1 backdrop-blur-md text-[10px] text-(--auction-text-muted) uppercase tracking-wider font-bold rounded-full shadow-sm bg-white/90">
              {product.category}
            </span>

            {/* NEW ARRIVAL BADGE (Only for new items) */}
            {isNew && (
              <span className="px-3 py-1 flex items-center gap-1 backdrop-blur-md text-xs font-bold rounded-full shadow-lg animate-pulse" 
                style={{ backgroundColor: 'var(--auction-accent)', color: 'var(--auction-accent-fg)' }}>
                <Sparkles size={12} className="fill-current" /> NEW ARRIVAL
              </span>
            )}
          </div>

          <button 
            onClick={handleToggleFavorite}
            disabled={loading}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-white transition-colors shadow-sm z-10 bg-white/80"
            style={{ color: isLiked ? '#f43f5e' : 'var(--auction-text-subtle)' }}
          >
            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
          </button>

          {/* Timer Badge */}
          <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-bold flex items-center gap-1.5 shadow-sm ${timerStyles[urgencyLevel]}`}>
            <Clock size={14} />
            <span>{timeLeft}</span>
          </div>
        </div>

        {/* --- Content Section --- */}
        <div className="pt-5 px-5 flex flex-col grow relative">
          
          {/* Title */}
          <h3 className="text-left text-lg text-(--auction-text) font-bold line-clamp-1 mb-2 transition-colors duration-100">
            {product.title}
          </h3>

          {/* --- Seller & Date Info --- */}
          <div className="flex flex-row justify-between gap-3 pb-4 border-b border-(--auction-border)">
            <div className="flex items-center gap-1 max-w-30 overflow-hidden">
              <span className="font-bold text-sm text-(--auction-text-muted) truncate">
                {product.seller?.username || "Unknown"}
              </span>
              {product.seller?.rating > 80 && (<Shield size={14} className="text-(--auction-success) fill-current" />)}
            </div>
            <div className="flex items-center gap-1 text-xs text-(--auction-text-muted)">
              <Calendar size={12} />
              <span className='max-w-20 overflow-hidden truncate'>{formatDate(product.createdAt)}</span>
            </div>
          </div>
          
          {/* --- DUAL PRICE BOX --- */}
          <div className="grid grid-cols-2 gap-px overflow-hidden border-b border-(--auction-border)">

            <div className="relative group/bid cursor-help overflow-hidden">

              <div className="absolute inset-0 flex flex-col items-start justify-center transition-all duration-200 transform group-hover/bid:-translate-y-full group-hover/bid:opacity-0">
                  <div className="text-xs text-(--auction-bid-text) font-bold uppercase tracking-wider">Highest Bid</div>
                  <span className="text-lg text-(--auction-text) font-black">
                      {formatCurrency(product.bids?.amount)}
                  </span>
              </div>

              <div className="absolute inset-0 flex flex-col justify-center items-center transition-all duration-200 transform translate-y-full opacity-0 group-hover/bid:translate-y-0 group-hover/bid:opacity-100">
                  {product.bids ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-xs text-(--text) font-bold uppercase tracking-wider">Top Bidder</div>
                        <span className="text-xs text-(--auction-bid-text) font-bold">
                          {formatBidderName(product.bids.bidder?.username, user?.username == product.bids.bidder?.username)}
                        </span>
                      </div>
                  ) : (
                      <span className="text-xs text-(--text-muted) font-medium">No Bids Yet</span>
                  )}
              </div>
            </div>

            <div className="p-3 flex flex-col items-end justify-center relative border-l border-(--auction-border)">
              <span className="text-xs text-(--success) uppercase font-bold tracking-wider mb-1">
                Buy Now
              </span>
              <span className="text-lg text-(--text) font-black">
                {product.buyNowPrice ? formatCurrency(product.buyNowPrice) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="my-2 flex items-center gap-1 text-xs text-(--text-muted)">
            <span className="font-bold text-(--auction-text)">{product.bidCount || 0}</span> bids
          </div>
        </div>
    </div>
  );
};