import { useState } from 'react';
import { Clock, MapPin, Gavel, Heart, Share2, ShieldCheck, User, TrendingUp, Trophy, Zap, AlertCircle, ChevronRight, Crown, Star } from 'lucide-react';
import { formatCurrency, formatTimeLeft } from '../../utils/format';

// Mock data for demonstration
// const mockProduct = {
//   title: "Vintage Rolex Submariner 1680",
//   sellerName: "LuxuryTimepieces",
//   currentPrice: 15750,
//   startingPrice: 12000,
//   buyNowPrice: 22000,
//   biddingStep: 250,
//   bidCount: 47,
//   endTime: new Date(Date.now() + 3600000 * 5).toISOString(),
//   status: 'active',
//   autoExtend: true,
//   category: "Luxury Watches"
// };

export default function BiddingSection({ product }) {
  // const [product] = useState(mockProduct);
  const [bidAmount, setBidAmount] = useState(product.currentPrice + product.biddingStep);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(product.endTime));

  // Update timer
  // useState(() => {
  //   const interval = setInterval(() => {
  //     setTimeLeft(formatTimeLeft(product.endTime));
  //   }, 1000);
  //   return () => clearInterval(interval);
  // });

  const incrementBid = (amount) => {
    setBidAmount(prev => prev + amount);
  };

  const handleBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= product.currentPrice) {
      alert('Bid amount must be higher than current price');
      return;
    }
    try {
      const result = await productService.placeBid(product.id, parseFloat(bidAmount));
      if (result.success) {
        alert(`Bid placed: ${formatCurrency(parseFloat(bidAmount))}`);
        const bidders = await productService.getTopBidders(product.id, 3);
      }
    } catch (error) {
      alert('Failed to place bid. Please try again.');
    }
  };

  const priceIncrease = ((product.currentPrice - product.startingPrice) / product.startingPrice * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-(--bg)">
      <div className="max-w-lg mx-auto">
        
        {/* Header: Status Banner */}
        <div className="relative px-6 pt-6 pb-4">

          {/* Seller Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border"
                  style={{ 
                    backgroundColor: 'var(--accent-soft)', 
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)'
                  }}>
              <User size={12} />
              {product.sellerName}
              <ShieldCheck size={12} className="text-(--success)" />
            </div>

            {product.autoExtend && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'var(--info-soft)', color: 'var(--info)' }}>
                <Zap size={12} />
                Auto-Extend
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-black leading-tight mb-3" 
              style={{ color: 'var(--text)' }}>
            {product.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm font-medium" 
                style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> Ho Chi Minh City
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp size={14} /> {product.bidCount} Bids
            </span>
          </div>
        </div>

        {/* Price Dashboard - Premium Design */}
        <div className="mx-6 mb-6 rounded-2xl overflow-hidden border"
          style={{ 
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border-strong)',
            boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)'
          }}>
          
          {/* Current Price - Hero Section */}
          <div className="p-6 text-center relative">
            {/* Accent Gradient Background */}
            <div className="absolute inset-0 opacity-5" 
              style={{ 
                background: `radial-gradient(circle at center, var(--danger) 0%, transparent 70%)`
              }}
            >
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown size={16} style={{ color: 'var(--accent)' }} />
                <p className="text-xs font-bold uppercase tracking-widest" 
                    style={{ color: 'var(--text-muted)' }}>
                  Current Bid
                </p>
              </div>
              
              <div className="text-5xl md:text-6xl font-black tracking-tight mb-2" 
                    style={{ 
                      color: 'var(--accent)',
                      textShadow: '0 2px 20px var(--accent-soft)'
                    }}>
                {formatCurrency(product.currentPrice)}
              </div>

              {/* Price Change Indicator */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ 
                      backgroundColor: 'var(--success-soft)',
                      color: 'var(--success)'
                    }}>
                <TrendingUp size={12} />
                +{priceIncrease}% from start
              </div>
            </div>
          </div>

          {/* Time & Stats Grid */}
          <div className="grid grid-cols-2 border-t" style={{ borderColor: 'var(--border)' }}>
            
            {/* Time Left */}
            <div className="p-4 border-r" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" 
                  style={{ color: 'var(--text-muted)' }}>
                <Clock size={12} />
                Time Left
              </p>
              <div className={`text-xl font-black ${
                timeLeft.urgencyLevel === 'critical' ? 'text-red-600 dark:text-red-400 animate-pulse' : 
                timeLeft.urgencyLevel === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
                ''
              }`} style={{ color: timeLeft.urgencyLevel === 'normal' ? 'var(--text)' : '' }}>
                {timeLeft.timeLeft}
              </div>
            </div>

            {/* Starting Price */}
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" 
                  style={{ color: 'var(--text-muted)' }}>
                Started At
              </p>
              <div className="text-xl font-black" style={{ color: 'var(--text)' }}>
                {formatCurrency(product.startingPrice)}
              </div>
            </div>
          </div>

          {/* Buy Now Option (if available) */}
          {product.buyNowPrice && (
            <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" 
                      style={{ color: 'var(--text-muted)' }}>
                    Buy It Now
                  </p>
                  <div className="text-2xl font-black" style={{ color: 'var(--theme-secondary)' }}>
                    {formatCurrency(product.buyNowPrice)}
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-(--theme-secondary) font-bold text-sm text-white flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                  <Zap size={16} />
                  Buy Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bidding Interface */}
        <div className="px-6 pb-6">
          
          {/* Quick Bid Buttons */}
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" 
                style={{ color: 'var(--text-muted)' }}>
              <Gavel size={12} />
              Quick Bid
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[product.biddingStep, product.biddingStep * 2, product.biddingStep * 5].map((amount, idx) => (
                <button
                  key={idx}
                  onClick={() => incrementBid(product.currentPrice + amount)}
                  className="py-3 px-4 rounded-xl bg-(--bg-soft) font-bold text-sm text-(--text) hover:text-(--accent) border-2 border-(--border) hover:border-(--accent) transition-all hover:scale-105 active:scale-95"
                >
                  +{formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Bid Input */}
          <div className="mb-4">
            <label className="text-xs text-(--text-muted) font-bold uppercase tracking-wider mb-3 block">
              Your Maximum Bid
            </label>
            
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-(--accent) font-black">
                $
              </span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={product.currentPrice + product.biddingStep}
                step={product.biddingStep}
                className="w-full pl-12 pr-24 py-5 rounded-2xl bg-(input-bg) border-2 border-(--input-border) font-black text-2xl text-(--text) outline-none transition-all"
                onFocus={(e) => e.target.style.borderColor = 'var(--input-border-focus)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--input-border)'}
              />
              
              {/* Increment Buttons */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                <button
                  onClick={() => incrementBid(product.biddingStep)}
                  className="px-2 py-1 rounded text-xs font-bold"
                  style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>
                  +{product.biddingStep}
                </button>
                <button
                  onClick={() => incrementBid(-product.biddingStep)}
                  disabled={bidAmount <= product.currentPrice + product.biddingStep}
                  className="px-2 py-1 rounded text-xs font-bold disabled:opacity-30"
                  style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text)' }}>
                  -{product.biddingStep}
                </button>
              </div>
            </div>

            {/* Validation Message */}
            <div className="mt-2 flex items-start gap-2 text-xs font-medium" 
                  style={{ color: 'var(--text-muted)' }}>
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-(--danger)" />
              <p>
                Minimum bid: <span className="font-bold" style={{ color: 'var(--accent)' }}>{formatCurrency(product.currentPrice + product.biddingStep)}</span>
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            className="w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] mb-4"
            style={{ 
              backgroundColor: 'var(--accent)',
              color: '#1A1205',
              boxShadow: '0 10px 30px -10px var(--accent)'
            }}>
            <Trophy size={24} />
            Place Bid
            <ChevronRight size={24} />
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsWatchlisted(!isWatchlisted)}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border-2 transition-all hover:scale-105 active:scale-95 ${
                isWatchlisted ? 'shadow-md' : ''
              }`}
              style={{ 
                backgroundColor: isWatchlisted ? 'var(--danger-soft)' : 'var(--bg-soft)',
                borderColor: isWatchlisted ? 'var(--danger)' : 'var(--border)',
                color: isWatchlisted ? 'var(--danger)' : 'var(--text)'
              }}>
              <Heart size={18} className={isWatchlisted ? 'fill-current' : ''} />
              {isWatchlisted ? 'Watching' : 'Watch'}
            </button>
            
            <button
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border-2 transition-all hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: 'var(--bg-soft)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}>
              <Share2 size={18} />
              Share
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-(--border) flex items-center justify-center gap-6 text-xs text-(--text-muted) font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              Secure Bidding
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={14} style={{ color: 'var(--accent)' }} />
              Verified Item
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        {/* <div className="mt-6 p-4 rounded-2xl border"
             style={{ 
               backgroundColor: 'var(--bg-soft)',
               borderColor: 'var(--border)'
             }}>
          <div className="flex items-start gap-3">
            <AlertCircle size={18} style={{ color: 'var(--info)' }} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <p className="font-bold mb-1" style={{ color: 'var(--text)' }}>
                Auction Rules
              </p>
              <p>
                Your bid is a binding contract. The auction {product.autoExtend ? 'auto-extends by 5 minutes if bids are placed in the final moments' : 'ends at the scheduled time'}. All sales are final.
              </p>
            </div>
          </div>
        </div> */}

      </div>
    </div>
  );
}