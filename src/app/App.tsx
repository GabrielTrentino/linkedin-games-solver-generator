import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";
import { HistoryChartPage } from "./pages/HistoryChartPage";
import { HistoryLayout } from "./pages/HistoryLayout";
import { HistoryListPage } from "./pages/HistoryListPage";
import { HomePage } from "./pages/HomePage";
import { PlayPage } from "./pages/PlayPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StatsPage } from "./pages/StatsPage";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/play/:puzzleId" element={<PlayPage />} />
        <Route path="/history" element={<HistoryLayout />}>
          <Route index element={<HistoryListPage />} />
          <Route path="tempos" element={<HistoryChartPage />} />
        </Route>
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
