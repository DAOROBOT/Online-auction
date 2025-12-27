import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNav } from '../../hooks/useNavigate';

export default function Validation() {
    const nav = useNav();
    const location = useLocation();
    
    // Form State
    const [code, setCode] = useState('');
    const [email, setEmail] = useState(location.state?.email || '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    console.log('Validation email:', email);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/auth/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    code
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Validation failed');
            }

            setSuccessMessage('Account validated successfully! Redirecting to login...');
            
            // Redirect to login after a brief delay
            setTimeout(() => {
                nav.login();
            }, 1500);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Validation failed. Please check your code and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-white mb-8">Verify Account</h2>
            
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

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled
                        className="w-full px-4 py-3 rounded-lg bg-[#120A1F] border border-white/10 text-gray-500 placeholder:text-gray-500 focus:outline-none focus:border-[#E0B84C] transition-colors opacity-60 cursor-not-allowed"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Verification Code</label>
                    <input 
                        type="text" 
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter the code sent to your email" 
                        className="w-full px-4 py-3 rounded-lg bg-[#120A1F] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#E0B84C] transition-colors"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-[#E0B84C] text-[#120A1F] font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Verifying...' : 'Verify Account'}
                </button>
            </form>
        </div>
    );
}