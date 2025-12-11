import { Star } from "lucide-react"

export default function ViewAllReviewPageHeader()
{
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Star size={24} style={{ color: 'var(--accent)' }} />
          Reviews & Ratings
        </h2>
      </div>
    )
}