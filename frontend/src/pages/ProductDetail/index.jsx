import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNav } from '../../hooks/useNavigate.js';
import { products as productService } from '../../data/index.js';
import ImageGallery from './ImageGallery'
import BiddingSection from './BiddingSection'
import Description from './Description';
import CommentsSection from './CommentsSection'
import BidHistory from './BidHistory';

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNav();
  const [product, setProduct] = useState(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  // const [bidAmount, setBidAmount] = useState('');
  // const [timeLeft, setTimeLeft] = useState({ timeLeft: '', urgencyLevel: 'normal' });
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      try {
        const productData = await productService.getById(id);
        if (productData) {
          setProduct(productData);
          setBidAmount(productData.currentPrice + productData.biddingStep);
          const commentsData = await productService.getComments(productData.id);
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Error loading product data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out this auction: ${product.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleWatchlistToggle = async () => {
    if (!product) return;
    try {
      const result = await productService.toggleWatchlist(product.id, isWatchlisted);
      if (result.success) {
        setIsWatchlisted(result.isWatchlisted);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-(--text-muted)">
          <button onClick={() => nav.home()} className="hover:text-(--text) transition">Auctions</button>
          <span>/</span>
          <span className="truncate max-w-xs">{product.category}</span>
          <span>/</span>
          <span className="font-medium text-(--text) truncate max-w-xs">{product.title}</span>
        </nav>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Visuals & Deep Info */}
          <div className="lg:col-span-7 space-y-10">
            <ImageGallery product={product} />
            
            <div className="space-y-8">
              <Description />

              <CommentsSection comments={comments} setComments={setComments} />
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Action Dashboard (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="top-24 space-y-6">
                
                {/* Main Bidding Card: Now handles Title, Actions, and Bidding */}
                <BiddingSection product={product} />
                
                {/* Secondary Stats */}
                <BidHistory productId={product.id} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}