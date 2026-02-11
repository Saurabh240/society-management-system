
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./platform/auth/LoginPage";
import SignUpPage from "./platform/auth/SignUpPage"; 
import ProtectedRoute from "./platform/routing/ProtectedRoute";

function Dashboard() {
  return <h1>Dashboard (Protected)</h1>;
}

export default function App() {
  return (
    <Routes>
      
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protected route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      
    </Routes>
  );
}
