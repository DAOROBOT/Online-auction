import { useEffect, useState } from "react";

import systemService from "../../services/systemService";

export default function LiveStatCard(){
    const [stats, setStats] = useState({
        tradedSuccess: "",
        activeBidders: "",
        liveAuctions: "",
        verifiedSellers: "",
    });

    useEffect(() => {
        const fetchLiveStats = async () => {
            try {
                const data = await systemService.updateLiveStat();
                console.log("Live stats data:", data);
                setStats(data);
            } catch (error) {
                console.error("Error fetching live stats:", error);
            }
        };
        
        fetchLiveStats();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x" style={{ borderColor: 'var(--home-stats-divider)' }}>
                <div className="space-y-1">
                    <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}>{stats.totalTradedSuccess}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-subtle)" }}>Traded Success</p>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold" style={{ color: "var(--info)" }}>{stats.totalActiveBidders}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-subtle)" }}>Total Bidders</p>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold" style={{ color: "var(--success)" }}>{stats.totalLiveAuctions}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-subtle)" }}>Live Auctions</p>
                </div>
                <div className="space-y-1">
                    <p className="text-3xl font-bold" style={{ color: "var(--warning)" }}>{stats.totalVerifiedSellers}</p>
                    <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-subtle)" }}>High Quality Sellers</p>
                </div>
            </div>
        </div>
    );
}