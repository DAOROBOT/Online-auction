import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNav } from '../../hooks/useNavigate.js';
import auctionService from '../../services/auctionService.js';

// Import Components
import ImageGallery from './ImageGallery';
import BiddingSection from './BiddingSection';
import Description from './Description';
import CommentsSection from './CommentsSection';
import BidHistory from './BidHistory'; // 
import { useAuth } from '../../contexts/AuthContext.jsx';


export default function ProductDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const nav = useNav();
  const [productCore, setProductCore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoreData = async () => {
      setLoading(true);
      try {
        const data = await auctionService.getById(id);
        setProductCore(data);
      } catch (error) {
        console.error('Error loading product core:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadCoreData();
  }, [id, user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!productCore) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  // Flag to indicate if auction has ended
  const ended = productCore.status === 'ended' || productCore.status === 'completed';

  const categoryName = productCore.category?.name || productCore.categoryName || productCore.category || 'Category';

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <button onClick={() => nav.home()} className="hover:text-[var(--text)] transition">Auctions</button>
          <span>/</span>
          <span className="truncate max-w-xs">{categoryName}</span>
          <span>/</span>
          <span className="font-medium text-[var(--text)] truncate max-w-xs">{productCore.title}</span>
        </nav>

        {/* GRID LAYOUT CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* --- CỘT TRÁI ---*/}
          <div className="lg:col-span-7 space-y-10">
            <ImageGallery productId={id} />
            
            <div className="space-y-8">
              <Description productId={id} isOwner={user?.userId === productCore.sellerId} />
              <CommentsSection productId={id} />
            </div>
          </div>

          {/* --- CỘT PHẢI  --- */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 space-y-6">
                {/* 1. Khu vực đặt giá*/}
                <BiddingSection product={productCore} ended={ended} />
                <BidHistory productId={id} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}