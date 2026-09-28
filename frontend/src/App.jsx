import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import PapersPage from "./pages/PapersPage";
import AuthorsPage from "./pages/AuthorsPage";
import TopicsPage from "./pages/TopicsPage";
import NetworksPage from "./pages/NetworksPage";
import TrendsPage from "./pages/TrendsPage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="papers" element={<PapersPage />} />
          <Route path="authors" element={<AuthorsPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="networks" element={<NetworksPage />} />
          <Route path="trends" element={<TrendsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
