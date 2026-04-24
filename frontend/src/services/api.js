import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokenUtils';
import { encryptPayload, decryptPayload } from '../utils/cryptoUtils';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({ baseURL: BASE_URL });

// Agrega el token JWT a cada petición
api.interceptors.request.use(config => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Si el token expiró (401), intenta refrescarlo automáticamente
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = getRefreshToken();
            if (refreshToken) {
                try {
                    const res = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh: refreshToken });
                    const newAccess = res.data.access;
                    setTokens(newAccess, refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return api(originalRequest);
                } catch {
                    clearTokens();
                    globalThis.location.reload();
                }
            } else {
                clearTokens();
                globalThis.location.reload();
            }
        }
        throw error;
    }
);

// --- Autenticación (sin token requerido) ---
export const login = (data) => axios.post(`${BASE_URL}/login/`, data);
export const register = (data) => axios.post(`${BASE_URL}/auth/register/`, data);
export const verifyEmail = (data) => axios.post(`${BASE_URL}/auth/verify-email/`, data);
export const resendVerificationCode = (data) => axios.post(`${BASE_URL}/auth/resend-code/`, data);

// --- Documentos ---
export const getDocuments = () => api.get('/documents/');
export const createDocument = (data) => api.post('/documents/', data);
export const updateDocument = (id, data) => api.patch(`/documents/${id}/`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}/`);

// --- Acciones de documentos ---
export const acquireLock = (id) => api.post(`/documents/${id}/acquire_lock/`);
export const releaseLock = (id) => api.post(`/documents/${id}/release_lock/`);
export const sendHeartbeat = (id) => api.post(`/documents/${id}/heartbeat/`);
export const autosaveDocument = (id, content) => api.post(`/documents/${id}/autosave/`, { content });
export const saveVersion = (id, data) => api.post(`/documents/${id}/save_version/`, data);

// --- Permisos y compartir ---
export const shareDocument = (id, data) => api.post(`/documents/${id}/share/`, data);
export const revokePermission = (id, data) => api.post(`/documents/${id}/revoke_permission/`, data);
export const getMyInvitations = () => api.get('/documents/my_invitations/');
export const acceptInvitation = (data) => api.post('/documents/accept_invitation/', data);
export const rejectInvitation = (data) => api.post('/documents/reject_invitation/', data);

// --- Links públicos ---
export const generateShareLink = async (id, role) => {
    const payload = await encryptPayload({ endpoint: 'generate_share_link', doc_id: id, role });
    const res = await api.post('/secure/', { payload });
    const decrypted = await decryptPayload(res.data.data);
    if (decrypted.error) {
        const err = new Error(decrypted.error);
        err.response = { data: decrypted };
        throw err;
    }
    return { data: decrypted };
};
export const getPublicDocument = (token) => axios.get(`${BASE_URL}/share/${token}/`);

// --- Usuarios ---
export const searchUsers = (q) => api.get(`/users/?search=${encodeURIComponent(q)}`);

// --- Perfil de usuario ---
export const getProfile = () => api.get('/auth/profile/');
export const updateProfile = (data) => api.patch('/auth/profile/', data);
export const changePassword = (data) => api.post('/auth/change-password/', data);

export default api;
