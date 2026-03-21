import { useNavigate }   from "react-router-dom";
import { TEMPLATES }     from "../data";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useState } from "react";

export default function TemplatePage() {
  const navigate = useNavigate();
  const [filterLevel, setFilterLevel] = useState("");
  const [viewItem, setViewItem]       = useState(null);

  const filtered = TEMPLATES.filter((t) => !filterLevel || t.level === filterLevel);

  return (
    <div>

      {/* Toolbar — stacks on mobile, side-by-side on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between mb-4">
        <div className="w-full sm:w-44">
          <Select
            label="Filter by Level"
            name="filterLevel"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            fullWidth
            options={[
              { label: "All Levels",  value: ""            },
              { label: "Association", value: "Association" },
              { label: "Individual",  value: "Individual"  },
            ]}
          />
        </div>
        <Button variant="primary" size="sm" className="w-full sm:w-auto" onClick={() => navigate("create")}>
          + Create Template
        </Button>
      </div>

      {/* Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tl-xl">Template Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Level</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Category</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">Last Modified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-500 italic">No templates found.</td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td
                    className={`border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer text-center ${idx === filtered.length - 1 ? "rounded-bl-xl" : ""}`}
                    style={{ color: "var(--color-primary)" }}
                    onClick={() => setViewItem(item)}
                  >
                    {item.name}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{item.level}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{item.category}</td>
                  <td className={`p-4 text-sm text-gray-700 text-center ${idx === filtered.length - 1 ? "rounded-br-xl" : ""}`}>
                    {item.lastModified}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Template Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center px-4" onClick={() => setViewItem(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">View Template</h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                <span className="text-gray-500 sm:w-32">Template Name:</span>
                <span className="font-medium text-gray-900">{viewItem.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                <span className="text-gray-500 sm:w-32">Level:</span>
                <span className="text-gray-700">{viewItem.level}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                <span className="text-gray-500 sm:w-32">Category:</span>
                <span className="text-gray-700">{viewItem.category}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                <span className="text-gray-500 sm:w-32">Last Modified:</span>
                <span className="text-gray-700">{viewItem.lastModified}</span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" size="sm" onClick={() => setViewItem(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}