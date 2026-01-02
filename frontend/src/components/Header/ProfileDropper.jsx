import { useState, useRef, useEffect } from "react";
import { User, LogOut, Clock } from "lucide-react";
import { useNav } from '../../hooks/useNavigate';
import { mockUserData } from "../../data/users.js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ProfileDropper({ user, logout }) {
  const nav = useNav();
  const currentUser = user || mockUserData; // Fallback for UI testing

  const [isOpen, setIsOpen] = useState(false);
  const [sellerStatus, setSellerStatus] = useState(null);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Check seller request status (for sellers - show expiry countdown)
  useEffect(() => {
    const checkSellerStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token || currentUser?.role === 'admin') return;

        // Only check if user is a seller (to show expiry countdown)
        if (currentUser?.role !== 'seller') return;

        const response = await fetch(`${API_URL}/seller/my-request`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Show countdown for active sellers
          if (data.request?.status === 'approved' && data.statusInfo?.isActive) {
            setSellerStatus(data.statusInfo);
          }
        }
      } catch (err) {
        console.error('Error checking seller status:', err);
      }
    };

    checkSellerStatus();
  }, [currentUser?.role]);

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative hidden lg:block" ref={dropdownRef}>
      
      {/* --- TRIGGER: AVATAR --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-0.5 rounded-full transition-all duration-300 ${
          isOpen 
            ? "ring-2 ring-var(--accent) ring-offset-2 ring-offset-var(--bg-soft)" 
            : "hover:ring-2 hover:ring-(--border) hover:ring-offset-1 hover:ring-offset-(--bg-soft)"
        }`}
      >
        <img 
          src={currentUser.imgUrl} 
          alt="Profile" 
          className="w-9 h-9 rounded-full object-cover border border-(--border)" 
        />
        {/* Online Status Dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
      </button>

      {/* --- DROPDOWN PANEL --- */}
      {isOpen && (
        <div 
          className="absolute top-[calc(100%+0.75rem)] right-0 w-64 rounded-xl shadow-2xl border flex flex-col py-2 backdrop-blur-xl z-50 overflow-visible
          bg-(--card-bg) border-(--border) shadow-(--card-shadow) transition-all duration-200 origin-top-right"
        >
          {/* Decorative Arrow */}
          <div className="absolute -top-1.5 right-3.5 w-3 h-3 rotate-45 bg-(--card-bg) border-l border-t border-(--border)" />

          {/* 1. HEADER: User Info */}
          <div className="px-5 py-4 border-b border-(--border)">
              <p className="text-md font-bold text-(--text) truncate flex items-center gap-2">
                {currentUser.name}
                {currentUser.role === 'seller' && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-(--accent) text-[#1A1205]">
                    Seller
                  </span>
                )}
              </p>
              <p className="text-xs truncate font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {currentUser.email}
              </p>
              {/* Seller Expiry Countdown Badge */}
              {currentUser.role === 'seller' && sellerStatus?.isActive && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-(--warning) bg-(--warning-soft) px-2 py-1 rounded-md">
                  <Clock size={12} />
                  <span>Expires in {sellerStatus.daysRemaining} day{sellerStatus.daysRemaining > 1 ? 's' : ''}</span>
                </div>
              )}
          </div>
          
          {/* 2. MENU ITEMS */}
          <div className="py-2 px-2 flex flex-col gap-1">
            
            {/* Buyer Group */}
            <button
              onClick={() => handleAction(() => nav.profile(user.username))}
              className="w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-(--accent-soft) hover:text-(--accent-strong)"
            >
                <User size={16} className="transition-colors group-hover:text-(--accent)" />
                <span>My Profile</span>
            </button>
            
            {/* Logout */}
            <button
                onClick={() => handleAction(logout || (() => console.log('Logout')))}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-(--danger) font-medium transition-all duration-200 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
                <div className="p-1.5 rounded-md bg-(--danger-soft)">
                    <LogOut size={16} />
                </div>
                <span>Log out</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}