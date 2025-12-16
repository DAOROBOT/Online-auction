import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { mockUserData } from "../../data/users"; // In real app, fetch from API

// Reusing your existing components
import ProfileHeader from "../UserDashboard/HeaderProfile/ProfileHeader";
import AuctionCard from "../../components/AuctionCard";
import ViewAllButton from "../../components/ViewAllButton"; // Assuming you have this
import { Package, ShoppingBag, ShieldCheck } from "lucide-react";

export default function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('selling'); // Default to selling if they are a seller
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Public Profile Data
  useEffect(() => {
    // Simulate API Fetch
    const foundUser = mockUserData; // Replace with: await api.getUser(id)
    
    if (foundUser) {
        setProfileData(foundUser);
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  // 2. Redirect to private dashboard if viewing own profile
//   if (currentUser && currentUser.id === profileData?.id) {
//       return <Navigate to="/me" replace />;
//   }

//   if (!profileData) return <div>User not found</div>;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. PUBLIC HEADER (Read Only) */}
        {/* We reuse ProfileHeader but pass specific props to hide edit buttons */}
        <PublicProfileHeader userData={profileData} />

        {/* 2. PUBLIC TABS */}
        <div className="flex gap-2 mb-8 border-b" style={{ borderColor: 'var(--border)' }}>
             {/* Show Seller Tab only if they are a seller */}
             {profileData.role === 'seller' && (
                <TabButton 
                    label="Active Listings" 
                    icon={Package} 
                    isActive={activeTab === 'selling'} 
                    onClick={() => setActiveTab('selling')} 
                />
             )}
             <TabButton 
                label="Recent Activity" 
                icon={ShoppingBag} 
                isActive={activeTab === 'activity'} 
                onClick={() => setActiveTab('activity')} 
             />
             <TabButton 
                label="Reputation" 
                icon={ShieldCheck} 
                isActive={activeTab === 'reputation'} 
                onClick={() => setActiveTab('reputation')} 
             />
        </div>

        {/* 3. TAB CONTENT */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* A. SELLER LISTINGS */}
            {activeTab === 'selling' && profileData.role === 'seller' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Active Auctions</h2>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{profileData.activeListings?.length || 0} items</span>
                    </div>
                    {profileData.activeListings?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {profileData.activeListings.map(item => (
                                <AuctionCard key={item.id} product={item} variant="default" />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No active auctions at the moment." />
                    )}
                </div>
            )}

            {/* B. RECENT ACTIVITY (Won Auctions / Reviews) */}
            {activeTab === 'activity' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Won Auctions (Proof of Legitimacy) */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Recently Won</h2>
                        <div className="space-y-4">
                            {profileData.wonAuctions?.slice(0, 5).map(item => (
                                <div key={item.id} className="flex gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                                    <img src={item.image} className="w-20 h-20 rounded-lg object-cover" />
                                    <div>
                                        <h3 className="font-bold" style={{ color: 'var(--text)' }}>{item.title}</h3>
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Won for <span className="font-bold" style={{ color: 'var(--accent)' }}>${item.winningBid}</span></p>
                                        <p className="text-xs mt-2" style={{ color: 'var(--text-subtle)' }}>{new Date(item.endTime).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                             <h3 className="font-bold mb-4" style={{ color: 'var(--text)' }}>Statistics</h3>
                             <StatRow label="Joined" value={new Date(profileData.createdAt || Date.now()).toLocaleDateString()} />
                             <StatRow label="Auctions Won" value={profileData.wonAuctions?.length || 0} />
                             {profileData.role === 'seller' && (
                                <StatRow label="Items Sold" value={profileData.soldItems?.length || 0} />
                             )}
                             <StatRow label="Reliability" value={`${profileData.rating?.percentage || 100}%`} highlight />
                        </div>
                    </div>
                </div>
            )}

            {/* C. REPUTATION (Reviews) */}
            {activeTab === 'reputation' && (
                 <div className="max-w-3xl">
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Community Reviews</h2>
                    {/* Reuse your ReviewSection component here if possible, or a read-only version */}
                    <div className="space-y-4">
                        {/* Mock Reviews List */}
                        {[1,2,3].map(i => (
                            <div key={i} className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold" style={{ color: 'var(--text)' }}>Verified Buyer</span>
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>2 days ago</span>
                                </div>
                                <div className="flex gap-1 mb-3 text-xs" style={{ color: 'var(--success)' }}>★★★★★ Positive</div>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Great seller! Item arrived exactly as described and shipping was super fast.</p>
                            </div>
                        ))}
                    </div>
                 </div>
            )}

        </div>
      </div>
    </div>
  );
}

// --- Local Sub-Components ---

function TabButton({ label, icon: Icon, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className="px-6 py-3 font-medium transition-all relative flex items-center gap-2"
            style={{ 
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            }}
        >
            <Icon size={18} />
            {label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t" style={{ backgroundColor: 'var(--accent)' }} />
            )}
        </button>
    );
}

function StatRow({ label, value, highlight }) {
    return (
        <div className="flex justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span className="font-bold" style={{ color: highlight ? 'var(--success)' : 'var(--text)' }}>{value}</span>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="py-12 text-center rounded-xl border border-dashed" style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-soft)' }}>
            <p style={{ color: 'var(--text-muted)' }}>{message}</p>
        </div>
    );
}

// --- Modified Header for Public View ---
function PublicProfileHeader({ userData }) {
    return (
      <div 
        className="rounded-2xl p-8 mb-8 shadow-lg border"
        style={{ backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar (Same as original) */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 overflow-hidden" style={{ borderColor: 'var(--accent)' }}>
              <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
            </div>
            {userData.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4"
                    style={{ backgroundColor: 'var(--success)', borderColor: 'var(--bg-soft)' }}>
                    <ShieldCheck size={20} className="text-white" />
                </div>
            )}
          </div>
  
          {/* Info (No Edit Buttons) */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{userData.name}</h1>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>@{userData.username}</p>
            
            {userData.bio && (
              <p className="mb-4 text-sm max-w-2xl mx-auto md:mx-0 italic" style={{ color: 'var(--text)' }}>"{userData.bio}"</p>
            )}
            
            {/* Public Stats Row */}
            <div className="flex items-center gap-6 justify-center md:justify-start pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
               <div className="text-center md:text-left">
                   <p className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Rating</p>
                   <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{userData.rating?.percentage}%</p>
               </div>
               <div className="text-center md:text-left">
                   <p className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Deals</p>
                   <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{(userData.wonAuctions?.length || 0) + (userData.soldItems?.length || 0)}</p>
               </div>
               <div className="text-center md:text-left">
                   <p className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Member Since</p>
                   <p className="text-sm font-medium mt-1" style={{ color: 'var(--text)' }}>{new Date(userData.createdAt || Date.now()).getFullYear()}</p>
               </div>
            </div>
          </div>

          {/* Action Buttons (Report / Share) */}
          <div className="flex gap-3">
             <button className="px-4 py-2 rounded-lg font-medium border text-sm hover:bg-[var(--bg-hover)] transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                Share Profile
             </button>
             <button className="px-4 py-2 rounded-lg font-medium border text-sm hover:bg-[var(--danger-soft)] transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}>
                Report
             </button>
          </div>
        </div>
      </div>
    );
}