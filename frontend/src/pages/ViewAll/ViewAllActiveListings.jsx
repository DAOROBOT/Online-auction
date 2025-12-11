import { useState } from "react";
import { Clock, Eye, Users, TrendingUp, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FilterSection from "../../components/FilterSection";
import { mockUserData } from "../../data/users";

export default function ViewAllActiveListings() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const activeListings = mockUserData.activeListings || [];
    
    const totalListings = activeListings.length;
    const totalBids = activeListings.reduce((sum, item) => sum + item.totalBids, 0);
    const totalViews = activeListings.reduce((sum, item) => sum + (item.views || 0), 0);
    
    const formatTime = (endTime) => {
        const now = new Date();
        const diff = endTime - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h`;
        return 'Ending soon';
    };
    
    // Apply filters
    const filteredListings = activeListings.filter(item => {
        // Category filter
        if (filters.category && filters.category.length > 0) {
            if (!filters.category.includes(item.category)) return false;
        }

        // Price range filter
        if (filters.minPrice !== undefined && item.currentBid < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && item.currentBid > filters.maxPrice) return false;

        // Time remaining filter
        if (filters.timeRemaining && filters.timeRemaining !== 'any') {
            const now = new Date();
            const endTime = new Date(item.auctionEndTime);
            const hoursRemaining = (endTime - now) / (1000 * 60 * 60);

            switch (filters.timeRemaining) {
                case '1h':
                    if (hoursRemaining > 1 || hoursRemaining <= 0) return false;
                    break;
                case '24h':
                    if (hoursRemaining > 24 || hoursRemaining <= 0) return false;
                    break;
                case '3d':
                    if (hoursRemaining > 72 || hoursRemaining <= 0) return false;
                    break;
                case '7d':
                    if (hoursRemaining > 168 || hoursRemaining <= 0) return false;
                    break;
            }
        }

        return true;
    });

    // Apply sorting
    const sortedListings = [...filteredListings].sort((a, b) => {
        switch (filters.sortBy) {
            case 'bids-high':
                return (b.totalBids || 0) - (a.totalBids || 0);
            case 'bids-low':
                return (a.totalBids || 0) - (b.totalBids || 0);
            case 'price-low':
                return a.currentBid - b.currentBid;
            case 'price-high':
                return b.currentBid - a.currentBid;
            case 'ending-soon':
                return new Date(a.auctionEndTime) - new Date(b.auctionEndTime);
            case 'newly-listed':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'views-high':
                return (b.views || 0) - (a.views || 0);
            default:
                return 0;
        }
    });

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 transition-colors" style={{ color: 'var(--text-muted)' }}>
                        <ArrowLeft size={20} />
                        <span>Back to Profile</span>
                    </button>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--text)' }}>
                                <Clock size={32} style={{ color: 'var(--accent)' }} />
                                My Active Listings
                            </h1>
                            <p style={{ color: 'var(--text-muted)' }}>Manage your active auctions</p>
                        </div>
                        <button 
                            onClick={() => navigate('/create-auction')}
                            className="px-6 py-2 rounded-lg font-medium" 
                            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
                        >
                            Create New Listing
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-soft)' }}>
                            <div className="flex items-center gap-3">
                                <Clock size={24} style={{ color: 'var(--accent)' }} />
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Active Listings</p>
                                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{totalListings}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-soft)' }}>
                            <div className="flex items-center gap-3">
                                <Eye size={24} style={{ color: 'var(--info)' }} />
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Views</p>
                                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{totalViews}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-soft)' }}>
                            <div className="flex items-center gap-3">
                                <Users size={24} style={{ color: 'var(--success)' }} />
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Active Bidders</p>
                                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{totalBids}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-soft)' }}>
                            <div className="flex items-center gap-3">
                                <TrendingUp size={24} style={{ color: 'var(--warning)' }} />
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ending Today</p>
                                    <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                            <div className="p-6 rounded-xl sticky top-8" style={{ backgroundColor: 'var(--bg-soft)' }}>
                                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Filters</h3>
                                <FilterSection type="activeListing" onFilterChange={setFilters} />
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            {sortedListings.length === 0 ? (
                                <div className="text-center py-16 rounded-xl" style={{ backgroundColor: 'var(--bg-soft)' }}>
                                    <Clock size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>No Active Listings</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>Create your first auction listing</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {sortedListings.map(item => (
                                        <div key={item.id} className="rounded-xl overflow-hidden border hover:shadow-xl transition-all" style={{ backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                                            <div className="relative">
                                                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <button className="p-2 rounded-full" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                                                        <Edit size={16} style={{ color: 'var(--accent)' }} />
                                                    </button>
                                                    <button className="p-2 rounded-full" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                                                        <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>{item.title}</h3>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Current Bid</p>
                                                        <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>${item.currentBid}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Bids</p>
                                                        <p className="font-bold" style={{ color: 'var(--text)' }}>{item.totalBids}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {formatTime(item.endTime)}
                                                    </span>
                                                    <span>Watchers: {item.watchers || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    );
}
