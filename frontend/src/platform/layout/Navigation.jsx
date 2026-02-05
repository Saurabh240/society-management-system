import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="flex flex-col gap-3">
      <Link to="/dashboard">Home</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/settings">Settings</Link>
    </nav>
  );
}
