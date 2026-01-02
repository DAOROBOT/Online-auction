import { Outlet, Link, useLocation } from 'react-router-dom';

import { useNav } from '../hooks/useNavigate';

const AuthLayout = () => {
  const location = useLocation();
//   const isLogin = location.pathname === '/login';
  const nav = useNav();

  return (
    <div className="flex flex-row min-h-screen w-full bg-[var(--bg)]">
        {/* Left Half - Image & Branding (Dark in light mode, Light in dark mode) */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1932&auto=format&fit=crop')`,
                }}
            >
                {/* Overlay - Dark in light mode, Light in dark mode */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-gray-900/90"></div>
            </div>

            
            
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center p-12">
                            <button
                type="button"
                onClick={() => nav.back()}
                className="absolute top-6 left-6 mb-6 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>
                <div className="mb-8">
                    <div className="w-12 h-12 bg-[var(--bg-soft)] rounded-full"></div>
                </div>
                
                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white text-[var(--text)]">
                    <span className="text-[var(--accent)]">AURUM</span> AUCTIONS
                </h1>
                
                {/* Description */}
                <p className="text-gray-300 dark:text-[var(--text-muted)] text-lg max-w-md leading-relaxed">
                    Discover unique items and bid on exclusive auctions. 
                    Join our community of collectors and enthusiasts.
                </p>
            </div>
        </div>

        {/* Right Half - Form (Light in light mode, Dark in dark mode) */}
        <div className="w-full lg:w-1/2 bg-[var(--bg-soft)] flex flex-col min-h-screen">
            {/* Form Container */}
            <div className="flex-1 flex items-center justify-center px-8 pb-12">
                <Outlet />
            </div>
        </div>
    </div>
  );
};

export default AuthLayout;