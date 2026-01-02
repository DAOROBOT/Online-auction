import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { House } from "lucide-react";
import FilterBar from "../../components/Filter/FilterBar.jsx";
import ProductGrid from "../../components/ProductGrid.jsx";
import Pagination from "../../components/Pagination.jsx";
import './SearchPage.css'
import { useNav } from "../../hooks/useNavigate.js";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export default function SearchPage() {
    const nav = useNav();
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "All Categories";
    const currentPage = parseInt(searchParams.get("page") || "1");

    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchAuctions = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Construct URL with standard browser API
                const apiUrl = new URL(`${API_URL}/search`);
                
                // Append all existing params from the URL (q, category, page, etc.)
                searchParams.forEach((value, key) => {
                    apiUrl.searchParams.append(key, value);
                });
                
                // Ensure page is set if missing
                if (!apiUrl.searchParams.has("page")) {
                    apiUrl.searchParams.append("page", "1");
                }

                const response = await fetch(apiUrl.toString());
                if (!response.ok) throw new Error('Failed to fetch auctions');
                
                const responseData = await response.json();
                
                setProducts(responseData.data || []);
                setTotalPages(responseData.metadata.totalPages || 1);
            } catch (err) {
                console.error("Error fetching auctions:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAuctions();

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, [searchParams]);

    const handlePageChange = (newPage) => {
        setSearchParams(prev => {
            prev.set("page", newPage);
            return prev;
        });
    };
    console.log({ products });

    return (
        <div className="bg-(--bg) px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full min-h-screen">
            {/* Breadcrumbs */}
            <div className="mb-8">
                <ul className="flex items-center gap-2 text-sm">
                    <li onClick={() => nav.home()} className="flex items-center gap-2 text-(--text-muted) transition-colors cursor-pointer hover:underline">
                        <House size={16} />
                        <span>Home</span>
                    </li>
                    <li style={{ color: 'var(--border-strong)' }}>/</li>
                    <li className="font-semibold text-(--accent)">
                        Search Results
                    </li>
                </ul>
                <h1 className="mt-2 text-3xl text-(--text) font-bold tracking-tight">
                    {/* {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} */}
                    {query ? `Results for "${query}"` : category}
                </h1>
            </div>

            <FilterBar setSearchParams={setSearchParams} />

            <section className="transition-colors duration-100">
                {loading ? (<div className="min-h-screen flex items-center justify-center">Loading auctions...</div>) :
                error ? (<div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>) :
                (<>
                    <ProductGrid 
                        items={products} 
                        cardVariant="default"
                        columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    />
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
                )}
            </section>
        </div>
    );
}