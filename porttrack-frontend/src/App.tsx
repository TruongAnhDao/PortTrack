import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage/LandingPage';

// Placeholder cho trang Login (Sẽ tách thành component riêng ở các Task sau)
const LoginPage: React.FC = () => (
  <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold text-2xl">
    Màn Hình Đăng Nhập
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;