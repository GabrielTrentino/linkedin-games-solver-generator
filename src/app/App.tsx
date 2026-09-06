import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";
import { HistoryChartPage } from "./pages/HistoryChartPage";
import { HistoryLayout } from "./pages/HistoryLayout";
import { HistoryListPage } from "./pages/HistoryListPage";
import { HomePage } from "./pages/HomePage";
import { PlayPage } from "./pages/PlayPage";
import { PuzzleAttemptsPage } from "./pages/PuzzleAttemptsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StatsPage } from "./pages/StatsPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<StatsPage />} />
        <Route path="/mesa" element={<HomePage />} />
        <Route path="/game/:gameId" element={<HistoryLayout />}>
          <Route index element={<HistoryListPage />} />
          <Route path="tempos" element={<HistoryChartPage />} />
          <Route path="fase/:puzzleId" element={<PuzzleAttemptsPage />} />
          <Route path="nova" element={<HomePage />} />
        </Route>
        <Route path="/play/:puzzleId" element={<PlayPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/stats" element={<Navigate to="/" replace />} />
        <Route path="/history" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
