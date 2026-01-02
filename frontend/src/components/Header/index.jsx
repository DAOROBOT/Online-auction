import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useNav } from '../../hooks/useNavigate.js';
import { 
  Search, Menu, ArrowRight, Plus, LayoutDashboard 
} from 'lucide-react';

import CategoryDropper from './CategoryDropper.jsx';
import NotificationDropper from './NotificationDropper.jsx';
import ProfileDropper from './ProfileDropper.jsx';
import MobileMenu from './MobileMenu.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './Header.css'


export default function Header() {
  const inputRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const nav = useNav();
  const { user, logout } = useAuth(); // Assuming logout function exists
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    // Fetch categories from backend
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
     setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = () => {
    inputRef.current.foccus();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      nav.search(trimmed);
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* --- MAIN HEADER --- */}
      <header 
        className="sticky top-0 z-50 w-full backdrop-blur-md transition-colors duration-300 border-b"
        style={{ 
          backgroundColor: 'var(--header-bg)', 
          borderColor: 'var(--header-border)' 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* LEFT: Logo & Categories */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="shrink-0 cursor-pointer group">
                <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--header-text)' }}>
                  <span style={{ color: 'var(--theme-secondary)' }}>AURUM</span> AUCTIONS
                </Link>
                {/* Animated Underline */}
                <div className="h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-out" style={{ backgroundColor: 'var(--theme-secondary)' }}></div>
              </div>

              {/* Desktop Categories */}
              <CategoryDropper categories={categories} />
            </div>

            {/* CENTER: Search Bar */}
            <div className="max-w-2xl hidden md:flex flex-1 mx-8">
              <div 
                className="group relative w-full border rounded-full py-2.5 px-5 md:flex justify-center items-center gap-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-offset-transparent"
                style={{ 
                    backgroundColor: 'var(--header-input-bg)',
                    borderColor: 'var(--header-input-border)',
                    '--tw-ring-color': 'var(--header-input-focus)'
                }}
              >
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                  placeholder="Search for items, artists, or brands..." 
                  className="w-full bg-transparent outline-none text-sm transition-colors"
                  style={{ 
                    color: 'var(--header-text)',
                    '::placeholder': { color: 'var(--header-text-muted)' }
                  }}
                />
                <button 
                  onClick={handleSearch} 
                  className="p-1.5 rounded-full transition-transform group-focus-within:scale-110">
                    <Search size={18} style={{ color: 'var(--header-text-muted)' }} />
                </button>
              </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(true);
                  // Focus search input after menu opens
                  setTimeout(() => mobileSearchRef.current?.focus(), 100);
                }} 
                className="md:hidden p-2 hover:bg-(--header-hover) rounded-full transition-colors" 
                style={{ color: 'var(--header-text)' }}
              >
                <Search size={24} />
              </button>

              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-4">
                  
                  {/* DYNAMIC ACTION BUTTONS */}
                  <Link
                    to={user.role === 'admin' ? "/admin" : (user.role === 'seller') ? "/create-auction" : (user.role === 'buyer') ? "/become-seller" : "/verify-account"}
                    className="hidden sm:flex items-center gap-2 font-bold py-2 px-4 rounded-lg transition text-sm shadow-lg hover:shadow-xl hover:scale-105"
                    style={{ 
                      backgroundColor: user.role === 'admin' ? 'var(--text)' : (user.role === 'seller') ? 'var(--theme-secondary)' : 'var(--accent)', 
                      color: user.role === 'admin' ? 'var(--bg)' : (user.role === 'seller') ? '#fff' : '#1A1205'
                    }}
                  >
                    {user.role === 'admin' ? <LayoutDashboard size={18} /> : (user.role === 'seller') ? <Plus size={18} /> : <ArrowRight size={18} />}
                    <span className="hidden md:inline">
                      {user.role === 'admin' ? "Dashboard" : (user.role === 'seller') ? "Create" : (user.role === 'buyer') ? "Start Selling" : "Verify Account"}
                    </span>
                  </Link>

                  <NotificationDropper />
                  <ProfileDropper user={user} logout={logout} />
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <button 
                    onClick={() => nav.login()} 
                    className="font-medium text-sm text-(--header-text) transition-colors px-4 py-2 rounded-lg hover:bg-(--header-hover)"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => nav.register()} 
                    className="bg-(--accent) font-bold text-sm text-[#1A1205] px-6 py-2.5 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 hover:brightness-110"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile Menu Trigger */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-(--header-hover) transition-colors text-(--header-text)">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && <MobileMenu categories={categories} searchInputRef={mobileSearchRef} user={user} setIsMobileMenuOpen={setIsMobileMenuOpen} logout={logout} />}
    </>
  );
}