import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav className="flex flex-col gap-3">
      <Link to="/dashboard">Home</Link>
      <Link to="/dashboard/profile">Profile</Link>
      <Link to="/dashboard/settings">Settings</Link>
    </nav>
  );
}
