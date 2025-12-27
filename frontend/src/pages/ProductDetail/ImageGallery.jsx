import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const nextImage = () => {
    if (product && product.images) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (!product) return null;

  return (
    <div className="space-y-2">
      {/* Main Hero Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-(--border) group bg-white dark:bg-black/20">
        <img 
          src={product.images?.[selectedImage] || product.image} 
          alt={product.title}
          className="w-full h-full object-contain"
        />
        
        {/* Navigation Arrows (Only if multiple) */}
        {product.images && product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              // REDESIGNED: Removed backdrop-blur & opacity-0. Made solid and always visible.
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-lg"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              // REDESIGNED: Removed backdrop-blur & opacity-0. Made solid and always visible.
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-lg"
            >
              <ChevronRight size={24} />
            </button>
            
            {/* Badge Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold tracking-widest shadow-md">
              {selectedImage + 1} / {product.images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {product.images && product.images.length > 0 && (
        <div className="flex gap-4 overflow-x-auto p-2 custom-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx 
                    ? 'border-(--accent) ring-2 ring-(--accent) ring-opacity-30 scale-105' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
        </div>
      )}
    </div>
  );
}