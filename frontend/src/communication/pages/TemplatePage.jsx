import { useState } from "react";

const TEMPLATES_DATA = [
  { id: 1, name: "Monthly Newsletter", level: "Association", category: "Newsletter", lastModified: "2026-02-20" },
  { id: 2, name: "Violation Notice",   level: "Individual",  category: "Compliance", lastModified: "2026-01-15" },
  { id: 3, name: "Welcome Letter",     level: "Individual",  category: "Onboarding", lastModified: "2025-12-10" },
];

const COLUMNS = ["Template Name", "Level", "Category", "Last Modified"];

export default function TemplatePage() {
  const [filterLevel, setFilterLevel] = useState("");
  const [viewItem, setViewItem]         = useState(null);

  const filtered = TEMPLATES_DATA.filter((t) => !filterLevel || t.level === filterLevel);

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Level</label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 w-44"
            style={{ "--tw-ring-color": "var(--color-primary)" }}
          >
            <option value="">All Levels</option>
            <option value="Association">Association</option>
            <option value="Individual">Individual</option>
          </select>
        </div>
        <button className="text-white text-sm font-medium px-4 py-2 rounded transition hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>
          + Create Template
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-gray-900 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead style={{ backgroundColor: "#a9c3f7" }} className="text-xs uppercase tracking-wide">
            <tr>
              {COLUMNS.map((col, i) => (
                <th key={col} className="px-4 py-3 whitespace-nowrap font-semibold" style={{ color: "#050505", borderRight: i < COLUMNS.length - 1 ? "1px solid #c8c7c7" : "none" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-sm text-gray-400">No templates found.</td></tr>
            ) : (
              filtered.map((item, idx) => (
                <tr key={item.id} className="transition"
                  style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#F8F9FC" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EEF1F9"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#F8F9FC"}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 underline cursor-pointer" style={{ borderRight: "1px solid #c8c7c7", color: "var(--color-primary)" }} onClick={() => setViewItem(item)}>{item.name}</td>
                  <td className="px-4 py-3 text-gray-700" style={{ borderRight: "1px solid #c8c7c7" }}>{item.level}</td>
                  <td className="px-4 py-3 text-gray-700" style={{ borderRight: "1px solid #c8c7c7" }}>{item.category}</td>
                  <td className="px-4 py-3 text-gray-700">{item.lastModified}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {viewItem && (
        <div className="fixed inset-0 z-[9999] bg-black/40" onClick={() => setViewItem(null)}>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">View Template</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-4"><span className="text-gray-500 w-32">Template Name:</span><span className="font-medium text-gray-900">{viewItem.name}</span></div>
                <div className="flex gap-4"><span className="text-gray-500 w-32">Level:</span><span className="text-gray-700">{viewItem.level}</span></div>
                <div className="flex gap-4"><span className="text-gray-500 w-32">Category:</span><span className="text-gray-700">{viewItem.category}</span></div>
                <div className="flex gap-4"><span className="text-gray-500 w-32">Last Modified:</span><span className="text-gray-700">{viewItem.lastModified}</span></div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setViewItem(null)} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}