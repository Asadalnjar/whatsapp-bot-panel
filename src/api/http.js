// src/api/http.js
// ============================
// Axios instance + auto token attach + auto refresh
// ============================

import axios from "axios";

// إجبار استخدام HTTP وتجنب تحويل المتصفح لـ HTTPS
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:5000');

// التأكد من أن URL يستخدم HTTP وليس HTTPS
const ensureHttpUrl = (url) => {
  if (url.startsWith('https://localhost')) {
    return url.replace('https://', 'http://');
  }
  return url;
};

const FINAL_API_URL = ensureHttpUrl(API_URL);

console.log("🔧 API URL:", FINAL_API_URL);

// عميل Axios أساسي
export const http = axios.create({
  baseURL: FINAL_API_URL,
  withCredentials: true, // مهم لإرسال/استلام كوكي refreshToken في /auth/refresh
});

// —— أدوات مساعدة —— //
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("token", token);
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete http.defaults.headers.common.Authorization;
  }
}

export function clearAuthAndRedirect() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    localStorage.removeItem("subscription");
    localStorage.removeItem("newUserId");
    delete http.defaults.headers.common.Authorization;
  } finally {
    // وجّه لصفحة الدخول
    if (typeof window !== "undefined") window.location.href = "/";
  }
}

// ——— إرفاق الـ Access Token بكل طلب ——— //
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ——— إدارة انتهاء صلاحية التوكن وتجديده تلقائياً ——— //
let refreshing = false;
let queue = []; // عناصر بشكل { resolve, reject, original }

function enqueue(original) {
  return new Promise((resolve, reject) => {
    queue.push({ resolve, reject, original });
  });
}

function flushQueue(error, token) {
  queue.forEach(({ resolve, reject, original }) => {
    if (error) {
      reject(error);
    } else {
      original.headers.Authorization = `Bearer ${token}`;
      resolve(http(original));
    }
  });
  queue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config || {};
    const status = error?.response?.status;
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "";

    // لا نحاول التجديد لهذه المسارات لتفادي الحلقات
    const url = (original?.url || "").toLowerCase();
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/register");

    // اعتبر الرسائل التالية مؤشر انتهاء صلاحية
    const looksExpired =
      msg.includes("انتهت صلاحيته") ||
      msg.includes("غير صالح") ||
      msg.toLowerCase().includes("jwt expired");

    // عندما يكون 401:
    // - لو التوكن منتهي (looksExpired) أو أصلاً مفقود، جرّب /auth/refresh مرة واحدة.
    // - لا تحاول مع auth routes.
    if (
      status === 401 &&
      !original._retry &&
      !isAuthRoute
    ) {
      original._retry = true;

      // إن كان هناك تجديد جارٍ — أدخل الطابور
      if (refreshing) return enqueue(original);

      refreshing = true;
      try {
        // استخدم axios الأصلي لتجنب الدخول في نفس الـ interceptors
        const r = await axios.get(`${FINAL_API_URL}/auth/refresh`, {
          withCredentials: true,
        });
        const newToken = r?.data?.token;
        if (!newToken) throw new Error("No new access token");

        // خزّنه واضبط الهيدرز الافتراضية
        setAuthToken(newToken);

        // فعّل جميع الطلبات المنتظرة بالتوكن الجديد
        flushQueue(null, newToken);

        // كرر الطلب الأصلي
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (e) {
        // فشل التجديد → نظّف ووجّه لتسجيل الدخول
        flushQueue(e, null);
        clearAuthAndRedirect();
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    // أي أخطاء أخرى
    return Promise.reject(error);
  }
);

export default http;
