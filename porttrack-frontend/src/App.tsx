import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage/LandingPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';
import { RoomLayout } from './pages/RoomPage/RoomLayout';
import { RoomHomePage } from './pages/RoomPage/RoomHomePage';
import { RoomTradePage } from './pages/RoomPage/RoomTradePage';
import { RoomComingSoonPage } from './pages/RoomPage/RoomComingSoonPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/room/:roomId" element={<RoomLayout />}>
          <Route index element={<RoomHomePage />} />
          <Route path="portfolio" element={<RoomComingSoonPage title="My Portfolio" />} />
          <Route path="trade" element={<RoomTradePage />} />
          <Route path="transactions" element={<RoomComingSoonPage title="Transaction History" />} />
          <Route path="summary" element={<RoomComingSoonPage title="Summary" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
