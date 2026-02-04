import { Routes, Route } from "react-router-dom";

import Login from "./platform/auth/LoginPage";
import ProtectedRoute from "./platform/routing/ProtectedRoute";


import MainLayout from "./platform/layout/MainLayout";

// Dummy page
function Dashboard() {
  return <h1>Dashboard</h1>;
}

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

    </Routes>
  );
}

export default App;
