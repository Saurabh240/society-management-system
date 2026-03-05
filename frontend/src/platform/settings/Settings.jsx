


export default function Settings() {
  const role = localStorage.getItem("role");

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>

      <div className="space-y-3">
        <p><strong>Role:</strong> {role}</p>

       
      </div>
    </div>
  );
}