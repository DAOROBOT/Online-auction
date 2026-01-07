// frontend/src/services/auctionService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const auctionService = {
  // Lấy thông tin cơ bản (Header, Giá, Status)
  getById: async (id) => {
    const res = await fetch(`${API_URL}/auction/${id}`);
    if (!res.ok) throw new Error('Failed to fetch auction details');
    return res.json();
  },

  // --- CÁC HÀM MỚI---
  
  // 1. Lấy danh sách ảnh
  getImages: async (id) => {
    const res = await fetch(`${API_URL}/auction/images/${id}`);
    if (!res.ok) return []; // Trả về mảng rỗng nếu lỗi
    return res.json();
  },

  // 2. Lấy mô tả chi tiết (HTML)
  getDescription: async (id) => {
    const res = await fetch(`${API_URL}/auction/description/${id}`);
    if (!res.ok) return { description: "" };
    return res.json();
  },

  // 3. Lấy danh sách comment
  getComments: async (id) => {
    const res = await fetch(`${API_URL}/auction/comments/${id}`);
    if (!res.ok) return [];
    return res.json();
  },

  // 4. Lấy lịch sử đấu giá
  getBidHistory: async (id) => {
    // API này có thể chưa có trong route backend bạn gửi, 
    // nhưng nếu team yêu cầu tách thì nên gọi route này. 
    // Tạm thời ta dùng route getById nếu backend chưa tách route /bids.
    // Nhưng theo cấu trúc team bạn, tôi sẽ giả định route này:
    const res = await fetch(`${API_URL}/auction/${id}/bids`); 
    // Lưu ý: Nếu route này chưa có ở backend, bạn phải bảo team backend thêm vào, 
    // hoặc tạm thời dùng getById để lấy bids.
    if (!res.ok) return []; 
    return res.json();
  },

  // --- CÁC HÀM CŨ GIỮ NGUYÊN ---
  getTopAuctions: async ({ id = null, status = 'active', sortBy = 'newest', page = 1, limit = 5 } = {}) => {
    const queryParams = new URLSearchParams({ status, sortBy, page, limit });
    if (id) queryParams.append("userId", id);
    const token = localStorage.getItem('authToken');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch(`${API_URL}/auction/top?${queryParams.toString()}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch auctions');
    return res.json();
  },

  getTabAuctions: async ({ username = '', status = 'active-bid', category = null }) => {
      const queryParams = new URLSearchParams({ username, status });
      if (category) queryParams.append("category", category);
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_URL}/auction/profile?${queryParams.toString()}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch tab data');
      return response.json();
  },

  uploadImage: async (file) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw new Error('Image upload failed');
    return res.json();
  },

  create: async (auctionData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/auction`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: auctionData,
    });
    if (!response.ok) throw new Error('Failed to create auction');
    return response.json();
  },

  placeBid: async (auctionId, amount) => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_URL}/auction/${auctionId}/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: Number(amount) })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to place bid');
    return data;
  }
};

export default auctionService;