import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage/LandingPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';
import { RoomLayout } from './pages/RoomPage/RoomLayout';
import { RoomHomePage } from './pages/RoomPage/RoomHomePage';
import { RoomTradePage } from './pages/RoomPage/RoomTradePage';
import { PortfolioPage } from './pages/RoomPage/PortfolioPage';
import { SummaryPage } from './pages/RoomPage/SummaryPage';
import { TransactionHistoryPage } from './pages/RoomPage/TransactionHistoryPage';
import { OwnerRoomLayout } from './pages/OwnerRoomPage/OwnerRoomLayout';
import { OwnerDashboardPage } from './pages/OwnerRoomPage/OwnerDashboardPage';
import { OwnerPlayersPage } from './pages/OwnerRoomPage/OwnerPlayersPage';
import { OwnerTransactionsPage } from './pages/OwnerRoomPage/OwnerTransactionsPage';
import { OwnerLeaderboardPage } from './pages/OwnerRoomPage/OwnerLeaderboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<RoleRoute allowedRole="STUDENT" />}>
            <Route path="/room/:roomId" element={<RoomLayout />}>
              <Route index element={<RoomHomePage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="trade" element={<RoomTradePage />} />
              <Route path="transactions" element={<TransactionHistoryPage />} />
              <Route path="summary" element={<SummaryPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allowedRole="LECTURER" />}>
            <Route path="/owner/rooms/:roomId" element={<OwnerRoomLayout />}>
              <Route index element={<OwnerDashboardPage />} />
              <Route path="players" element={<OwnerPlayersPage />} />
              <Route path="transactions" element={<OwnerTransactionsPage />} />
              <Route path="leaderboard" element={<OwnerLeaderboardPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
