import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNav } from '../../hooks/useNavigate';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const nav = useNav();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            nav.login();
            return;
        }

        if (token) {
            // Store the token
            localStorage.setItem('authToken', token);
            
            // Fetch user data and redirect
            fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(userData => {
                // Redirect based on role
                if (userData.role === 'admin') {
                    nav.go('/admin');
                } else {
                    nav.home();
                }
            })
            .catch(() => {
                nav.home();
            });
        } else {
            nav.login();
        }
    }, [searchParams, nav]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E0B84C] mx-auto mb-4"></div>
                <p className="text-white text-lg">Authenticating...</p>
            </div>
        </div>
    );
}
