import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X, Plus, Info, Loader2, AlertCircle } from "lucide-react";
import { useNav } from "../hooks/useNavigate";
import { useAuth } from "../contexts/AuthContext";
import ImageUploadModal from '../components/ImageUploadModal';
import RichTextEditor from "../components/RichTextEditor";
import { auctionService } from "../services/auctionService"; // Sử dụng Service

export default function CreateAuction() {
  const nav = useNav();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Dữ liệu danh mục lấy từ API
  const [categories, setCategories] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", // HTML content từ RichTextEditor
    startingPrice: "", 
    stepPrice: "",
    buyNowPrice: "",
    categoryId: "", 
    images: [], // Mảng URL ảnh (Backend cần mảng này)
    endTime: "",
    autoExtend: true // Mặc định true (Yêu cầu nâng cao)
  });

  // 1. Load danh mục khi vào trang
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await auctionService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error loading categories", err);
        setError("Failed to load categories. Please refresh.");
      }
    };
    loadCategories();
  }, []);

  // 2. Xử lý khi Upload ảnh thành công (Nhận URL từ Modal)
  const handleImageSuccess = (url) => {
    setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // 3. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // --- Validation Client-side (Theo thang điểm) ---
    if (formData.images.length < 3) {
        setError("Requirements not met: Please upload at least 3 images.");
        window.scrollTo(0,0);
        return;
    }
    if (!formData.description || formData.description === '<p></p>') {
        setError("Description is required.");
        window.scrollTo(0,0);
        return;
    }
    if (new Date(formData.endTime) <= new Date()) {
        setError("End time must be in the future.");
        window.scrollTo(0,0);
        return;
    }
    if (Number(formData.stepPrice) <= 0) {
        setError("Step price must be greater than 0.");
        return;
    }
    if (formData.buyNowPrice && Number(formData.buyNowPrice) <= Number(formData.startingPrice)) {
        setError("Buy Now price must be greater than Starting price.");
        window.scrollTo(0,0);
        return;
    }

    setLoading(true);

    try {
        // Chuẩn bị payload gửi về Backend
        const payload = {
            ...formData,
            startingPrice: Number(formData.startingPrice),
            stepPrice: Number(formData.stepPrice),
            buyNowPrice: formData.buyNowPrice ? Number(formData.buyNowPrice) : null,
            categoryId: Number(formData.categoryId), // Convert sang số
            // endTime đã là string dạng datetime-local, Backend (Service) cần convert sang Date hoặc giữ nguyên tùy logic
            // Ở đây ta cứ gửi string ISO cho an toàn
            endTime: new Date(formData.endTime).toISOString()
        };

        // Gọi API
        await auctionService.create(payload);

        // Thành công -> Về trang chủ
        nav.home();
        
    } catch (err) {
        console.error(err);
        setError(err.message || "Failed to create auction");
        window.scrollTo(0,0);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => nav.back()} className="p-2 rounded-full hover:bg-[var(--bg-hover)]">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Create New Auction</h1>
            <p className="text-[var(--text-muted)]">List your item for thousands of bidders</p>
          </div>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3">
                <AlertCircle size={20} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. SECTION: IMAGES (Yêu cầu đồ án: Nhiều ảnh) */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Product Images</h3>
                    <span className={`text-xs px-2 py-1 rounded ${formData.images.length >= 3 ? 'bg-green-100 text-green-700' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}>
                        {formData.images.length}/3 Required
                    </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Danh sách ảnh đã upload */}
                    {formData.images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-[var(--border)]">
                            <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                            {idx === 0 && (
                                <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-1">
                                    Main Image
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Nút Upload */}
                    <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="aspect-square rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                    >
                        <Upload size={24} />
                        <span className="text-sm font-medium">Add Photo</span>
                    </button>
                </div>
            </div>

            {/* 2. SECTION: BASIC INFO */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] space-y-6">
                <h3 className="text-xl font-bold">Item Details</h3>
                
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">Item Title</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                        placeholder="e.g. Vintage Rolex Submariner 1980"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                {/* Category Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select 
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <optgroup key={cat.id} label={cat.name}>
                                {/* Nếu có subcategories thì map, nếu không thì render chính nó */}
                                {cat.subcategories && cat.subcategories.length > 0 ? (
                                    cat.subcategories.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))
                                ) : (
                                    <option value={cat.id}>{cat.name}</option>
                                )}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* Description - WYSIWYG EDITOR (Requirement) */}
                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <div className="min-h-[200px]">
                        <RichTextEditor 
                            value={formData.description} 
                            onChange={(html) => setFormData({...formData, description: html})} 
                        />
                    </div>
                </div>
            </div>

            {/* 3. SECTION: PRICING & TIMING */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] space-y-6">
                <h3 className="text-xl font-bold">Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Starting Price (VND)</label>
                        <input 
                            type="number" required min="0"
                            className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border)]"
                            value={formData.startingPrice}
                            onChange={e => setFormData({...formData, startingPrice: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Step Price (VND)</label>
                        <input 
                            type="number" required min="1"
                            className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border)]"
                            value={formData.stepPrice}
                            onChange={e => setFormData({...formData, stepPrice: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Buy Now Price (Optional)</label>
                        <input 
                            type="number" min="0"
                            className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border)]"
                            value={formData.buyNowPrice}
                            onChange={e => setFormData({...formData, buyNowPrice: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-2">End Date & Time</label>
                        <input 
                            type="datetime-local" required
                            className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] [color-scheme:dark]"
                            value={formData.endTime}
                            onChange={e => setFormData({...formData, endTime: e.target.value})}
                        />
                    </div>
                    
                    {/* Auto Extend Toggle (Yêu cầu nâng cao) */}
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                        <input 
                            type="checkbox" 
                            id="autoExtend"
                            className="w-5 h-5 accent-[var(--accent)]"
                            checked={formData.autoExtend}
                            onChange={e => setFormData({...formData, autoExtend: e.target.checked})}
                        />
                        <label htmlFor="autoExtend" className="text-sm font-medium cursor-pointer select-none">
                            Enable Auto-Extend
                            <span className="block text-xs text-[var(--text-muted)] font-normal">
                                Extends 5 mins if bid placed in last 5 mins
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-4">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-[var(--accent)] text-[#1a1205] py-4 rounded-xl font-bold text-lg hover:brightness-110 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                    {loading ? "Creating Listing..." : "Create Auction"}
                </button>
                <button 
                    type="button" 
                    onClick={() => nav.back()} 
                    disabled={loading}
                    className="flex-1 border border-[var(--border)] rounded-xl text-[var(--text)] font-semibold py-4 transition hover:bg-[var(--bg-hover)]"
                >
                    Cancel
                </button>
            </div>
        </form>
      </div>

      {/* Image Upload Modal Integration */}
      <ImageUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadSuccess={handleImageSuccess} // Truyền prop callback
        title="Upload Product Image"
      />
    </div>
  );
}