import FilterButton from "../FilterButton";

export default function PriceDropdown({priceRange, setPriceRange, activeDropdown, toggleDropdown, setActiveDropdown}){
    const handleInput = () => {
        if (priceRange.min < 0 || priceRange.max < 0) {
            alert("Price cannot be negative.");
            return false;
        }
        if (priceRange.min && priceRange.max && Number(priceRange.min) > Number(priceRange.max)) {
            alert("Minimum price cannot be greater than maximum price.");
            return false;
        }
        return true;
    }
    return (
        <div className="relative">
            <FilterButton 
            name="price" 
            label={priceRange.min || priceRange.max ? `Price: ${priceRange.min} - ${priceRange.max}` : "Price"} 
            isActive={priceRange.min || priceRange.max}
                toggleDropdown={toggleDropdown}
            />
            {activeDropdown === "price" && (
            <div className="filter-dropdown-panel absolute top-full mt-2 left-0 w-72 rounded-xl p-4 z-40 animate-in fade-in zoom-in-95 duration-100">
                <h4 className="text-sm font-bold mb-3">Price Range (VND)</h4>
                <div className="flex items-center gap-2 mb-4">
                <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text)' }}
                />
                </div>
                <div className="flex gap-2">
                <button onClick={() => { setPriceRange({min:'', max:''}); setActiveDropdown(null); }}
                    className="flex-1 py-2 text-xs font-medium border rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                    Reset
                </button>
                <button onClick={() => { if (handleInput()) setActiveDropdown(null); }}
                    className="flex-1 py-2 text-xs font-bold rounded-lg hover:brightness-110 transition-colors shadow-md"
                    style={{ backgroundColor: 'var(--accent)', color: '#1A1205' }}>
                    Apply
                </button>
                </div>
            </div>
            )}
        </div>
    )
}