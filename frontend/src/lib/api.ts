import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Clerk token will be added via setClerkToken function
// Called from components that have access to Clerk's useAuth hook
let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export const setClerkTokenGetter = (getter: () => Promise<string | null>) => {
  clerkTokenGetter = getter;
};

// Add Clerk token to all requests
api.interceptors.request.use(async (config) => {
  if (clerkTokenGetter) {
    const token = await clerkTokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to sign in page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API - Disabled for now, will use external auth service later
// export const authAPI = {
//   login: async (username: string, password: string) => {
//     const formData = new FormData();
//     formData.append('username', username);
//     formData.append('password', password);
//     
//     const response = await api.post('/api/auth/login', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data;
//   },
//   
//   getCurrentUser: async () => {
//     const response = await api.get('/api/auth/me');
//     return response.data;
//   },
// };

// Registration API
export const registrationAPI = {
  getAll: async (params?: {
    status?: string;
    parent_email?: string;
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get('/api/registrations/', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/registrations/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/registrations/', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/api/registrations/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/registrations/${id}`);
    return response.data;
  },
  
  searchByChild: async (childName: string) => {
    const response = await api.get(`/api/registrations/search/by-child/${childName}`);
    return response.data;
  },
  
  getByCampDate: async (campDate: string, status?: string) => {
    const response = await api.get('/api/registrations/by-camp-date/', {
      params: { camp_date: campDate, status }
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getRevenue: async (params?: { start_date?: string; end_date?: string }) => {
    const response = await api.get('/api/analytics/revenue', { params });
    return response.data;
  },
  
  getDailyCapacity: async (params?: { start_date?: string; end_date?: string }) => {
    const response = await api.get('/api/analytics/daily-capacity', { params });
    return response.data;
  },
  
  getCancellations: async (params?: { start_date?: string; end_date?: string }) => {
    const response = await api.get('/api/analytics/cancellations', { params });
    return response.data;
  },
  
  getDashboardSummary: async () => {
    const response = await api.get('/api/analytics/dashboard-summary');
    return response.data;
  },
};

export default api;

