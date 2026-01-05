import { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Check, Loader2 } from 'lucide-react';
import { auctionService } from '../services/auctionService';

export default function ImageUploadModal({ isOpen, onClose, onUpload, title = "Upload Image" }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const shouldBlur = isOpen;
    // Dispatch event để MainLayout có thể blur
    window.dispatchEvent(new CustomEvent('toggle-modal-blur', { detail: shouldBlur }));
    return () => {
        window.dispatchEvent(new CustomEvent('toggle-modal-blur', { detail: false }));
    };
  }, [isOpen]);

  // Reset state khi đóng modal
  useEffect(() => {
    if (!isOpen) {
        setPreview(null);
        setSelectedFile(null);
        setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
        // Dùng cách mới gọn hơn: URL.createObjectURL
        setPreview(URL.createObjectURL(file));
    } else {
        alert("Please upload an image file");
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
        // Mỗi component có cách xử lý ảnh khác nhau => sử dụng hàm onUpload riêng cho từng component thay vì dùng service upload
        // Profile Sidebar upload 1 ảnh duy nhất nên khi modal được submit, ảnh sẽ được gửi cho backend ngay lập tức.
        // Create Auction upload nhiều ảnh nên khi modal được submit, ảnh sẽ được lưu ở frontend tới khi toàn bộ form được gửi.
        onUpload(selectedFile); 
        onClose();
    } catch (error) {
        console.error(error);
        alert("Upload failed: " + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-(--bg-soft) rounded-2xl shadow-2xl border border-(--border) overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-(--border) flex justify-between items-center">
            <h3 className="font-bold text-lg">{title}</h3>
            <button onClick={onClose} disabled={isUploading} className="p-1 hover:bg-(--bg-hover) rounded-full transition-colors disabled:opacity-50">
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <div className="p-6">
            {!preview ? (
                <div 
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                        ${dragActive ? 'border-(--accent) bg-(--accent)/5' : 'border-(--border) hover:bg-(--bg-hover)'}
                    `}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleChange} />
                    <div className="w-16 h-16 rounded-full bg-(--bg-subtle) flex items-center justify-center mb-4">
                        <UploadCloud size={32} className="text-(--text-muted)" />
                    </div>
                    <p className="font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-(--text-muted)">SVG, PNG, JPG or GIF (max 5MB)</p>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border border-(--border)">
                    <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                    <button 
                        onClick={() => { setPreview(null); setSelectedFile(null); }}
                        disabled={isUploading}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors disabled:opacity-0"
                    >
                        <X size={16} />
                    </button>
                    
                    {/* Loading Overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                            <Loader2 size={40} className="text-white animate-spin" />
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-(--bg-subtle) border-t border-(--border) flex justify-end gap-3">
          <button onClick={onClose} disabled={isUploading} className="px-4 py-2 rounded-lg font-medium text-sm hover:bg-(--bg-hover) disabled:opacity-50">Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="px-6 py-2 rounded-lg font-bold text-sm bg-(--accent) text-[#1a1205] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? 'Uploading...' : <><Check size={16} /> Confirm Upload</>}
          </button>
        </div>
      </div>
    </div>
  );
}