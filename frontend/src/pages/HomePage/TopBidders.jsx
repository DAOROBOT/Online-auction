import { useState, useEffect } from "react";
import { Trophy, Star } from "lucide-react";
import { useNav } from '../../hooks/useNavigate';

// --- MOCK DATA SOURCE ---
const MOCK_TOP_BIDDERS = [
    { id: 1, name: "Alex Morgan", avatar: "https://i.pravatar.cc/150?u=1", rank: 1, won: 42, rating: 98 },
    { id: 2, name: "Sarah Connor", avatar: "https://i.pravatar.cc/150?u=2", rank: 2, won: 35, rating: 96 },
    { id: 3, name: "John Wick", avatar: "https://i.pravatar.cc/150?u=3", rank: 3, won: 28, rating: 95 },
    { id: 4, name: "Bruce Wayne", avatar: "https://i.pravatar.cc/150?u=4", rank: 4, won: 22, rating: 99 },
    { id: 5, name: "Tony Stark", avatar: "https://i.pravatar.cc/150?u=5", rank: 5, won: 19, rating: 92 },
];

export default function TopBidders() {
    const nav = useNav();
    const [bidders, setBidders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBidders = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                setBidders(MOCK_TOP_BIDDERS);
            } catch (error) {
                console.error("Failed to fetch top bidders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBidders();
    }, []);

    // Helper to navigate to profile
    const goToProfile = (id) => {
        // Assuming your route is defined as path="/profile/:id"
        nav.go(`/profile/${id}`);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
                    <div className="flex gap-4 items-end">
                        <div className="w-40 h-64 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                        <div className="w-48 h-80 bg-gray-300 dark:bg-gray-600 rounded-t-lg"></div>
                        <div className="w-40 h-64 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    const champion = bidders[0];
    const silver = bidders[1];
    const bronze = bidders[2];
    const runnerUps = bidders.slice(3, 5);

    return (
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden mb-12 relative z-10 transition-all duration-300 home-leaderboard-container py-16">
            <div className="container mx-auto px-4">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-4 px-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl shadow-sm" style={{ backgroundColor: "var(--accent-soft)" }}>
                            <Trophy className="w-8 h-8" style={{ color: "var(--accent-strong)" }} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Hall of Fame</h2>
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Top 5 Bidders this month</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => nav.go('/leaderboard')} 
                        className="text-sm font-bold uppercase tracking-wider hover:underline transition-all" 
                        style={{ color: "var(--accent)" }}
                    >
                        View Full Leaderboard
                    </button>
                </div>

                {/* PODIUM GRID (Rank 1, 2, 3) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end px-4 mb-12">
                    
                    {/* Rank 2 (Silver) */}
                    {silver && (
                        <div 
                            onClick={() => goToProfile(silver.id)}
                            className="home-rank-card rounded-2xl shadow-lg p-6 flex flex-col items-center order-2 md:order-1 relative mt-8 md:mt-0 cursor-pointer hover:opacity-90"
                        >
                            <div className="absolute -top-4 bg-gray-200 text-gray-700 font-bold px-4 py-1 rounded-full shadow-sm text-sm border-2 border-white">
                                #2 Silver
                            </div>
                            <div className="w-20 h-20 rounded-full mb-4 overflow-hidden">
                                <img src={silver.avatar} alt={silver.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>{silver.name}</h3>
                            <p className="font-bold" style={{ color: "var(--info)" }}>{silver.won} Won</p>
                        </div>
                    )}

                    {/* Rank 1 (Gold / Champion) */}
                    {champion && (
                        <div 
                            onClick={() => goToProfile(champion.id)}
                            className="home-champion-card rounded-2xl p-8 flex flex-col items-center order-1 md:order-2 transform md:-translate-y-6 relative z-10 hover:-translate-y-8 transition-transform duration-300 cursor-pointer"
                        >
                            <div className="absolute -top-6 bg-linear-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-2 rounded-full shadow-lg text-base gap-2 flex items-center">
                                <Trophy className="w-4 h-4" /> #1 Champion
                            </div>
                            <div className="w-28 h-28 rounded-full border-4 mb-4 overflow-hidden shadow-xl" style={{ borderColor: "var(--accent)" }}>
                                <img src={champion.avatar} alt={champion.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>{champion.name}</h3>
                            <div className="flex items-center gap-1 mb-2 text-sm" style={{ color: "var(--accent-strong)" }}>
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-bold">{champion.rating}% Rating</span>
                            </div>
                            <p className="text-3xl font-extrabold" style={{ color: "var(--accent-strong)" }}>{champion.won} Won</p>
                        </div>
                    )}

                    {/* Rank 3 (Bronze) */}
                    {bronze && (
                        <div 
                            onClick={() => goToProfile(bronze.id)}
                            className="home-rank-card rounded-2xl shadow-lg p-6 flex flex-col items-center order-3 md:order-3 relative mt-8 md:mt-0 cursor-pointer hover:opacity-90"
                        >
                            <div className="absolute -top-4 bg-orange-200 text-orange-800 font-bold px-4 py-1 rounded-full shadow-sm text-sm">
                                #3 Bronze
                            </div>
                            <div className="w-20 h-20 rounded-full border-4 border-orange-200 mb-4 overflow-hidden">
                                <img src={bronze.avatar} alt={bronze.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>{bronze.name}</h3>
                            <p className="font-bold" style={{ color: "var(--info)" }}>{bronze.won} Won</p>
                        </div>
                    )}
                </div>

                {/* RUNNER UPS LIST (Rank 4 & 5) */}
                {runnerUps.length > 0 && (
                    <div className="max-w-3xl mx-auto rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
                        {runnerUps.map((bidder) => (
                            <div 
                                key={bidder.id} 
                                onClick={() => goToProfile(bidder.id)}
                                className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-(--bg-hover) transition-colors cursor-pointer group"
                                style={{ borderColor: "var(--border-subtle)" }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="font-bold w-8 text-center" style={{ color: "var(--text-subtle)" }}>#{bidder.rank}</span>
                                    <div className="w-10 h-10 rounded-full overflow-hidden border group-hover:border-(--accent) transition-colors" style={{ borderColor: "var(--border)" }}>
                                        <img src={bidder.avatar} alt={bidder.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold group-hover:text-(--accent) transition-colors" style={{ color: "var(--text)" }}>{bidder.name}</h4>
                                        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--accent)" }}>
                                            <Star className="w-3 h-3 fill-current" />
                                            {bidder.rating}% Rating
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold" style={{ color: "var(--info)" }}>{bidder.won} Won</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}