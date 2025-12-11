import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex flex-row h-screen w-full">
        {/* Left Half - Brand Name */}
        <div className="w-1/2 bg-[#120A1F] flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="text-[#E0B84C]">AURUM</span> <span className="text-white">AUCTIONS</span>
            </h1>
        </div>

        {/* Right Half - Login Form */}
        <div className="w-1/2 bg-[#1A1225] flex items-center justify-center p-8">
            <Outlet />
        </div>
    </div>
  );
};

export default AuthLayout;