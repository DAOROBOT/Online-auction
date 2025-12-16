import FilterButton from "../FilterButton";

export default function CategoryDropdown({ selectedCategory, setSelectedCategory, activeDropdown, categories, toggleDropdown, setActiveDropdown}) {
    return (
        <div className="relative">
            <FilterButton 
            name="category" 
            label={!selectedCategory ? "Category" : selectedCategory} 
            isActive={selectedCategory}
                toggleDropdown={toggleDropdown}
            />
        {activeDropdown === "category" && (
            <div className="filter-dropdown-panel absolute top-full mt-2 left-0 w-64 rounded-xl p-2 z-40 max-h-80 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                <button onClick={() => { setSelectedCategory("All"); setActiveDropdown(null); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-hover)] transition-colors font-medium">
                All Categories
                </button>
                {categories.map((cat) => (
                <div key={cat.id}>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase mt-1" style={{ color: 'var(--text-subtle)' }}>
                    {cat.name}
                    </div>
                    {cat.subcategories?.map((sub) => (
                    <button key={sub.id} onClick={() => { setSelectedCategory(sub.name); setActiveDropdown(null); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--bg-hover)] flex justify-between items-center group transition-colors"
                    >
                        {sub.name}
                        {selectedCategory === sub.name && <Check size={14} style={{ color: 'var(--accent)' }} />}
                    </button>))}
                </div>))}
            </div>
        )}
    </div>
    )
}