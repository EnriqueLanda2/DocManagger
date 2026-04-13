import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Obtiene el access token del localStorage
 */
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Obtiene el refresh token del localStorage
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

/**
 * Guarda los tokens en localStorage
 */
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

/**
 * Limpia los tokens del localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Intenta refrescar el access token usando el refresh token
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    clearTokens();
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
    const newAccess = response.data.access;
    localStorage.setItem('access_token', newAccess);
    return newAccess;
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    clearTokens();
    return null;
  }
};

/**
 * Realiza una petición GET con manejo automático de token
 */
export const apiGet = async (url) => {
  let token = getAccessToken();
  
  if (!token) {
    throw new Error('No hay token disponible');
  }

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Si el token expiró, intenta refrescarlo
  if (response.status === 401) {
    token = await refreshAccessToken();
    if (!token) {
      throw new Error('Token expirado y no se pudo refrescar');
    }
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  return response;
};

/**
 * Realiza una petición POST con manejo automático de token
 */
export const apiPost = async (url, body = {}) => {
  let token = getAccessToken();
  
  if (!token) {
    throw new Error('No hay token disponible');
  }

  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  // Si el token expiró, intenta refrescarlo
  if (response.status === 401) {
    token = await refreshAccessToken();
    if (!token) {
      throw new Error('Token expirado y no se pudo refrescar');
    }
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  }

  return response;
};

/**
 * Realiza una petición PATCH con manejo automático de token
 */
export const apiPatch = async (url, body = {}) => {
  let token = getAccessToken();
  
  if (!token) {
    throw new Error('No hay token disponible');
  }

  let response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  // Si el token expiró, intenta refrescarlo
  if (response.status === 401) {
    token = await refreshAccessToken();
    if (!token) {
      throw new Error('Token expirado y no se pudo refrescar');
    }
    response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  }

  return response;
};
