const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://food-backend-production-a5b7.up.railway.app';
export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;
export const IMAGE_BASE_URL = API_BASE_URL;

export default {
    API_URL,
    SOCKET_URL,
    IMAGE_BASE_URL
};
