const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('pos_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({ success: false, message: 'Server response parsing failed' }));
  if (!res.ok) {
    throw new Error(data.message || 'An error occurred on the POS server');
  }
  return data;
};

export const api = {
  // Auth
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Users (Admin)
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/users${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createUser: async (userData) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },
  updateUser: async (id, userData) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },
  resetPassword: async (id, newPassword) => {
    const res = await fetch(`${API_BASE}/users/${id}/reset-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    return handleResponse(res);
  },
  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createCategory: async (categoryData) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(res);
  },
  updateCategory: async (id, categoryData) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(res);
  },
  deleteCategory: async (id) => {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Menu Items
  getMenuItems: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/menu${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createMenuItem: async (formData) => {
    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },
  updateMenuItem: async (id, formData) => {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },
  toggleItemAvailability: async (id) => {
    const res = await fetch(`${API_BASE}/menu/${id}/toggle-availability`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  deleteMenuItem: async (id) => {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Tables
  getTables: async () => {
    const res = await fetch(`${API_BASE}/tables`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  createTable: async (tableData) => {
    const res = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tableData),
    });
    return handleResponse(res);
  },
  updateTable: async (id, tableData) => {
    const res = await fetch(`${API_BASE}/tables/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tableData),
    });
    return handleResponse(res);
  },
  updateTableStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/tables/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },
  deleteTable: async (id) => {
    const res = await fetch(`${API_BASE}/tables/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Orders
  createOrder: async (orderPayload) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload),
    });
    return handleResponse(res);
  },
  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/orders${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getOrderById: async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  cancelOrder: async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Inventory
  getInventory: async () => {
    const res = await fetch(`${API_BASE}/inventory`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  adjustStock: async (adjustmentData) => {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(adjustmentData),
    });
    return handleResponse(res);
  },
  getInventoryLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/inventory/logs${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Reports
  getDashboardMetrics: async () => {
    const res = await fetch(`${API_BASE}/reports/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  getSalesReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports/sales${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsData),
    });
    return handleResponse(res);
  },

  // Backup & Restore
  createBackup: async () => {
    const res = await fetch(`${API_BASE}/backup/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  listBackups: async () => {
    const res = await fetch(`${API_BASE}/backup/list`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
  restoreBackup: async (filename) => {
    const res = await fetch(`${API_BASE}/backup/restore`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ filename }),
    });
    return handleResponse(res);
  },
};
