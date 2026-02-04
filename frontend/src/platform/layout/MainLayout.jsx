import { Outlet, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-200 p-4">
        <h2 className="font-bold mb-4">Dashboard</h2>

        <nav className="flex flex-col gap-2">
          <a href="/dashboard">Home</a>
          <a href="/profile">Profile</a>
          <a href="/settings">Settings</a>

          <button
            onClick={handleLogout}
            className="text-red-600 mt-4"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>

    </div>
  );
}
