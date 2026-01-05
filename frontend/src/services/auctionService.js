const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const auctionService = {
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
    return res.json(); // Trả về { url: "..." }
  },

  // Tạo đấu giá mới
  create: async (auctionData) => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_URL}/auction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(auctionData)
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create auction');
    return data;
  }
};