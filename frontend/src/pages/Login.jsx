import { useNav } from '../hooks/useNavigate';

export default function Login() {
    const nav = useNav();
    return (
        <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-white mb-8">Login</h2>
            <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                nav.home();
            }}>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="w-full px-4 py-3 rounded-lg bg-[#120A1F] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#E0B84C] transition-colors"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Password</label>
                    <input 
                        type="password" 
                        placeholder="Enter your password" 
                        className="w-full px-4 py-3 rounded-lg bg-[#120A1F] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#E0B84C] transition-colors"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full py-3 rounded-lg bg-[#E0B84C] text-[#120A1F] font-semibold hover:brightness-110 transition-all"
                >
                    Login
                </button>
            </form>
        </div>
    );
}