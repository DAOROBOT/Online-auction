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
  },

  /**
   * Get top bidders for a product
   * @param {string} productId - Product ID
   * @param {number} limit - Number of top bidders to return (default: 3)
   * @returns {Promise<Array>} Array of top bidders
   */
  getTopBidders: async (productId, limit = 3) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Handle both "101" and "p101" format
          const productBidsList = bids.filter(b => {
            return b.productId === productId || 
                   b.productId === `p${productId}` ||
                   b.productId === productId.replace(/^p/, '');
          });
          
          const foundProduct = products.find(p => p.id === productId || p.id === `p${productId}`);
          let sortedBids = [...productBidsList].sort((a, b) => b.amount - a.amount);
          
          // Mock data generation if empty (existing logic)
          if (sortedBids.length < limit) {
             const basePrice = foundProduct ? foundProduct.currentPrice : 1000;
             const highestBid = sortedBids.length > 0 ? sortedBids[0].amount : basePrice;
             for (let i = 0; i < limit - sortedBids.length; i++) {
                sortedBids.push({
                    id: `mock-bid-${Date.now()}-${i}`,
                    productId: productId,
                    bidderId: `u${Math.floor(Math.random() * 1000)}`,
                    bidderName: `bidder${Math.floor(Math.random() * 1000)}`,
                    amount: Math.max(100, highestBid - (i + 1) * 50),
                    timestamp: new Date(Date.now() - (i + 1) * 60000).toISOString(),
                    status: 'active'
                });
             }
             sortedBids.sort((a, b) => b.amount - a.amount);
          }
          
          const topBidders = sortedBids.slice(0, limit).map((bid, idx) => ({
            ...bid,
            rank: idx + 1,
            avatar: `https://i.pravatar.cc/150?u=${bid.bidderId || bid.bidderName}`
          }));
          resolve(topBidders);
        }, 200);
      });
    }
  },

  // NEW METHOD ADDED
  /**
   * Get full bid history for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} Array of all bids
   */
  getBidHistory: async (productId) => {
    if (USE_MOCK_DATA) {
        console.log("⚠️ Using MOCK Data for Bid History");
        return new Promise((resolve) => {
            setTimeout(() => {
                // 1. Filter bids for this product
                let productBids = bids.filter(b => 
                    b.productId === productId || 
                    b.productId === `p${productId}` ||
                    b.productId === productId.replace(/^p/, '')
                );

                // 2. If no bids exist in mock data, generate a realistic history
                if (productBids.length === 0) {
                    const count = 15; // Generate 15 fake bids
                    let currentAmount = 5000; // Base price
                    const now = Date.now();
                    
                    for(let i = 0; i < count; i++) {
                        currentAmount += Math.floor(Math.random() * 200) + 50;
                        productBids.push({
                            id: `gen-bid-${i}`,
                            productId,
                            bidderId: `user-${Math.floor(Math.random() * 5) + 1}`, // Random user 1-5
                            bidderName: i % 3 === 0 ? 'JohnCollector' : (i % 2 === 0 ? 'LuxuryBuyer88' : 'VintageHunter'),
                            bidderRating: (Math.random() * 5).toFixed(1),
                            amount: currentAmount,
                            timestamp: new Date(now - (i * 1000 * 60 * 15)).toISOString(), // Every 15 mins
                            status: 'active'
                        });
                    }
                }

                // 3. Sort by Time Descending (Newest first)
                productBids.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                resolve(productBids);
            }, 500);
        });
    }
    
    // TODO: Real API
    // const response = await fetch(`${API_URL}/products/${productId}/bids`);
    // return await response.json();
  },

  /**
   * Get comments for a product
   */
  getComments: async (productId) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => setTimeout(() => resolve([...MOCK_COMMENTS]), 200));
    }
  },

  /**
   * Submit a bid for a product
   */
  placeBid: async (productId, amount) => {
    if (USE_MOCK_DATA) {
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
  },

  /**
   * Add a comment to a product
   */
  addComment: async (productId, text) => {
    if (USE_MOCK_DATA) {
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
  },

  /**
   * Toggle watchlist status for a product
   */
  toggleWatchlist: async (productId, isWatchlisted) => {
    if (USE_MOCK_DATA) {
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
  },
};

export default productService;