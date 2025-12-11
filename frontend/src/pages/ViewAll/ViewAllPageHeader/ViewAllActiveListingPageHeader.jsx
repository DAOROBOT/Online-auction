import { Clock } from "lucide-react"

export default function ViewAllActiveListingPageHeader()
{
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Clock size={24} style={{ color: 'var(--accent)' }} />
                Active Listings
            </h2>
        </div>
    )
}