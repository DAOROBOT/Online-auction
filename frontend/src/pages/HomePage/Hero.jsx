import { useAuth } from '../../contexts/AuthContext';
import { useNav } from '../../hooks/useNavigate';

export default function Hero() {
  const { user } = useAuth();
  const nav = useNav();

  const content = user 
    ? {
        tag: "Welcome Back",
        title: `Hello, ${user.email?.split('@')[0] || 'Bidder'}`, 
        highlight: "Ready to Win?",
        gradient: "from-[#F9E400] to-[#F5004F]", 
        description: "You are all set. Check out the latest listings or manage your active bids from your dashboard.",
        primaryBtn: { text: "Browse Auctions", action: nav.activeListings },
        secondaryBtn: { text: "My Dashboard", action: nav.me },
      }
    : {
        tag: "Premium Marketplace",
        title: "Discover Unique",
        highlight: "Treasures & Rarity",
        gradient: "from-[#00dbde] to-[#fc00ff]",
        description: "Join the world's most secure auction platform. Verify your identity in seconds and start bidding on exclusive collectibles today.",
        primaryBtn: { text: "Register Now", action: nav.register },
        secondaryBtn: { text: "About Us", action: () => nav.go('/about') },
      };

  return (
    <div className="relative min-h-[500px] flex items-center justify-center">
      
      {/* Main Content (Centered) */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
            
            {/* Tag Pill */}
            <div className="inline-block bg-white/10 backdrop-blur-md text-[#F9E400] text-xs font-bold px-4 py-1.5 rounded-full mb-8 border border-[#F9E400]/40 shadow-lg shadow-[#F9E400]/10">
              ● {content.tag}
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl text-[var(--text)] font-bold mb-8 leading-tight tracking-tight drop-shadow-2xl">
              {content.title} <br/>
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${content.gradient} filter drop-shadow-sm`}>
                  {content.highlight}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-2xl text-stone-300 mb-10 max-w-2xl font-light leading-relaxed drop-shadow-md">
              {content.description}
            </p>

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-5">
              <button 
                  onClick={content.primaryBtn.action}
                  className="bg-[#F5004F] hover:bg-[#d00043] text-white px-10 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-[#F5004F]/30 min-w-[200px]"
              >
                  {content.primaryBtn.text}
              </button>
              
              <button 
                  onClick={content.secondaryBtn.action}
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white px-10 py-4 rounded-full font-bold text-lg border border-white/20 transition-all hover:border-[#F9E400]/50 min-w-[200px]"
              >
                  {content.secondaryBtn.text}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};