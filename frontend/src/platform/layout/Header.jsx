import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between">
      <h1 className="font-bold">My App</h1>

      <button
        onClick={handleLogout}
        className="text-red-600"
      >
        Logout
      </button>
    </header>
  );
}
