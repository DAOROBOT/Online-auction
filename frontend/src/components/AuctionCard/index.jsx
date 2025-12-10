import DefaultAuctionCard from './DefaultAuctionCard';
import WonAuctionCard from './WonAuctionCard';
import SoldAuctionCard from './SoldAuctionCard';
import ActiveBidsAuctionCard from './ActiveBidsAuctionCard';
import ActiveListingAuctionCard from './ActiveListingAuctionCard';
import FavoriteAuctionCard from './FavoriteAuctionCard';
/**
 * AuctionCard Controller Component
 * Routes to different auction card layouts based on type prop
 * 
 * @param {Object} props - Component props
 * @param {Object} props.product - Product/auction item data containing all information
 * @param {string} props.type - Card variant type: 'default', 'won', 'sold'
 * @param {Function} props.onReview - Callback for review action
 * @param {Function} props.onCancel - Callback for cancel action (sold only)
 * @returns {JSX.Element} Rendered auction card variant
 */
export default function AuctionCard({
  product,
  type = 'default',
  formatTime,
  onReview,
  onCancel,
}) {
  switch (type) {
    case 'wonItem':
      return (
        <WonAuctionCard
          product={product}
          onReview={onReview}
        />
      );
    
    case 'soldItem':
      return (
        <SoldAuctionCard
          product={product}
          onReview={onReview}
          onCancel={onCancel}
        />
      );
    case 'activeBids':
      return (
        <ActiveBidsAuctionCard
          product={product}
          formatTime={formatTime}
        />
      );
    case 'activeListings':
      return (
        <ActiveListingAuctionCard
          product={product}
          formatTime={formatTime}
        />
      );
    case 'favorites':
      return (
        <FavoriteAuctionCard
          product={product}
          formatTime={formatTime}
        />
      );
    
    case 'default':
    default:
      return (
        <DefaultAuctionCard
          item={product}
        />
      );
  }
}

// Export all variants for direct imports if needed
export { DefaultAuctionCard, WonAuctionCard, SoldAuctionCard, ActiveBidsAuctionCard, ActiveListingAuctionCard, FavoriteAuctionCard };
