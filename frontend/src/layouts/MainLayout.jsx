import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Header />
      
      <main className="content">
        {/* --- GLOBAL BACKGROUND ORBS --- */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none animate-pulse -z-30 transition-all duration-500
            bg-[#7C00FE]/5 dark:bg-[#7C00FE]/20"
        ></div>

        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none -z-30 transition-all duration-500
            bg-[#F5004F]/5 dark:bg-[#F5004F]/20"
        ></div>
        
        {/* THE PAGE CHANGES HERE */}
        <Outlet /> 
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;