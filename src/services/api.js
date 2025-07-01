import axios from 'axios';

const API_URL = 'http://localhost:8080';

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

export const signUp = async (email, password) => {
    try {
        const response = await api.post('/auth/sign-up', { email, password });
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
        const response = await api.get('/series/');
        return response.data;
    } catch (error) {
        console.error('Error fetching series:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to fetch series';
    }
};


export const getSeriesDetails = async (id) => {
    try {
        const response = await api.get(`/series/${id}`);
        return response.data; // Returns GetDetailsResponse
    } catch (error) {
        console.error('Error fetching series details:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to fetch series details';
    }
};

export const getEpisode = async (seriesId, episodeId) => {
    try {
        const response = await api.get(`/series/${seriesId}/episode/${episodeId}`);
        return response.data; // Returns EpisodeDto
    } catch (error) {
        console.error('Error fetching episode:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to fetch episode';
    }
};


export const createEpisode = async (seriesId, episode) => {
    try {
        const response = await api.post(`/admin/series/${seriesId}/episodes`, episode);
        return response.data; // Returns EpisodeDto or response data
    } catch (error) {
        console.error('Error adding episode:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to add episode';
    }
};


export const updateEpisode = async (episodeId, episode) => {
    try {
        const response = await api.put(`/admin/series/episodes/${episodeId}`, episode);
        return response.data; // Returns EpisodeDto or response data
    } catch (error) {
        console.error('Error updating episode:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to update episode';
    }
};

export const uploadFile = async (file, type) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        const response = await api.post('/admin/series/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.url;
    } catch (error) {
        console.error('Fayl yuklash xatosi:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Fayl yuklashda xato';
    }
};

// Admin Episode API: Delete episode
export const deleteEpisode = async (episodeId) => {
    try {
        await api.delete(`/admin/series/episodes/${episodeId}`);
    } catch (error) {
        console.error('Error deleting episode:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to delete episode';
    }
};

// Home API: Get home data for authenticated user
export const getHomeData = async () => {
    try {
        const response = await api.get('/home');
        return response.data; // Returns HomeResponse
    } catch (error) {
        console.error('Error fetching home data:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Failed to fetch home data';
    }
};

export const getEpisodesBySeries = async (seriesId) => {
    try {
        const response = await api.get(`/admin/series/${seriesId}/episodes`);
        return response.data;
    } catch (error) {
        console.error('Episodlarni olish xatosi:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Episodlarni olishda xato';
    }
};

export default api;