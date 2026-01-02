import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X, Plus, Info } from "lucide-react";
import { useNav } from "../hooks/useNavigate";
import ImageUploadModal from '../components/ImageUploadModal';
import RichTextEditor from "../components/RichTextEditor";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function CreateAuction() {
  const nav = useNav();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const [formData, setFormData] = useState({ 
    title: "", 
    briefDescription: "",
    description: "", 
    startingPrice: "", 
    stepPrice: "",
    buyNowPrice: "",
    categoryId: "", 
    subcategoryId: "",
    images: [], // Array of image objects { file, preview }
    endTime: "",
    autoExtend: false
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const selectedCategory = categories.find(cat => cat.id === parseInt(formData.categoryId));
      setSubcategories(selectedCategory?.subcategories || []);
      setFormData(prev => ({ ...prev, subcategoryId: "" }));
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    setError(null);
  };

  const handleDescriptionChange = (value) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleImageUpload = (file) => {
    if (formData.images.length >= 10) {
      setError("Maximum 10 images allowed");
      return;
    }
    const preview = URL.createObjectURL(file);
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, { file, preview }] 
    }));
    setIsUploadModalOpen(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Product name is required";
    if (formData.images.length < 3) return "At least 3 images are required";
    if (!formData.startingPrice || parseFloat(formData.startingPrice) <= 0) return "Initial price must be greater than 0";
    if (!formData.stepPrice || parseFloat(formData.stepPrice) <= 0) return "Step price must be greater than 0";
    if (!formData.categoryId) return "Please select a category";
    if (subcategories.length > 0 && !formData.subcategoryId) return "Please select a subcategory";
    if (!formData.description.trim()) return "Full description is required";
    if (!formData.endTime) return "End time is required";
    
    const endDate = new Date(formData.endTime);
    if (endDate <= new Date()) return "End time must be in the future";
    
    if (formData.buyNowPrice && parseFloat(formData.buyNowPrice) <= parseFloat(formData.startingPrice)) {
      return "Buy now price must be greater than starting price";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual API call to create auction
      // This would typically:
      // 1. Upload images to storage (e.g., Cloudinary, S3)
      // 2. Create auction record with image URLs
      
      console.log('Form data:', formData);
      
      // Simulated success for now
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => nav.home(), 2000);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create auction');
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--input-bg)",
    borderColor: "var(--input-border)",
    color: "var(--text)",
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8 text-(--text)">
          <button onClick={() => nav.back()} className="p-2 rounded-lg hover:bg-(--bg-hover) transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold">Create New Auction</h1>
        </div>

        <div className="rounded-xl shadow-xl p-8 bg-(--card-bg) border border-(--border)">
           
          {success && (
            <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-lg border border-green-200">
              ✓ Auction created successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg border border-red-200">
              ✕ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Product Name */}
            <div>
              <label className="block text-sm text-(--text) font-medium mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="Enter product name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--accent) outline-none transition"
                style={inputStyle} 
                disabled={loading}
              />
            </div>

            {/* Product Images */}
            <div>
              <label className="block text-sm text-(--text) font-medium mb-2">
                Product Images <span className="text-red-500">*</span>
                <span className="text-(--text-muted) font-normal ml-2">(Minimum 3, Maximum 10)</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Existing images */}
                {formData.images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-(--border) group">
                    <img src={img.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-(--accent) text-xs font-bold px-2 py-1 rounded text-[#1A1205]">
                        Primary
                      </span>
                    )}
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-600 transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                
                {/* Add image button */}
                {formData.images.length < 10 && (
                  <button 
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="aspect-square border-2 border-dashed border-(--border-subtle) rounded-xl flex flex-col items-center justify-center gap-2 transition hover:border-(--accent) hover:bg-(--bg-hover)"
                    style={inputStyle}
                  >
                    <Plus size={24} className="text-(--text-muted)" />
                    <span className="text-xs text-(--text-muted)">Add Image</span>
                  </button>
                )}
              </div>
              
              {formData.images.length < 3 && (
                <p className="text-sm text-(--warning) mt-2 flex items-center gap-1">
                  <Info size={14} />
                  {3 - formData.images.length} more image(s) required
                </p>
              )}
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-(--text) font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select 
                  name="categoryId" 
                  value={formData.categoryId} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--accent) outline-none transition"
                  style={inputStyle} 
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-(--text) font-medium mb-2">
                  Subcategory {subcategories.length > 0 && <span className="text-red-500">*</span>}
                </label>
                <select 
                  name="subcategoryId" 
                  value={formData.subcategoryId} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--accent) outline-none transition"
                  style={inputStyle} 
                  disabled={loading || !formData.categoryId || subcategories.length === 0}
                >
                  <option value="">
                    {!formData.categoryId ? "Select a category first" : 
                     subcategories.length === 0 ? "No subcategories" : "Select a subcategory"}
                  </option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-(--text) font-medium mb-2">
                  Initial Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)">$</span>
                  <input 
                    type="number" 
                    name="startingPrice" 
                    value={formData.startingPrice} 
                    onChange={handleChange} 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--accent) outline-none transition"
                    style={inputStyle} 
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-(--text) font-medium mb-2">
                  Step Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)">$</span>
                  <input 
                    type="number" 
                    name="stepPrice" 
                    value={formData.stepPrice} 
                    onChange={handleChange} 
                    placeholder="1.00" 
                    step="0.01" 
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--accent) outline-none transition"
                    style={inputStyle} 
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-(--text-muted) mt-1">Minimum bid increment</p>
              </div>
              
              <div>
                <label className="block text-sm text-(--text) font-medium mb-2">
                  Buy Now Price <span className="text-(--text-muted) font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)">$</span>
                  <input 
                    type="number" 
                    name="buyNowPrice" 
                    value={formData.buyNowPrice} 
                    onChange={handleChange} 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--accent) outline-none transition"
                    style={inputStyle} 
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-(--text-muted) mt-1">Instant purchase price</p>
              </div>
            </div>

            {/* Brief Description */}
            <div>
              <label className="block text-sm text-(--text) font-medium mb-2">
                Brief Description <span className="text-(--text-muted) font-normal">(Optional - shown in listings)</span>
              </label>
              <textarea
                name="briefDescription"
                value={formData.briefDescription}
                onChange={handleChange}
                placeholder="A short summary of your product (max 500 characters)"
                maxLength={500}
                rows={2}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--accent) outline-none transition resize-none"
                style={inputStyle}
                disabled={loading}
              />
              <p className="text-xs text-(--text-muted) mt-1 text-right">
                {formData.briefDescription.length}/500
              </p>
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-sm text-(--text) font-medium mb-2">
                Full Description <span className="text-red-500">*</span>
              </label>
              <RichTextEditor 
                value={formData.description} 
                onChange={handleDescriptionChange} 
              />
              <p className="text-xs text-(--text-muted) mt-1">
                Detailed description including condition, dimensions, history, etc.
              </p>
            </div>

            {/* End Time & Auto Extend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-(--text) font-medium mb-2">
                  Auction End Time <span className="text-red-500">*</span>
                </label>
                <input 
                  type="datetime-local" 
                  name="endTime" 
                  value={formData.endTime} 
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-(--accent) outline-none transition"
                  style={inputStyle} 
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="autoExtend"
                    checked={formData.autoExtend}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-2 border-(--input-border) text-(--accent) focus:ring-(--accent)"
                    disabled={loading}
                  />
                  <div>
                    <span className="text-sm text-(--text) font-medium">Auto-extend</span>
                    <p className="text-xs text-(--text-muted)">
                      Extend end time by 10 mins if bid placed in last 10 mins
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-(--border)">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-(--accent) text-[#1A1205] font-bold py-3 px-6 rounded-lg transition hover:brightness-110 shadow-lg disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Auction"}
              </button>
              <button 
                type="button" 
                onClick={() => nav.back()} 
                disabled={loading}
                className="flex-1 border border-(--border) rounded-lg text-(--text) font-semibold py-3 px-6 transition hover:bg-(--bg-hover)"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-6 rounded-lg bg-(--bg-subtle) border border-(--border-subtle)">
          <h3 className="text-lg text-(--text) font-semibold mb-4">📝 Tips for Success</h3>
          <ul className="space-y-2 text-sm text-(--text-muted)">
            <li>✓ Use clear, high-quality images from multiple angles</li>
            <li>✓ Write a detailed description including condition and dimensions</li>
            <li>✓ Set a competitive starting price to attract bidders</li>
            <li>✓ Choose the most specific subcategory for better visibility</li>
            <li>✓ Enable auto-extend to maximize final bid price</li>
          </ul>
        </div>
      </div>

      <ImageUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleImageUpload}
        title="Upload Product Image"
      />
    </div>
  );
}