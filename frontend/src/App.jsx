import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import ProductDetail from './pages/ProductDetail';
import SearchPage from './pages/SearchPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreateAuction from './pages/CreateAuction';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className='min-h-screen transition-colors duration-100 bg-[var(--bg)] color-[var(--text)]'>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
        
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/auction/:id" element={<ProductDetail />} />

          {/* --- LEVEL 1: STANDARD USERS (Just need to be logged in) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/me" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Route>

          {/* --- LEVEL 2: SELLER ONLY (Needs 'seller' role) --- */}
          <Route element={<ProtectedRoute requiredRole="seller" />}>
            <Route path="/create-auction" element={<CreateAuction />} />
          </Route>

          {/* --- LEVEL 3: ADMIN ONLY (Needs 'admin' role) --- */}
          {/* <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App