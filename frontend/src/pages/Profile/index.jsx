import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import ProfileSidebar from "./ProfileSidebar";
import ProductGrid from "../../components/ProductGrid"; 
import FilterBar from "../../components/Filter/FilterBar";
import Pagination from "../../components/Pagination";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export default function Profile() {
  const { user: authUser, logout, loading: authLoading } = useAuth();
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('active-bids');

  const isOwnProfile = (authUser && authUser.username === username);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          return;
        }

        let response;

        if (isOwnProfile) {
          // --- Viewing Own Profile ---
          if (!token) {
            return;
          }

          response = await fetch(`${API_URL}/user/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

        } else if (username) {
          // --- Viewing Public Profile by Username ---
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          
          response = await fetch(`${API_URL}/user/profile/${username}`, {
            headers: headers
          });
        }

        if (response) {
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else if (response.status === 401 && isOwnProfile) {
             // Only logout if failing on own profile fetch
            const errorData = await response.json();
            console.warn('Auth error:', errorData.message);
            logout();
          } else {
             console.error("Failed to fetch profile");
             setUserData(null);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All Categories";
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Loading state
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-20 flex items-center justify-center min-h-[400px]">
        <div className="text-(--text-muted)">Loading profile...</div>
      </div>
    );
  }

  // No user data
  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-20 flex items-center justify-center min-h-[400px]">
        <div className="text-(--text-muted)">
          {isOwnProfile ? "Please log in to view your profile." : "User not found."}
        </div>
      </div>
    );
  }

  // --- TAB CONFIGURATION ---
  const tabs = [
    { 
      id: 'active-bids', 
      label: 'Active Bids', 
      count: userData.activeBids?.length || 0,
      variant: 'bidding'
    },
    { 
      id: 'won-auctions', 
      label: 'Wins', 
      count: userData.wonAuctions?.length || 0,
      variant: 'won'
    },
    { 
      id: 'favorites', 
      label: 'Saved', 
      count: userData.favoriteProducts?.length || 0,
      variant: 'favorite'
    },
  ];

  if (userData.role === 'seller') {
      // Insert at the beginning so they see their business first
      tabs.unshift(
          { 
              id: 'my-listings', 
              label: 'My Listings', 
              count: userData.activeListings?.length || 0,
              variant: 'default' // Standard view for their own items
          },
          { 
              id: 'sold-items', 
              label: 'Sold', 
              count: userData.soldItems?.length || 0,
              variant: 'won' // Reusing 'won' style to show success state
          }
      );
  }

  // Helper to get current data list based on tab
  const getCurrentData = () => {
      switch(activeTab) {
          case 'active-bids': return userData.activeBids;
          case 'won-auctions': return userData.wonAuctions;
          case 'favorites': return userData.favoriteProducts;
          case 'my-listings': return userData.activeListings;
          case 'sold-items': return userData.soldItems;
          default: return [];
      }
  };

  const currentTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-20 relative z-10 transition-colors duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        
        <div className="lg:w-[350px] shrink-0">
          <ProfileSidebar userData={userData} isOwnProfile={isOwnProfile} />
        </div>

        <div className="flex-1 mt-4 lg:mt-0">
            
            <div className="flex items-center gap-8 border-b border-(--border) mb-8 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                              group relative pb-4 text-sm font-bold tracking-wide transition-colors whitespace-nowrap flex items-center gap-2
                              ${isActive ? 'text-(--text)' : 'text-(--text-muted) hover:text-(--text)'}
                          `}
                      >
                          {tab.label}

                          {/* Active Line Indicator */}
                          {isActive && (
                              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-(--accent) rounded-t-full" />
                          )}
                      </button>
                  );
              })}
            </div>

            <FilterBar setSearchParams={setSearchParams}/>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
                {/* Using the grid component to display content */}
                <ProductGrid 
                  items={getCurrentData()} 
                  cardVariant={currentTabInfo?.variant} 
                  columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-3" // Adjusted for 2/3 layout width
                />
            </div>

        </div>
      </div>
    </div>
  );
}