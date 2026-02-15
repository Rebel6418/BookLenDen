import axios from 'axios';

const api = axios.create({
  baseURL: '/api/admin'
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard Stats
export const dashboardAPI = {
  getStats: () => api.get('/stats'),
  getSalesChart: (days = 30) => api.get(`/sales-chart?days=${days}`),
  getRecentOrders: () => api.get('/recent-orders'),
  getRecentUsers: () => api.get('/recent-users'),
  getTopBooks: () => api.get('/top-books')
};

// User Management
export const userManagementAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleUserStatus: (id) => api.put(`/users/${id}/toggle-status`)
};

// Book Management
export const bookManagementAPI = {
  getAllBooks: (params) => api.get('/books', { params }),
  getBookById: (id) => api.get(`/books/${id}`),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  deleteBook: (id) => api.delete(`/books/${id}`),
  toggleBookStatus: (id) => api.put(`/books/${id}/toggle-status`)
};

// Order Management
export const orderManagementAPI = {
  getAllOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/orders/${id}`)
};

// Reports
export const reportsAPI = {
  getSalesReport: (startDate, endDate) => api.get('/reports/sales', {
    params: { startDate, endDate }
  }),
  getCategoryReport: () => api.get('/reports/categories'),
  getUserReport: () => api.get('/reports/users'),
  exportReport: (type, params) => api.get(`/reports/export/${type}`, {
    params,
    responseType: 'blob'
  })
};

export default api;