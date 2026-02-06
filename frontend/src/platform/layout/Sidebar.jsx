import Navigation from "./Navigation";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-200 p-4">
      <h2 className="font-bold mb-4">Dashboard</h2>
      <Navigation />
    </aside>
  );
}
