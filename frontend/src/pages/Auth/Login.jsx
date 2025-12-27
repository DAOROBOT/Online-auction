import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNav } from '../../hooks/useNavigate';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'http://localhost:3000';

export default function Login() {
    const nav = useNav();
    const location = useLocation();
    const { login } = useAuth();

    // Form State
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // Attempt login and get the user object back
            const user = await login(identifier, password);
            
            // Context-aware Redirect
            if (user.role === 'admin') {
                nav('/admin');
            } else {
                const from = location.state?.from?.pathname || '/';
                nav.go(from);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleFacebookLogin = () => {
        window.location.href = `${API_URL}/auth/facebook`;
    };

    return (
        <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-white mb-8">Login</h2>
            
            {successMessage && (
                <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/50 text-green-500 text-sm">
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 px-4 rounded-lg bg-white text-gray-700 font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>
                
                <button
                    type="button"
                    onClick={handleFacebookLogin}
                    className="w-full py-3 px-4 rounded-lg bg-[#1877F2] text-white font-semibold hover:bg-[#166FE5] transition-all flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#1A0F2E] text-gray-400">or continue with email</span>
                </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Username or Email</label>
                    <input 
                        type="text" 
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter your username or email" 
                        className="w-full px-4 py-3 rounded-lg bg-[#120A1F] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#E0B84C] transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Password</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password" 
                        className="w-full px-4 py-3 rounded-lg bg-[#120A1F] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#E0B84C] transition-colors"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-[#E0B84C] text-[#120A1F] font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}