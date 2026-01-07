const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const auctionService = {
  getTopAuctions: async ({ id = null, status = 'active', sortBy = 'newest', page = 1, limit = 5 } = {}) => {
    const queryParams = new URLSearchParams({ status, sortBy, page, limit });

    if (id) {
      queryParams.append("userId", id);
    }

    const token = localStorage.getItem('authToken');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const res = await fetch(`${API_URL}/auction/top?${queryParams.toString()}`, { headers });
    
    if (!res.ok) throw new Error('Failed to fetch auctions');
    console.log("Received:", res);
    
    return res.json();
  },

  getTabAuctions: async ({ username = '', status = 'active-bid', category = null }) => {
      const queryParams = new URLSearchParams({ username, status });

      if (category) {
        queryParams.append("category", category);
      }

      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${API_URL}/auction/profile?${queryParams.toString()}`, { headers });

      if (!response.ok) {
          throw new Error('Failed to fetch tab data');
      }

      return response;
  },

  // Lấy danh mục (để đổ vào dropdown)
  getCategories: async () => {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Upload ảnh (Gọi API /upload của backend)
  uploadImage: async (file) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Image upload failed');
    }
    return res.json();
  },

  // Tạo đấu giá mới
  create: async (auctionData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/auction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: auctionData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create auction');
    }

    return response.json();
  }
};

export default auctionService;