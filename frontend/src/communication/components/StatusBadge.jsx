export default function StatusBadge({ status }) {
  return (
    <span className="inline-block px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 bg-white">
      {status}
    </span>
  );
}