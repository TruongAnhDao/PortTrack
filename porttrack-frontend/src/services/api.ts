import axios from 'axios';
import { clearSession, getStoredToken } from '../utils/auth';

// Khởi tạo instance axios với config mặc định
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR: Gắn thẻ ra vào (Token) tự động
api.interceptors.request.use(
  (config) => {
    // Bắt token từ localStorage trước khi request rời đi
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR: Trạm gác bắt lỗi 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    // Trả về nguyên bản nếu request thành công
    return response;
  },
  (error) => {
    // Nếu có lỗi trả về từ Backend và mã lỗi là 401 (Hết hạn Token / Không hợp lệ)
    const isAuthRequest = typeof error.config?.url === 'string'
      && error.config.url.startsWith('/api/auth/');

    if (error.response?.status === 401 && !isAuthRequest && getStoredToken()) {
      clearSession();

      if (window.location.pathname !== '/login') {
        window.location.replace('/login?reason=session-expired');
      }
    }
    
    // Tiếp tục ném lỗi ra ngoài để các Component (như Form Login/Register) tự xử lý thông báo UI
    return Promise.reject(error);
  }
);

export default api;
