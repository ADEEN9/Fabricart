import axios from 'axios';

export const SERVER_URL = 'http://localhost:5000';

const API = axios.create({
    baseURL: `${SERVER_URL}/api`,
});

// Build a full image URL from a relative path like /uploads/products/img.jpg
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/400x400?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl; // already absolute
    return `${SERVER_URL}${imageUrl}`;
};

// Get the primary product image (supports both images[] array and legacy imageUrl)
export const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
        return getImageUrl(product.images[0].url);
    }
    return getImageUrl(product?.imageUrl);
};

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for global error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
