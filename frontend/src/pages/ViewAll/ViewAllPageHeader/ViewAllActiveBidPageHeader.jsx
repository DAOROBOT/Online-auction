import { Gavel } from "lucide-react"

export default function ViewAllActiveBidPageHeader()
{
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Gavel size={24} style={{ color: 'var(--accent)' }} />
                Active Bids
            </h2>
        </div>
    )
}