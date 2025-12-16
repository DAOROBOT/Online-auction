import { products, bids } from '../data/index.js';

// A flag to toggle modes. 
// You can also use an environment variable: import.meta.env.VITE_USE_MOCK === 'true'
const USE_MOCK_DATA = true;

// Mock comments data
const MOCK_COMMENTS = [
  { id: 1, user: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=1', text: 'Great product! When will it ship?', time: '2 hours ago' },
  { id: 2, user: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=2', text: 'Is this still available?', time: '5 hours ago' },
];

const productService = {
  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  getById: async (id) => {
    if (USE_MOCK_DATA) {
      console.log("⚠️ Using MOCK Data for Product");
      // Simulate network delay
      return new Promise((resolve) => {
        setTimeout(() => {
          const foundProduct = products.find(p => p.id === id || p.id === `p${id}`);
          if (!foundProduct) {
            resolve(null);
            return;
          }

          // Generate more images (5-10 images) if not enough
          let productImages = foundProduct.images || [foundProduct.image];
          if (productImages.length < 5) {
            const productIndex = products.indexOf(foundProduct);
            // Generate 8 images total with different seeds
            productImages = Array.from({ length: 8 }, (_, i) => 
              `https://picsum.photos/seed/${productIndex * 123 + i}/400/400`
            );
          }

          resolve({
            ...foundProduct,
            images: productImages
          });
        }, 300);
      });
    }

    // TODO: Replace with real API call
    // const API_URL = import.meta.env.VITE_API_URL;
    // const response = await fetch(`${API_URL}/products/${id}`);
    // if (!response.ok) throw new Error('Failed to fetch product');
    // return await response.json();
  },

  /**
   * Get top bidders for a product
   * @param {string} productId - Product ID
   * @param {number} limit - Number of top bidders to return (default: 3)
   * @returns {Promise<Array>} Array of top bidders
   */
  getTopBidders: async (productId, limit = 3) => {
    if (USE_MOCK_DATA) {
      console.log("⚠️ Using MOCK Data for Top Bidders");
      return new Promise((resolve) => {
        setTimeout(() => {
          // Handle both "101" and "p101" format
          const productBidsList = bids.filter(b => {
            // Match both formats: "p101" or "101"
            return b.productId === productId || 
                   b.productId === `p${productId}` ||
                   b.productId === productId.replace(/^p/, '');
          });
          
          // Find the product to get current price
          const foundProduct = products.find(p => p.id === productId || p.id === `p${productId}`);
          
          let sortedBids = [...productBidsList].sort((a, b) => b.amount - a.amount);
          
          // If we don't have enough bids, generate mock ones to always show 3
          if (sortedBids.length < limit) {
            const needed = limit - sortedBids.length;
            // Use product's current price as base, or a default if product not found
            const basePrice = foundProduct ? foundProduct.currentPrice : 1000;
            const highestBid = sortedBids.length > 0 ? sortedBids[0].amount : basePrice;
            
            for (let i = 0; i < needed; i++) {
              const mockBid = {
                id: `mock-bid-${Date.now()}-${i}`,
                productId: foundProduct ? foundProduct.id : productId,
                bidderId: `u${Math.floor(Math.random() * 1000)}`,
                bidderName: `bidder${Math.floor(Math.random() * 1000)}`,
                amount: Math.max(100, highestBid - (i + 1) * 50 - Math.floor(Math.random() * 100)),
                timestamp: new Date(Date.now() - (i + 1) * 60000),
                status: 'active'
              };
              sortedBids.push(mockBid);
            }
            
            // Re-sort after adding mock bids
            sortedBids = sortedBids.sort((a, b) => b.amount - a.amount);
          }
          
          // Always return exactly 3 bidders
          const topBidders = sortedBids.slice(0, limit).map((bid, idx) => ({
            ...bid,
            rank: idx + 1,
            avatar: `https://i.pravatar.cc/150?u=${bid.bidderId || bid.bidderName}`
          }));
          
          resolve(topBidders);
        }, 200);
      });
    }

    // TODO: Replace with real API call
    // const API_URL = import.meta.env.VITE_API_URL;
    // const response = await fetch(`${API_URL}/products/${productId}/bidders?limit=${limit}`);
    // if (!response.ok) throw new Error('Failed to fetch top bidders');
    // return await response.json();
  },

  /**
   * Get comments for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} Array of comments
   */
  getComments: async (productId) => {
    if (USE_MOCK_DATA) {
      console.log("⚠️ Using MOCK Data for Comments");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...MOCK_COMMENTS]);
        }, 200);
      });
    }

    // TODO: Replace with real API call
    // const API_URL = import.meta.env.VITE_API_URL;
    // const response = await fetch(`${API_URL}/products/${productId}/comments`);
    // if (!response.ok) throw new Error('Failed to fetch comments');
    // return await response.json();
  },

  /**
   * Submit a bid for a product
   * @param {string} productId - Product ID
   * @param {number} amount - Bid amount
   * @returns {Promise<Object>} Bid result
   */
  placeBid: async (productId, amount) => {
    if (USE_MOCK_DATA) {
      console.log("⚠️ Using MOCK Data for Place Bid");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Bid placed successfully',
            bid: {
              id: `bid${Date.now()}`,
              productId,
              amount,
              timestamp: new Date().toISOString()
            }
          });
        }, 500);
      });
    }

    // TODO: Replace with real API call
    // const API_URL = import.meta.env.VITE_API_URL;
    // const response = await fetch(`${API_URL}/products/${productId}/bids`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount })
    // });
    // if (!response.ok) throw new Error('Failed to place bid');
    // return await response.json();
  },

  /**
   * Add a comment to a product
   * @param {string} productId - Product ID
   * @param {string} text - Comment text
   * @returns {Promise<Object>} Comment object
   */
  addComment: async (productId, text) => {
    if (USE_MOCK_DATA) {
      console.log("⚠️ Using MOCK Data for Add Comment");
      return new Promise((resolve) => {
        setTimeout(() => {
          const newComment = {
            id: Date.now(),
            user: 'You',
            avatar: 'https://i.pravatar.cc/150?u=you',
            text,
            time: 'Just now',
          };
          resolve(newComment);
        }, 300);
      });
    }

    // TODO: Replace with real API call
    // const API_URL = import.meta.env.VITE_API_URL;
    // const response = await fetch(`${API_URL}/products/${productId}/comments`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text })
    // });
    // if (!response.ok) throw new Error('Failed to add comment');
    // return await response.json();
  },

  /**
   * Toggle watchlist status for a product
   * @param {string} productId - Product ID
   * @param {boolean} isWatchlisted - Current watchlist status
   * @returns {Promise<Object>} Watchlist result
   */
  toggleWatchlist: async (productId, isWatchlisted) => {
    if (USE_MOCK_DATA) {
      console.log("⚠️ Using MOCK Data for Toggle Watchlist");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            isWatchlisted: !isWatchlisted,
            message: !isWatchlisted ? 'Added to watchlist' : 'Removed from watchlist'
          });
        }, 200);
      });
    }

    // TODO: Replace with real API call
    // const API_URL = import.meta.env.VITE_API_URL;
    // const method = isWatchlisted ? 'DELETE' : 'POST';
    // const response = await fetch(`${API_URL}/products/${productId}/watchlist`, {
    //   method,
    // });
    // if (!response.ok) throw new Error('Failed to toggle watchlist');
    // return await response.json();
  },
};

export default productService;
