import {useState, useEffect} from "react";
import CategoryDropdown from "./Modal/CategoryDropdown";
import PriceDropdown from "./Modal/PriceDropdown";
import SortSelection from "./Modal/SortSelection";
import ChoiceSelected from "./ChoiceSelected";

import './FilterBar.css';
import {categories} from "../../data";
import { Filter } from "lucide-react";
import { useRef } from "react";
// import FilterButton from "./FilterButton";


export default function FilterBar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [orderBy, setOrderBy] = useState("default");
  const barRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (barRef.current && !barRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <div ref={barRef} className="sticky top-24 z-30 mb-8 transition-all duration-300">
      
      {/* THEME: Glassmorphism Container */}
      <div className="filter-bar-glass rounded-2xl p-3">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* LEFT: Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">

            <div className="flex items-center gap-2 mr-2" style={{ color: 'var(--text-muted)' }}>
                <Filter size={18} />
                <span className="text-sm font-semibold uppercase tracking-wide">Filter</span>
            </div>

            {/* Category Dropdown */}
            <CategoryDropdown
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                activeDropdown={activeDropdown}
                categories={categories}
                toggleDropdown={toggleDropdown}
                setActiveDropdown={setActiveDropdown}
            />


            {/* Price Dropdown */}
            <PriceDropdown
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                activeDropdown={activeDropdown}
                toggleDropdown={toggleDropdown}
                setActiveDropdown={setActiveDropdown}
            /> 
          </div>

          {/* RIGHT: Sort */}
            <SortSelection 
                setOrderBy={setOrderBy}
                orderBy={orderBy}
            />
        </div>

        {/* Active Filters Tag Row */}
        {(selectedCategory || priceRange.min || priceRange.max || orderBy !== "default") && (
            <ChoiceSelected 
                selectedCategory={selectedCategory} 
                setSelectedCategory={setSelectedCategory} 
                priceRange={priceRange} 
                setPriceRange={setPriceRange}
                orderBy={orderBy}
                setOrderBy={setOrderBy}
            />
        )}
      </div>
    </div>
  );
}