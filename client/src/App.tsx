import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSocketEvents } from "./hooks/useSocket";
import { HomePage } from "./pages/HomePage";
import { MenuPage } from "./pages/MenuPage";
import { CreateRoomPage } from "./pages/CreateRoomPage";
import { JoinRoomPage } from "./pages/JoinRoomPage";
import { LobbyPage } from "./pages/LobbyPage";
import { GamePage } from "./pages/GamePage";
import { ResultPage } from "./pages/ResultPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";

function AppRoutes() {
  // Register all socket event listeners at the app level
  useSocketEvents();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/create" element={<CreateRoomPage />} />
      <Route path="/join" element={<JoinRoomPage />} />
      <Route path="/lobby/:roomCode" element={<LobbyPage />} />
      <Route path="/game/:roomCode" element={<GamePage />} />
      <Route path="/result/:id" element={<ResultPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
