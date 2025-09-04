// src/config/api.js
// ============================
// تكوين موحد لـ API URLs
// ============================

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";

// دوال مساعدة لبناء URLs
export const buildFileUrl = (filePath) => {
  if (!filePath) return '';
  return filePath.startsWith('http') ? filePath : `${API_URL}${filePath}`;
};

export const buildApiUrl = (endpoint) => {
  return `${API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};
