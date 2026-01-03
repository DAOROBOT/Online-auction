import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNav } from '../../hooks/useNavigate';

import { 
  MapPin, Calendar, Link as LinkIcon, Share2, MoreHorizontal, ShieldCheck, 
  MessageCircle, UserPlus, Camera, ThumbsUp, ThumbsDown, LogOut, Save, X
} from "lucide-react";

import ImageUploadModal from '../../components/ImageUploadModal';

export default function ProfileSidebar({ userData, isOwnProfile }) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        name: userData.name || "",
        bio: userData.bio || "",
        location: "San Francisco, CA", // Default based on previous UI
        website: `aurum.com/u/${userData.username}`
    });

    const { logout } = useAuth();
    const nav = useNav();
    
    const handleAvatarUpload = async (file) => {
        try {
            // 1. Prepare FormData
            const formData = new FormData();
            formData.append('image', file); // 'image' must match the backend upload.single('image')

            // 2. Get Token (if route is protected)
            const token = localStorage.getItem('authToken');

            // 3. Send to Backend
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                headers: {
                    // Do NOT set Content-Type here
                    'Authorization': `Bearer ${token}` 
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            console.log("Uploaded Image URL:", data.url);

            // 4. Update the user's profile with the new URL
            // You likely need a separate API call here to save this URL to your User table
            await updateUserProfileImage(data.url); 

            setIsUploadModalOpen(false);
            // Refresh user data or context here
            window.location.reload(); // Temporary refresh to see changes

        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image");
        }
    };

    // Helper function to save URL to DB (Example)
    const updateUserProfileImage = async (imageUrl) => {
        const token = localStorage.getItem('authToken');
        await fetch('http://localhost:3000/user/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ avatar: imageUrl })
        });
    };

    // Logout Handler
    const handleLogout = () => {
        if(confirm("Are you sure you want to log out?")) {
            logout();
            nav.home();
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle Save
    const handleSave = () => {
        // In a real app, you would send formData to an API here
        console.log("Saving profile:", formData);
        setIsEditing(false);
    };

    return (
        <div className="relative overflow-hidden">

            {/* Content Section */}
            <div className="px-6 pb-6 relative text-center">
                
                {/* AVATAR AREA */}
                <div className="relative mt-8 mb-6 inline-block transition-all">
                    <div className="relative group">
                        {/* Avatar Image */}
                        <div className="w-40 h-40 rounded-full border-[6px] border-(--bg-hover) shadow-md overflow-hidden bg-white">
                            <img 
                                src={userData.avatar} 
                                alt={userData.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                        </div>

                        {/* AVATAR BUTTON */}
                        {isOwnProfile && (
                            <button 
                                onClick={() => setIsUploadModalOpen(true)}
                                className="absolute bottom-2 right-2 p-2 rounded-full bg-(--card-bg) text-(--text) shadow-lg hover:scale-110 transition-transform border-4 border-(--bg-hover)"
                            >
                                <Camera size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    // --- EDIT MODE FORM ---
                    <div className="space-y-4 text-left animate-in fade-in duration-200">
                        <div>
                            <label className="block text-xs font-bold text-(--text-muted) uppercase mb-1">Display Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-(--accent) outline-none"
                                style={{ borderColor: 'var(--border)' }}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-(--text-muted) uppercase mb-1">Bio</label>
                            <textarea 
                                name="bio"
                                rows="3"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full px-3 py-2 rounded-lg border bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-(--accent) outline-none resize-none"
                                style={{ borderColor: 'var(--border)' }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-(--text-muted) uppercase mb-1">Location</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                                <input 
                                    type="text" 
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-(--accent) outline-none"
                                    style={{ borderColor: 'var(--border)' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-(--text-muted) uppercase mb-1">Website / Link</label>
                            <div className="relative">
                                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                                <input 
                                    type="text" 
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border bg-(--input-bg) text-(--text) focus:ring-2 focus:ring-(--accent) outline-none"
                                    style={{ borderColor: 'var(--border)' }}
                                />
                            </div>
                        </div>

                        {/* Edit Actions */}
                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={handleSave}
                                className="flex-1 py-2 rounded-lg font-bold bg-(--accent) text-[#1a1205] shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Save
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="flex-1 py-2 rounded-lg font-bold border border-(--border) text-(--text-muted) hover:bg-(--bg-hover) transition-all flex items-center justify-center gap-2"
                            >
                                <X size={18} /> Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- VIEW MODE ---
                    <>
                        {/* Identity Info */}
                        <div className="mb-5">
                            <h2 className="text-2xl font-bold text-(--text) leading-tight">{userData.name}</h2>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="text-sm font-medium text-(--accent)">@{userData.username}</span>
                                <span className="h-1 w-1 rounded-full bg-(--text-muted) opacity-30"></span>
                                <span className="text-xs font-bold uppercase tracking-wider text-(--text-muted) border border-(--border) px-2 py-0.5 rounded-md bg-(--bg-soft)">
                                    {userData.role || "Member"}
                                </span>
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-(--text-muted) leading-relaxed mb-6 line-clamp-3 max-w-xs mx-auto">
                            {userData.bio || "No bio provided."}
                        </p>

                        {/* Mini Stats Row */}
                        <div className="flex items-center justify-between py-4 border-y border-(--border) mb-6 bg-(--bg-soft)/30 -mx-6 px-6 backdrop-blur-sm">
                            <div className="text-center flex-1">
                                <div className="text-lg font-bold text-(--text)">{userData.wonAuctions?.length || 0}</div>
                                <div className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider">Won</div>
                            </div>
                            <div className="w-px h-8 bg-(--border)" />
                            <div className="text-center flex-1">
                                <div className="text-lg font-bold text-(--text)">{userData.activeBids?.length || 0}</div>
                                <div className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider">Active</div>
                            </div>
                            <div className="w-px h-8 bg-(--border)"></div>
                            <div className="text-center flex-1">
                                <div className="text-lg font-bold text-(--success)">{userData.rating?.percentage || 100}%</div>
                                <div className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider">Trust</div>
                            </div>
                        </div>

                        {/* Contact & Meta Details */}
                        <div className="flex justify-around lg:flex-col gap-3 mb-8 text-left w-full mx-auto">
                            <div className="flex items-center gap-3 text-sm text-(--text-muted) group/item">
                                <div className="p-1.5 rounded-md bg-(--bg-soft) text-(--text-muted) group-hover/item:text-(--accent) transition-colors">
                                        <MapPin size={14} />
                                </div>
                                <span>{formData.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-(--text-muted) group/item">
                                <div className="p-1.5 rounded-md bg-(--bg-soft) text-(--text-muted) group-hover/item:text-(--accent) transition-colors">
                                        <LinkIcon size={14} />
                                </div>
                                <a href="#" className="hover:text-(--accent) transition-colors truncate hover:underline decoration-(--accent) decoration-2 underline-offset-4">
                                    {formData.website}
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-(--text-muted) group/item">
                                <div className="p-1.5 rounded-md bg-(--bg-soft) text-(--text-muted) group-hover/item:text-(--accent) transition-colors">
                                        <Calendar size={14} />
                                </div>
                                <span>Joined March 2023</span>
                            </div>
                        </div>

                        {/* Main CTA Buttons */}
                        <div className="flex gap-3">
                            {isOwnProfile && (
                                <>
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        className="flex-1 py-3 rounded-xl font-bold bg-(--text) text-(--bg) hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        Edit Profile
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        title="Log Out"
                                        className="p-3 rounded-xl border border-(--border) hover:bg-red-50 dark:hover:bg-red-900/10 text-(--text) hover:text-red-600 hover:border-red-200 transition-colors"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* IMAGE UPLOAD MODAL */}
            <ImageUploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)} 
                onUpload={handleAvatarUpload}
                title="Update Profile Picture"
            />
        </div>
    );
}