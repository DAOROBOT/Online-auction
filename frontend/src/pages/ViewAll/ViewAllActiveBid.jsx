import ViewAllPageHeader from "./ViewAllPageHeader";
// import { useAuth } from "../../context/AuthContext";
export default function ViewAllActiveBid() {
    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ViewAllPageHeader type="activeBids" />
            </div>
        </div>        
    );
}