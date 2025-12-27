import { Trophy, Users, Gavel } from "lucide-react";
import { useNav } from '../../hooks/useNavigate';
import Hero from "./Hero";
import ProductTabs from "./ProductTabs";
import TopBidders from "./TopBidders";
import CTA from "./CTA";
import './HomePage.css'

export default function HomePage() {
    const nav = useNav();

    return (
        <div className="min-h-screen pb-12 relative text-stone-100 transition-colors duration-500">
            
            {/* --- GLOBAL BACKGROUND ORBS --- */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none animate-pulse -z-30 transition-all duration-500
                bg-[#7C00FE]/5 dark:bg-[#7C00FE]/20"
            ></div>

            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none -z-30 transition-all duration-500
                bg-[#F5004F]/5 dark:bg-[#F5004F]/20"
            ></div>

            {/* --- CONTENT START --- */}

            {/* 1. HERO */}
            <div className="mb-8">
                <Hero />
            </div>

            {/* 2. LIVE STATS CARD */}
            <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden mb-12 relative z-10 transition-all duration-300 home-glass-card">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x" style={{ borderColor: 'var(--home-stats-divider)' }}>
                        <div className="space-y-1">
                            <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}>$2.4M+</p>
                            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-subtle)" }}>Volume Traded</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-bold" style={{ color: "var(--info)" }}>12k+</p>
                            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-subtle)" }}>Active Bidders</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-bold" style={{ color: "var(--success)" }}>850+</p>
                            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-subtle)" }}>Live Auctions</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-bold" style={{ color: "var(--warning)" }}>99.9%</p>
                            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-subtle)" }}>Verified Sellers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. PRODUCT TABS */}
            <div className="max-w-8xl mx-auto rounded-3xl overflow-hidden mb-12 relative z-10 transition-all duration-300 py-8">
                <ProductTabs />
            </div>

            {/* 4. HOW IT WORKS */}
            <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden mb-12 relative z-10 transition-all duration-300 home-process-card py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>Start Bidding in Minutes</h2>
                        <p className="text-lg" style={{ color: "var(--text-muted)" }}>We've streamlined the experience so you can focus on winning.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative px-4">
                        {/* Dashed Line Connector (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed" 
                             style={{ borderColor: "var(--home-process-line)" }}></div>

                        {[
                            { icon: Users, title: "Create Account", desc: "Sign up for free and verify your identity.", color: "var(--accent)" },
                            { icon: Gavel, title: "Place Your Bid", desc: "Find unique items and place your best bid.", color: "var(--info)" },
                            { icon: Trophy, title: "Win & Collect", desc: "Secure payment and track your delivery.", color: "var(--success)" }
                        ].map((step, idx) => (
                            <div key={idx} className="relative flex flex-col items-center text-center group">
                                {/* Circle Icon */}
                                <div className="home-step-circle w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110">
                                    <step.icon className="w-10 h-10" style={{ color: step.color }} />
                                </div>
                                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>{idx + 1}. {step.title}</h3>
                                <p className="text-sm px-4" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. TOP BIDDERS / HALL OF FAME (Themed) */}
            <TopBidders />

            {/* 6. CTA SECTION */}
            <CTA />

        </div>
    );
}