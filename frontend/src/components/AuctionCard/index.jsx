import DefaultAuctionCard from './DefaultAuctionCard';
import WonAuctionCard from './WonAuctionCard';
import SoldAuctionCard from './SoldAuctionCard';
import BiddingAuctionCard from './BiddingAuctionCard';
import ListingAuctionCard from './ListingAuctionCard';
import FavoriteAuctionCard from './FavoriteAuctionCard';
import './AuctionCard.css'

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
export default function AuctionCard({ product, variant, ...props }) {
  switch (variant) {
    case 'won':
      return (
        <WonAuctionCard product={product} {...props}/>
      );
    case 'sold':
      return (
        <SoldAuctionCard product={product} {...props}/>
      );
    case 'bidding':
      return (
        <BiddingAuctionCard product={product} {...props}/>
      );
    case 'listing':
      return (
        <ListingAuctionCard product={product} {...props}/>
      );
    case 'favorite':
      return (
        <FavoriteAuctionCard product={product} {...props}/>
      );
    default:
      return (
        <DefaultAuctionCard product={product}/>
      );
  }
}

// Export all variants for direct imports if needed
export { DefaultAuctionCard, WonAuctionCard, SoldAuctionCard, BiddingAuctionCard, ListingAuctionCard, FavoriteAuctionCard };
