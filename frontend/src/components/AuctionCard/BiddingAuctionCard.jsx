import { ArrowRight } from "lucide-react";

export default function BiddingAuctionCard({ product, onClick }) {
    const isWinning = product.isWinning;

    return (
        <div 
            onClick={onClick}
            className="flex items-center gap-4 p-4 rounded-xl border bg-[var(--card-bg)] hover:border-[var(--accent)] cursor-pointer transition-all group" 
            style={{ borderColor: 'var(--border)' }}
        >
            {/* Tiny Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-soft)] flex-shrink-0">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>

            {/* Info */}
            <div className="grow min-w-0">
                <h4 className="font-bold text-sm truncate pr-2" style={{ color: 'var(--text)' }}>{product.title}</h4>
                <div className="flex items-center gap-2 text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded font-bold ${isWinning ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isWinning ? 'Winning' : 'Outbid'}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>Ends in 2d 4h</span>
                </div>
            </div>

            {/* Price Stats */}
            <div className="text-right flex-shrink-0">
                <p className="text-xs uppercase font-bold text-[var(--text-muted)]">Your Bid</p>
                <p className="font-bold text-[var(--accent)]">${product.yourBid}</p>
            </div>
            
            <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
        </div>
    );
}