import axios from 'axios';

// Khởi tạo instance axios với config mặc định
const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR: Gắn thẻ ra vào (Token) tự động
api.interceptors.request.use(
  (config) => {
    // Bắt token từ localStorage trước khi request rời đi
    const token = localStorage.getItem('token');
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
    if (error.response && error.response.status === 401) {
      // Dọn dẹp dữ liệu phiên đăng nhập cũ
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // Điều hướng người dùng về trang đăng nhập bằng Object của Window
      window.location.href = '/login';
    }
    
    // Tiếp tục ném lỗi ra ngoài để các Component (như Form Login/Register) tự xử lý thông báo UI
    return Promise.reject(error);
  }
);

export default api;