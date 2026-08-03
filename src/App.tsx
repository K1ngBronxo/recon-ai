import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { HomePage } from "./pages/dashboard/HomePage";
import { HistoryPage } from "./pages/dashboard/HistoryPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { ProfilePage } from "./pages/dashboard/ProfilePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ReconTool } from "./components/ReconTool";

/**
 * Application routes.
 *
 * Public:   /            landing page
 *           /login       Google sign-in
 * Private:  /dashboard   protected dashboard (Home, History, Settings, Profile)
 *           /app         the RECON AI workspace
 *
 * Everything runs in the browser — no desktop shell required. Google sign-in
 * gates the tools behind authentication.
 */
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Private — dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Private — main tool */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppTool />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** The workspace with a back-to-dashboard affordance in its top bar. */
function AppTool() {
  const navigate = useNavigate();
  return <ReconTool onBack={() => navigate("/dashboard")} />;
}
