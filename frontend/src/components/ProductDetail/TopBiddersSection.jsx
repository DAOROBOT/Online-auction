import { Crown } from 'lucide-react';
import { formatCurrency } from '../../utils/format.js';

export default function TopBiddersSection({ topBidders }) {
  return (
    <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <Crown className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        Top Bidders
      </h3>
      <div className="flex items-center justify-center gap-6">
        {topBidders && topBidders.length > 0 ? (
          topBidders.map((bidder, idx) => (
            <div key={bidder.id} className="flex flex-col items-center">
              <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 ${
                idx === 0 ? 'border-yellow-400 ring-2 ring-yellow-200' :
                idx === 1 ? 'border-gray-300 ring-2 ring-gray-200' :
                'border-orange-300 ring-2 ring-orange-200'
              }`}>
                <img src={bidder.avatar} alt={bidder.bidderName} className="w-full h-full object-cover" />
              </div>
              <div className="mt-2 text-center">
                <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  Top {bidder.rank}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatCurrency(bidder.amount)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No bids yet</p>
        )}
      </div>
    </div>
  );
}
