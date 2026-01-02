import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import ProductDetail from './pages/ProductDetail';
import SearchPage from './pages/SearchPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyAccount from './pages/Auth/VerifyAccount';
import AuthCallback from './pages/Auth/AuthCallback';
import Profile from './pages/Profile';
import CreateAuction from './pages/CreateAuction';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ForgetPassword from './pages/Auth/ForgetPassword';
import BecomeSeller from './pages/BecomeSeller';
import { Verified } from 'lucide-react';

function App() {
  return (
    <div className='min-h-screen transition-colors duration-100'>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
        </Route>

        {/* OAuth Callback Route */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/auction/:id" element={<ProductDetail />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* --- LEVEL 1: STANDARD USERS (Just need to log in) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/me" element={<Profile me={true}/>} />
            <Route path="/verify-account" element={<VerifyAccount />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="buyer" />}>
            <Route path="/become-seller" element={<BecomeSeller />} />
          </Route>

          {/* --- LEVEL 2: SELLER ONLY (Needs 'seller' role) --- */}
          <Route element={<ProtectedRoute requiredRole="seller" />}>
            <Route path="/create-auction" element={<CreateAuction />} />
          </Route>


          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* --- LEVEL 3: ADMIN ONLY (Needs 'admin' role) --- */}
        <Route element={<AdminLayout />}>
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

      </Routes>
    </div>
  )
}

export default App