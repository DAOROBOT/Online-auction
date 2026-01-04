import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X, Plus, Info, Loader2 } from "lucide-react";
import { useNav } from "../hooks/useNavigate";
import { useAuth } from "../contexts/AuthContext"; // Thêm Auth context
import ImageUploadModal from '../components/ImageUploadModal';
import RichTextEditor from "../components/RichTextEditor";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function CreateAuction() {
  const nav = useNav();
  const { user } = useAuth(); // Lấy token để gửi request
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Dữ liệu danh mục
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", // HTML content từ RichTextEditor
    startingPrice: "", 
    stepPrice: "",
    buyNowPrice: "",
    categoryId: "", 
    images: [], // Mảng chứa URL ảnh sau khi upload
    endTime: "",
    autoExtend: true // Mặc định true theo yêu cầu đồ án để tăng trải nghiệm
  });

  // 1. Fetch Categories khi trang load
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error loading categories", err));
  }, []);

  // 2. Xử lý Upload ảnh (Nhận file từ Modal -> Upload -> Lưu URL)
  const handleImageUpload = async (file) => {
    const uploadData = new FormData();
    uploadData.append('image', file);
    
    // Lấy token
    const token = localStorage.getItem('authToken');

    try {
        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: uploadData
        });
        const data = await res.json();
        
        if (res.ok) {
            // Thêm URL vào mảng images
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, data.url]
            }));
            setIsUploadModalOpen(false); // Đóng modal
        } else {
            alert("Upload failed: " + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Error uploading image");
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // 3. Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation cơ bản phía Client
    if (formData.images.length < 3) {
        setError("Please upload at least 3 images as required.");
        window.scrollTo(0,0);
        return;
    }
    if (!formData.description) {
        setError("Please provide a detailed description.");
        window.scrollTo(0,0);
        return;
    }

    setLoading(true);
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`${API_URL}/auction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ...formData,
                startingPrice: Number(formData.startingPrice),
                stepPrice: Number(formData.stepPrice),
                buyNowPrice: formData.buyNowPrice ? Number(formData.buyNowPrice) : null,
                // Chuyển endTime từ datetime-local string sang ISO string
                endTime: new Date(formData.endTime).toISOString() 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create auction');
        }

        // Thành công -> Redirect về trang chủ hoặc trang chi tiết
        nav.home();
        
    } catch (err) {
        setError(err.message);
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
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. SECTION: IMAGES (Requirement: Multiple Images) */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Product Images</h3>
                    <span className="text-xs px-2 py-1 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                        Required: At least 3 photos
                    </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Danh sách ảnh đã upload */}
                    {formData.images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-[var(--border)]">
                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                            {idx === 0 && (
                                <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-1">
                                    Cover Image
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

                {/* Category & Subcategory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select 
                            required
                            className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                            onChange={(e) => {
                                const catId = parseInt(e.target.value);
                                setFormData({...formData, categoryId: catId});
                                // Tìm subcategories (giả sử backend trả về cấu trúc lồng nhau hoặc lọc ở frontend)
                                const selectedCat = categories.find(c => c.id === catId);
                                setSubcategories(selectedCat?.subcategories || []); 
                            }}
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description - WYSIWYG EDITOR (Requirement) */}
                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <RichTextEditor 
                        value={formData.description} 
                        onChange={(html) => setFormData({...formData, description: html})} 
                    />
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
                    
                    {/* Auto Extend Toggle */}
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                        <input 
                            type="checkbox" 
                            id="autoExtend"
                            className="w-5 h-5 accent-[var(--accent)]"
                            checked={formData.autoExtend}
                            onChange={e => setFormData({...formData, autoExtend: e.target.checked})}
                        />
                        <label htmlFor="autoExtend" className="text-sm font-medium cursor-pointer">
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
                    className="flex-1 bg-[var(--accent)] text-[#1a1205] py-4 rounded-xl font-bold text-lg hover:brightness-110 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                    {loading ? "Creating..." : "Create Auction"}
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
        onUpload={handleImageUpload}
        title="Upload Product Image"
      />
    </div>
  );
}