import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// BOOKS API
// ============================================
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  getMyBooks: () => api.get('/books/my')
};

// ============================================
// CART API
// ============================================
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (data) => api.put('/cart/update', data),
  remove: (bookId) => api.delete(`/cart/remove/${bookId}`),
  clear: () => api.delete('/cart/clear')
};

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getMySales: () => api.get('/orders/my-sales'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancel: (id) => api.put(`/orders/${id}/cancel`)
};

// ============================================
// REVIEWS API
// ============================================
export const reviewsAPI = {
  getBookReviews: (bookId, params) => api.get(`/reviews/book/${bookId}`, { params }),
  create: (data) => api.post('/reviews', data),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`)
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  // Dashboard Stats
  getDashboardStats: () => api.get('/admin/stats'),
  getSalesChart: () => api.get('/admin/sales-chart'),
  getRecentOrders: () => api.get('/admin/recent-orders'),
  getRecentUsers: () => api.get('/admin/recent-users'),
  getTopBooks: () => api.get('/admin/top-books'),
  getOrderStatusDistribution: () => api.get('/admin/order-status-distribution'),

  // User Management
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Book Management
  getAllBooks: (params) => api.get('/admin/books', { params }),
  deleteBook: (bookId) => api.delete(`/admin/books/${bookId}`),

  // Order Management
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (orderId, data) => api.put(`/admin/orders/${orderId}/status`, data),
  deleteOrder: (orderId) => api.delete(`/admin/orders/${orderId}`),

  // Reports
  getSalesReport: (params) => api.get('/admin/reports/sales', { params })
};

export default api;
