import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = "http://localhost:8080";

// Get or generate deviceId
let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
  deviceId = uuidv4();
  localStorage.setItem("deviceId", deviceId);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('deviceId');
  window.location.href = '/login';
}

// ========== Request Interceptor ========== //
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.url.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add device ID to every request
    config.headers['X-Device-Id'] = deviceId;
    return config;
  },
  (error) => Promise.reject(error)
);

// ========== Response Interceptor ========== //
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 403;
    const isNotRefreshRequest = !originalRequest.url.includes('/auth/refresh');
    const hasNotRetried = !originalRequest._retry;

    if (isUnauthorized && isNotRefreshRequest && hasNotRetried) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = 'Bearer ' + token;
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('token', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.Authorization = 'Bearer ' + newAccessToken;
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        if (refreshError.response?.status === 403) {
          logout();
        }
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ========== AUTH FUNCTIONS ========== //

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/sign-in', {
      email,
      password,
      deviceId, // Device ID yuboriladi
    });

    const { token, refreshToken } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data;
  } catch (error) {
    console.error('Sign-in error:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Invalid email or password';
  }
};

export const signUp = async (email, password, username) => {
  try {
    const response = await api.post('/auth/sign-up', { email, password, username });
    const { token, refreshToken } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data;
  } catch (error) {
    console.error('Sign-up error:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Registration failed';
  }
};

// ========== OTHER API FUNCTIONS ========== //

export const getAllUsers = async () => (await api.get("/users")).data;
export const getAllSeries = async () => (await api.get("/series/all")).data;
export const getSeries = async () => (await api.get('/series/all')).data;
export const getSeriesDetails = async (id) => (await api.get(`/series/${id}`)).data;
export const getEpisodesBySeries = async (seriesId) => (await api.get(`/series/${seriesId}/episodes`)).data;
export const getEpisode = async (seriesId, episodeId) => (await api.get(`/series/${seriesId}/episode/${episodeId}`)).data;
export const getAllVideos = async () => (await api.get("/admin/series/all")).data;

export const createSeries = async (formData) => {
  const response = await api.post("/series/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const createEpisode = async (seriesId, formData) => {
  const response = await api.post(`/admin/series/${seriesId}/episodes`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateUser = async (id, userData) => (await api.put(`/users/${id}`, userData)).data;
export const updateSeries = async (seriesId, series) => (await api.put(`/series/${seriesId}`, series)).data;
export const updateEpisode = async (episodeId, episode) => (await api.put(`/admin/series/episodes/${episodeId}`, episode)).data;
export const deleteEpisode = async (episodeId) => (await api.delete(`/admin/series/episodes/${episodeId}`)).data;

export default api;
