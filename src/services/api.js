import axios from 'axios';

const API_URL = "http://localhost:8081";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
        const { token } = response.data;
        localStorage.setItem('token', token);
        return response.data;
    } catch (error) {
        console.error('Sign-in error:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Invalid email or password';
    }
};

export const signUp = async (email, password,username) => {
    try {
        const response = await api.post('/auth/sign-up', { email, password,username });
        const { token } = response.data;
        localStorage.setItem('token', token);
        console.log('Registration successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Sign-up error:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Registration failed';
    }
};

export const getSeries = async () => {
    try {
        const response = await api.get('/series/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching series:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to fetch series';
    }
};


export const getSeriesDetails = async (id) => {
    try {
        const response = await api.get(`/series/${id}`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching series details:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to fetch series details';
    }
};

export const getEpisode = async (seriesId, episodeId) => {
    try {
        const response = await api.get(`/series/${seriesId}/episode/${episodeId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching episode:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to fetch episode';
    }
};


export const createEpisode = async (seriesId, episode) => {
  try {
    const response = await api.post(`/admin/series/add-episode`, episode);
    return response.data;
  } catch (error) {
    console.error('Error adding episode:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Failed to add episode';
  }
};


export const updateSeries = async (seriesId, series) => {
    try {
        const response = await api.put(`/admin/series/${seriesId}`, series);
        return response.data;
    } catch (error) {
        console.error('Error updating series:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to update series';
    }
};

export const updateEpisode = async (episodeId, episode) => {
    try {
        const response = await api.put(`/admin/series/episodes/${episodeId}`, episode);
        return response.data;
    } catch (error) {
        console.error('Error updating episode:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to update episode';
    }
};

export const getEpisodesBySeries = async (seriesId) => {
    try {
        const response = await api.get(`/series/${seriesId}/episodes`);
        return response.data;
    } catch (error) {
        console.error('Episodlarni olish xatosi:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Episodlarni olishda xato';
    }
};

export const getAllVideos = async () => {
  const response = await api.get("/admin/series/all"); 
  return response.data;
};

export const getAllSeries = async () => {
  const response = await api.get("/series/all");
  return response.data; 
};


export default api;
