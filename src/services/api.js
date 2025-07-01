import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tokenni so‘rovlarga qo‘shish uchun interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = async (username, password) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        return response.data;
    } catch (error) {
        console.error('Login xatosi:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Login yoki parol noto‘g‘ri';
    }
};

export const register = async (username, password) => {
    try {
        const response = await api.post('/auth/register', { username, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        return response.data;
    } catch (error) {
        console.error('Register xatosi:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Ro‘yxatdan o‘tishda xato';
    }
};

export const getMovies = async () => {
    try {
        const response = await api.get('/movies');
        return response.data;
    } catch (error) {
        console.error('Filmlarni olish xatosi:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Filmlarni olishda xato';
    }
};

export const createMovie = async (movie) => {
    try {
        const response = await api.post('/movies', movie);
        return response.data;
    } catch (error) {
        console.error('Film qo‘shish xatosi:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Film qo‘shishda xato';
    }
};

export const deleteMovie = async (id) => {
    try {
        await api.delete(`/movies/${id}`);
    } catch (error) {
        console.error('Film o‘chirish xatosi:', error.response?.data || error.message);
        throw error.response?.data?.message || 'Film o‘chirishda xato';
    }
};

export default api;