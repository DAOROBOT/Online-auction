const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const reviewService = {
  /**
   * Get all reviews with optional filters
   * @param {Object} filters - { reviewerId, targetId, auctionId, page, limit }
   * @returns {Promise<Object>} Response with reviews, pagination, and stats
   */
  getReviews: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.reviewerId) params.append('reviewerId', filters.reviewerId);
    if (filters.targetId) params.append('targetId', filters.targetId);
    if (filters.auctionId) params.append('auctionId', filters.auctionId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const res = await fetch(`${API_URL}/reviews?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  /**
   * Get review statistics
   * @param {Object} filters - { reviewerId, targetId, auctionId }
   * @returns {Promise<Object>} Statistics object
   */
  getReviewStats: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.reviewerId) params.append('reviewerId', filters.reviewerId);
    if (filters.targetId) params.append('targetId', filters.targetId);
    if (filters.auctionId) params.append('auctionId', filters.auctionId);

    const res = await fetch(`${API_URL}/reviews/stats?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch review stats');
    return res.json();
  },

  /**
   * Get a single review by ID
   * @param {number} id - Review ID
   * @returns {Promise<Object>} Review object
   */
  getReviewById: async (id) => {
    const res = await fetch(`${API_URL}/reviews/${id}`);
    if (!res.ok) throw new Error('Failed to fetch review');
    return res.json();
  },
};
