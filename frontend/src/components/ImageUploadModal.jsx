import { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Check, Loader2 } from 'lucide-react';

export default function ImageUploadModal({ isOpen, onClose, onUpload, title = "Upload Image" }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const inputRef = useRef(null);

  useEffect(() => {
    const shouldBlur = isOpen;
    window.dispatchEvent(new CustomEvent('toggle-modal-blur', { detail: shouldBlur }));
    return () => {
        window.dispatchEvent(new CustomEvent('toggle-modal-blur', { detail: false }));
    };
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
        setPreview(null);
        setSelectedFile(null);
        setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Drag Events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Manual Selection
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process File
  const handleFile = (file) => {
    if (file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image file.");
    }
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    if (selectedFile) {
      try {
        setIsUploading(true);
        // We await the parent's upload function. 
        // This keeps the modal open and showing the spinner until Cloudinary responds.
        await onUpload(selectedFile);
      } catch (error) {
        console.error("Upload failed", error);
        // If error, we stop loading so user can try again
        setIsUploading(false);
      }
      // Note: We don't need to close or setUploading(false) on success 
      // because the parent (ProfileSidebar) will close the modal (unmount this component).
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-(--card-bg) border border-(--border) rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <h3 className="font-bold text-lg text-(--text)">{title}</h3>
          <button 
            onClick={!isUploading ? onClose : undefined} 
            className={`p-2 rounded-full transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-(--bg-hover) text-(--text-muted)'}`}
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {preview ? (
            // Preview State
            <div className="relative aspect-square rounded-xl overflow-hidden border border-(--border) bg-(--bg)">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                
                {/* Only show remove button if not currently uploading */}
                {!isUploading && (
                    <button 
                        onClick={() => { setPreview(null); setSelectedFile(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Loading Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <Loader2 size={40} className="text-white animate-spin" />
                    </div>
                )}
            </div>
          ) : (
            // Upload State
            <div 
              className={`
                relative flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl transition-all duration-200
                ${dragActive 
                  ? 'border-(--accent) bg-(--accent-soft)/10 scale-[1.02]' 
                  : 'border-(--border-strong) bg-(--bg-soft) hover:border-(--text-muted)'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                ref={inputRef} 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleChange} 
              />
              
              <div className="p-4 rounded-full bg-(--bg) shadow-sm mb-4">
                <UploadCloud size={32} className={dragActive ? "text-(--accent)" : "text-(--text-muted)"} />
              </div>
              
              <p className="text-sm font-medium text-(--text) mb-1">
                Click or drag image here
              </p>
              <p className="text-xs text-(--text-muted)">
                PNG, JPG up to 10MB
              </p>
              
              <button 
                onClick={() => inputRef.current?.click()}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-bold bg-(--text) text-(--bg) hover:opacity-90 transition-opacity"
              >
                Select File
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-(--bg-soft) border-t border-(--border)] flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${isUploading 
                    ? 'text-(--text-muted) opacity-50 cursor-not-allowed' 
                    : 'text-(--text-muted) hover:text-(--text)] over:bg-(--bg-hover)'
                }
            `}
          >
            Cancel
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className={`
                px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all
                ${!selectedFile || isUploading
                    ? 'bg-(--border) text-(--text-muted) cursor-not-allowed'
                    : 'bg-(--accent) text-[#1a1205] hover:brightness-110 shadow-lg shadow-(--accent)/20' 
                }
            `}
          >
            {isUploading ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                </>
            ) : (
                <>
                    <Check size={16} />
                    Save Changes
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}