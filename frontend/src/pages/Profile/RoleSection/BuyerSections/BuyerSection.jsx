import ReviewsSection from "./ReviewSection/ReviewsSection.jsx";
import CardSection from "../../CardSection/index.jsx";


export default function BuyerSection({userData, formatTime, setReviewModal}){
    return (
        <div className="space-y-8">
            <ReviewsSection reviews={userData.reviews} />

            {/* Favorite Products */}
            {userData.favoriteProducts.length > 0 && (
            <CardSection type="favorites" products={userData.favoriteProducts} formatTime={formatTime} />
            )}

            {/* Active Bids */}
            {userData.activeBids.length > 0 && (
            <CardSection type="activeBids" products={userData.activeBids} formatTime={formatTime} />
            )}

            {/* Won Auctions */}
            {userData.wonAuctions.length > 0 && (
            <CardSection type="wonItems" products={userData.wonAuctions} setReviewModal={setReviewModal} />
            )}
        </div>
    );
}