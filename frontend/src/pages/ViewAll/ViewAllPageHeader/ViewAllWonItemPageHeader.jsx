import { Trophy } from "lucide-react"

export default function ViewAllWonItemPageHeader()
{
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Trophy size={24} style={{ color: 'var(--accent)' }} />
                Won Auctions
            </h2>
        </div>
    )
}