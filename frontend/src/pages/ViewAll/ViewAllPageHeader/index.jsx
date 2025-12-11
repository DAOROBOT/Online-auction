// Component Exports
import ViewAllActiveBidPageHeader from "./ViewAllActiveBidPageHeader";
import ViewAllActiveListingPageHeader from "./ViewAllActiveListingPageHeader";
import ViewAllFavoriteProductPageHeader from "./ViewAllFavoriteProductPageHeader";
import ViewAllReviewPageHeader from "./ViewAllReviewPageHeader";
import ViewAllSoldItemPageHeader from "./ViewAllSoldItemPageHeader";
import ViewAllWonItemPageHeader from "./ViewAllWonItemPageHeader";
/**
 * Section Controller Component
 * Routes to different profile card sections based on type prop
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Section variant type: 'activeListings', 'activeBids', 'won', 'favorites', 'soldItems'
 * @returns {JSX.Element} Rendered profile card section variant
 */

export default function ViewAllPageHeader({
    type,
}) {
    switch (type) {
        case 'activeListings':
            return <ViewAllActiveListingPageHeader />;
        case 'activeBids':
            return <ViewAllActiveBidPageHeader />;
        case 'favorites':
            return <ViewAllFavoriteProductPageHeader />;
        case 'reviews':
            return <ViewAllReviewPageHeader />;
        case 'wonItems':
            return <ViewAllWonItemPageHeader />;
        case 'soldItems':
            return <ViewAllSoldItemPageHeader />;
        default:
            return null;
    }
}

export {
    ViewAllActiveBidPageHeader,
    ViewAllActiveListingPageHeader,
    ViewAllFavoriteProductPageHeader,
    ViewAllReviewPageHeader,
    ViewAllSoldItemPageHeader,
    ViewAllWonItemPageHeader,
};