// Component Exports
import SellerSection from "./SellerSections/SellerSection";
import BuyerSection from "./BuyerSections/BuyerSection";


/**
 * Section Controller Component
 * Routes to different profile card sections based on type prop
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Section variant type: 'activeListings', 'activeBids', 'won', 'favorites', 'soldItems'
 * @returns {JSX.Element} Rendered profile card section variant
 */

export default function UserSections({
    userData,
    formatTime,
    setReviewModal,
    handleCancelTransaction,
    type,
}) {
    switch (type) {
        case 'seller':
            return <SellerSection userData={userData} formatTime={formatTime} setReviewModal={setReviewModal} handleCancelTransaction={handleCancelTransaction} />;
        case 'buyer':
            return <BuyerSection userData={userData} formatTime={formatTime} setReviewModal={setReviewModal} />;
        default:
            return null;
    }
}

export {
    SellerSection,
    BuyerSection,
};