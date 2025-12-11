import { Heart } from "lucide-react"

export default function ViewAllFavoriteProductPageHeader()
{
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Heart size={24} style={{ color: 'var(--danger)' }} />
                Favorite Products
            </h2>
        </div>
    )
}