import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNav } from "../../hooks/useNavigate.js";
import { TrendingUp, DollarSign, Trophy, Heart } from "lucide-react";

import ProfileHeader from "./HeaderProfile/ProfileHeader.jsx";
import AuctionCard from "../../components/AuctionCard";
import TabSection from "./TabSection.jsx"
import StatsSidebar from "./StatsSidebar.jsx";
import StatItem from "./StatItem.jsx";

import { mockUserData } from "../../data/users.js";

export default function PersonalProfile() {
  const { user } = useAuth();
  const nav = useNav();
  const [userData, setUserData] = useState(mockUserData);
  const [activeTab, setActiveTab] = useState('active-bids');
  
  // Modal State for Rating
  const [reviewModal, setReviewModal] = useState({ isOpen: false, item: null });
  const [reviewForm, setReviewForm] = useState({ rating: 'positive', comment: '' });

  // --- ACTIONS ---
  // 1. Remove Favorite
  const handleRemoveFavorite = (id) => {
    if(confirm("Remove this item from your favorites?")) {
        setUserData(prev => ({
            ...prev,
            favoriteProducts: prev.favoriteProducts.filter(item => item.id !== id)
        }));
    }
  };

  // 2. Open Rate Modal
  const openRateModal = (item) => {
    setReviewModal({ isOpen: true, item });
  };

  // 3. Submit Review
  const handleSubmitReview = () => {
    // API Call logic here...
    alert(`Review submitted for ${reviewModal.item.title}!`);
    
    // Optimistic Update
    setUserData(prev => ({
        ...prev,
        wonAuctions: prev.wonAuctions.map(i => 
            i.id === reviewModal.item.id ? { ...i, reviewed: true } : i
        )
    }));
    setReviewModal({ isOpen: false, item: null });
    setReviewForm({ rating: 'positive', comment: '' });
  };

  // --- STATS HELPER ---
  const stats = {
    bids: {
      count: userData.activeBids?.length || 0,
      amount: userData.activeBids?.reduce((acc, curr) => acc + curr.yourBid, 0) || 0,
      winning: userData.activeBids?.filter(b => b.isWinning).length || 0
    },
    won: {
      count: userData.wonAuctions?.length || 0,
      spent: userData.wonAuctions?.reduce((acc, curr) => acc + curr.winningBid, 0) || 0,
    },
    favorites: {
      count: userData.favoriteProducts?.length || 0
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      
      // --- 1. ACTIVE BIDS (Rows) ---
      case 'active-bids':
        return (
          <TabSection title="Active Bids" emptyMessage="No active bids.">
             <StatsSidebar>
                <StatItem label="Total Bids" value={stats.bids.count} icon={TrendingUp} color="var(--accent)" />
                <StatItem label="Committed" value={`$${stats.bids.amount.toLocaleString()}`} icon={DollarSign} color="var(--text-muted)" />
                <StatItem label="Winning" value={stats.bids.winning} icon={Trophy} color="var(--success)" highlight />
             </StatsSidebar>
             
             <div className="flex flex-col gap-3">
                {userData.activeBids?.map(bid => (
                    <AuctionCard 
                        key={bid.id} 
                        product={bid} 
                        variant="bidding"
                        onClick={() => nav.auction(bid.id)} />
                ))}
             </div>
          </TabSection>
        );

      // --- 2. WON AUCTIONS (Posts + Rate) ---
      case 'won-auctions':
        return (
          <TabSection title="Won Auctions" emptyMessage="No won auctions yet.">
             <StatsSidebar>
                <StatItem label="Items Won" value={stats.won.count} icon={Trophy} color="var(--accent)" />
                <StatItem label="Total Spent" value={`$${stats.won.spent.toLocaleString()}`} icon={DollarSign} color="var(--danger)" />
             </StatsSidebar>
             
             {/* Display as Posts */}
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {userData.wonAuctions?.map(item => (
                    <AuctionCard 
                        key={item.id} 
                        product={item} 
                        variant="won" 
                        onAction={() => openRateModal(item)} 
                    />
                ))}
             </div>
          </TabSection>
        );

      // --- 3. FAVORITES (Grid + Remove) ---
      case 'favorites':
        return (
          <TabSection title="Favorite Items" emptyMessage="No favorite items saved.">
             <StatsSidebar>
                <StatItem label="Saved Items" value={stats.favorites.count} icon={Heart} color="var(--danger)" />
             </StatsSidebar>
             
             {/* Display as Grid with Remove Handler */}
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {userData.favoriteProducts?.map(item => (
                    <AuctionCard 
                        key={item.id} 
                        product={item} 
                        variant="favorite" 
                        onRemove={() => handleRemoveFavorite(item.id)}
                    />
                ))}
             </div>
          </TabSection>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <div className="bg-[var(--bg)] px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full min-h-screen">

        <ProfileHeader userData={userData} onEditProfile={() => {}} onChangePassword={() => {}} />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border)] overflow-x-auto">
          <NavTab label="Active Bids" icon={TrendingUp} id="active-bids" activeTab={activeTab} onClick={setActiveTab} />
          <NavTab label="Won Auctions" icon={Trophy} id="won-auctions" activeTab={activeTab} onClick={setActiveTab} />
          <NavTab label="Favorites" icon={Heart} id="favorites" activeTab={activeTab} onClick={setActiveTab} />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
           {renderContent()}
        </div>
      </div>

    {/* Review Modal */}
    {/* <ReviewModal
      isOpen={reviewModal.isOpen}
      reviewModal={reviewModal} // Passing full object for compatibility
      reviewForm={reviewForm}
      setReviewForm={setReviewForm}
      onSubmit={handleSubmitReview}
      onClose={() => setReviewModal({ isOpen: false, item: null })}
    /> */}
    </>
  );
}

function ReviewRow({ review }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border transition-all hover:shadow-md bg-[var(--card-bg)]" style={{ borderColor: 'var(--border)' }}>
            <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                    {review.from.charAt(0)}
                </div>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{review.from}</h4>
                        <p className="text-xs text-[var(--text-muted)]">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${review.type === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {review.type === 'positive' ? 'Positive' : 'Negative'}
                    </span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--text)' }}>"{review.comment}"</p>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>Product:</span>
                    <span className="font-medium text-[var(--accent)]">{review.productTitle || "Item #123"}</span>
                </div>
            </div>
        </div>
    );
}

function NavTab({ label, icon: Icon, id, activeTab, onClick }) {
    const isActive = activeTab === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg border-b-2 transition-all font-medium whitespace-nowrap ${
                isActive 
                ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]/10' 
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
            }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );
}