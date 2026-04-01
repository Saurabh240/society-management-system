

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import { getTemplates, deleteTemplate , deleteTemplatesBulk ,getTemplateById } from "../templateApi";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { toast } from "react-toastify";


//view modal
function ViewTemplateModal({ template, onClose }) {
  const inputCls = "w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-800";

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 bg-black/40" />
      <div className="fixed inset-0 z-10000 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: "90vh" }}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">View Template</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Meta rows */}
            <div className="space-y-2 text-sm mb-5">
              {[
                ["Template Name:",  template.name],
                ["Recipient Type:", template.recipientType || "—"],
                ["Level:",          template.level],
                ["Category:",       template.category],
                ["Last Modified:",  template.lastModified],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-4">
                  <span className="text-gray-500 w-36 shrink-0">{label}</span>
                  <span className="text-gray-900 font-medium">{val}</span>
                </div>
              ))}
            </div>

            <hr className="border-gray-200 mb-5" />

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Description:</p>
                <div className={inputCls}>{template.description || "—"}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Subject:</p>
                <div className={inputCls}>{template.emailSubject || "—"}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Content:</p>
                <div className={`${inputCls} min-h-120px whitespace-pre-wrap`}>{template.content || "—"}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end px-6 py-4 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition">
              Close
            </button>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}

//action button
const ActionBtn = ({ label, onClick }) => (
  <button onClick={onClick} className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 whitespace-nowrap">
    {label}
  </button>
);

//  template page
export default function TemplatePage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState("");
  const [selected, setSelected] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const associationId = Number(localStorage.getItem("associationId"));

 useEffect(() => {
  if (associationId === null || associationId === undefined) {
    console.warn("Association ID is missing.");
    return;
  }
  fetchTemplates();
}, [filterLevel, associationId]);

  const fetchTemplates = async () => {
  try {
      setLoading(true);
      
  const levelParam = filterLevel ? filterLevel.toUpperCase() : "";
      const res = await getTemplates(levelParam, associationId);

      setTemplates(res?.data || []);
      console.log("API RESPONSE:", res);
    } catch (error) {
      console.error("Fetch templates failed", error);
      toast.error("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    
  
      try {
        setLoading(true);
        await deleteTemplatesBulk(selected); 
        toast.success(`${selected.length} templates deleted`);

        setSelected([]); 
        await fetchTemplates(); 
      } catch (err) {
        console.error("Bulk delete failed", err);
        toast.error("Bulk delete failed");
      } finally {
        setLoading(false);
      }
    
  };

  const handleDelete = async (id) => {
    try {
      await deleteTemplate(id);
      toast.success("Template deleted successfully");
      setSelected((prev) => prev.filter((item) => item !== id)); 
      fetchTemplates();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete template");
    }
  };


  const handleView = async (id) => {
  try {
    setLoading(true);
    const res = await getTemplateById(id);

    console.log("VIEW API:", res);

    setViewItem(res?.data); 
    toast.success("Template loaded");
  } catch (err) {
    console.error("View failed", err);
    toast.error("Failed to load template");
  } finally {
    setLoading(false);
  }
};

  const filtered = templates;
  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((t) => t.id));

  const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date + "Z").toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Level</label>
          <div className="relative">
            <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white w-40"
          >
            <option value="">All Levels</option>
           
            {["Association", "Individual", "Vendor"].map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/communication/templates/create")}
          className="px-4 py-2 text-sm text-white rounded transition hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: "#0e2862" }}
        >
          + Create Template
        </button>
      </div>

      {/* Bulk delete bar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-4">
          <span className="text-sm text-gray-600">{selected.length} item{selected.length > 1 ? "s" : ""} selected</span>
          <button onClick={() => setBulkDeleteOpen(true)}
          disabled={selected.length === 0}
          className="px-3 py-1.5 text-sm text-white rounded-lg transition hover:opacity-90" 
          style={{ backgroundColor: "var(--color-danger)" }}>
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-center rounded-tl-xl w-10">
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4 cursor-pointer" />
              </th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Template Name</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Level</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Category</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Last Modified</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500 ">No templates found.</td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`border-r border-gray-200 p-4 text-center ${idx === filtered.length - 1 ? "rounded-bl-xl" : ""}`}>
                    <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer" style={{ color: "var(--color-primary)" }} onClick={() => handleView(item.id)}>
                    {item.name}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700">{item.level}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700">{item.category}</td>
                 <td className="border-r border-gray-200 p-4 text-sm text-gray-700">
                     {formatDate(item.updatedAt || item.lastModified)}
                       </td>
      
                  <td className={`p-4 ${idx === filtered.length - 1 ? "rounded-br-xl" : ""}`}>
                    <div className="flex items-center gap-2">
                      <ActionBtn label="Edit"   onClick={() => navigate("/dashboard/communication/templates/create", { state: { template: item } })} />
                      <ActionBtn label="Delete" onClick={() => setDeleteItem(item)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewItem   && <ViewTemplateModal template={viewItem} onClose={() => setViewItem(null)} />}
      {deleteItem && (
  <DeleteConfirmModal
    title="Delete Template"
    message="Are you sure you want to delete this template?"
    onClose={() => setDeleteItem(null)}
    onConfirm={() => {
     
      handleDelete(deleteItem.id); 
      setDeleteItem(null);
    }}
  />
  
)}
{bulkDeleteOpen && (
  <DeleteConfirmModal
    title="Delete Templates"
    message={`Are you sure you want to delete ${selected.length} selected template(s)? This action cannot be undone.`}
    onClose={() => setBulkDeleteOpen(false)}
    onConfirm={() => {
      handleBulkDelete();
      setBulkDeleteOpen(false);
    }}
  />
)}
    </div>
  );
}