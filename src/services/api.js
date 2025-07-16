import axios from 'axios';

const API_URL = "http://localhost:8080";

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
  window.location.href = '/login';
}

// ========== Request Interceptor ========== //
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isAuthRequest = config.url.startsWith('/auth/');
    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
        } else {
          console.error("Refresh token ishlamayapti:", refreshError);
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

// ======== API FUNCTIONLAR ======== //

export const createSeries = async (formData) => {
  const response = await api.post("/series/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/sign-in', { email, password });
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

export const getSeries = async () => {
  const response = await api.get('/series/all');
  return response.data;
};

export const getSeriesDetails = async (id) => {
  const response = await api.get(`/series/${id}`);
  return response.data;
};

export const getEpisode = async (seriesId, episodeId) => {
  const response = await api.get(`/series/${seriesId}/episode/${episodeId}`);
  return response.data;
};

export const createEpisode = async (seriesId, formData) => {
  const response = await api.post(`/admin/series/${seriesId}/episodes`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateSeries = async (seriesId, series) => {
  const response = await api.put(`/series/${seriesId}`, series);
  return response.data;
};

export const updateEpisode = async (episodeId, episode) => {
  const response = await api.put(`/admin/series/episodes/${episodeId}`, episode);
  return response.data;
};

export const getEpisodesBySeries = async (seriesId) => {
  const response = await api.get(`/series/${seriesId}/episodes`);
  return response.data;
};

export const getAllVideos = async () => {
  const response = await api.get("/admin/series/all");
  return response.data;
};

export const getAllSeries = async () => {
  const response = await api.get("/series/all");
  return response.data;
};

export const deleteEpisode = async (episodeId) => {
  const response = await api.delete(`/admin/series/episodes/${episodeId}`);
  return response.data;
};

export default api;
