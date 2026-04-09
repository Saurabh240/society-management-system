
export default function StatCard({ label, value, isAlert }) {
  return (
    <div className="bg-white p-6  rounded-xl border border-gray-200 shadow-sm transition-all  duration-200 hover:shadow-md hover:-translate-y-1">
      <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-3xl font-bold ${isAlert ? "text-red-500" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}