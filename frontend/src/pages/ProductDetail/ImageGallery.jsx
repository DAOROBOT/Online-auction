import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import auctionService from '../../services/auctionService'; // Import Service

export default function ImageGallery({ productId }) { // Nhận productId
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tự fetch ảnh
  useEffect(() => {
    const fetchImages = async () => {
        try {
            const data = await auctionService.getImages(productId);
            setImages(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    if (productId) fetchImages();
  }, [productId]);

  const nextImage = () => setImages(prev => prev.length ? (selectedImage + 1) % prev.length : 0);
  const prevImage = () => setImages(prev => prev.length ? (selectedImage - 1 + prev.length) % prev.length : 0);

  if (loading) return <div className="h-96 bg-gray-100 animate-pulse rounded-xl"></div>;
  if (!images || images.length === 0) return <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center">No Images</div>;

  // Xử lý lấy URL ảnh (tùy backend trả về object hay string)
  const getImgUrl = (img) => img.imageUrl || img.image_url || img; 

  return (
    <div className="space-y-2">
      {/* Main Hero Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] group bg-white dark:bg-black/20">
        <img 
          src={getImgUrl(images[selectedImage])} 
          alt="Product"
          className="w-full h-full object-contain"
        />
        
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 shadow-lg">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 shadow-lg">
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto p-2 custom-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx 
                    ? 'border-[var(--accent)] ring-2 ring-[var(--accent)] ring-opacity-30 scale-105' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={getImgUrl(img)} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}