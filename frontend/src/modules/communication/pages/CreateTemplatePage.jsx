
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createTemplate, updateTemplate } from "../templateApi";

const RECIPIENT_TYPES = ["Association Owners", "Board Members", "All Residents", "Vendors"];
const LEVELS          = ["Association", "Individual", "Vendor"];

const inputCls    = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition";
const selectCls   = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition appearance-none";
const labelCls    = "block text-sm font-medium text-gray-700 mb-1";
const textareaCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 resize-y transition";

export default function CreateTemplatePage() {
  const navigate   = useNavigate();
  const { state }  = useLocation();
  const template   = state?.template || null;
  const isEdit     = !!template;

  const [form, setForm] = useState({
    templateName:  template?.name          || "",
    recipientType: template?.recipientType || "Association Owners",
    level:         template?.level         || "Association",
    category:      template?.category      || "",
    description:   template?.description   || "",
    emailSubject:  template?.emailSubject  || "",
    content:       template?.content       || "",
  });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));


const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return; 

  setLoading(true);
  
  const payload = {
    
    name: form.templateName, 
    recipientType: form.recipientType,
    
    level: form.level.toUpperCase(), 
    category: form.category,
    description: form.description,
    emailSubject: form.emailSubject,
    content: form.content,
    associationId: Number(localStorage.getItem("associationId"))
  };

  try {
    if (isEdit) {
      await updateTemplate(template.id, payload);
    } else {
      await createTemplate(payload);
    }
    navigate("/dashboard/communication/templates");
  } catch (error) {
    console.error("Save failed", error.response?.data || error.message);
    alert(`Error: ${error.response?.data?.message || "Failed to save template"}`);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <button onClick={() => navigate("/dashboard/communication/templates")} className="hover:underline text-gray-500">
          Communication
        </button>
        <span>/</span>
        <span className="text-gray-800">{isEdit ? "Edit Template" : "Create Template"}</span>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{isEdit ? "Edit Template" : "Create Template"}</h1>

      {/* Single card */}
      <div className="border border-gray-200 rounded-lg bg-white p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className={labelCls}>Template Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.templateName} onChange={set("templateName")} placeholder="Enter template name" required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Recipient Type <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={form.recipientType} onChange={set("recipientType")} required className={selectCls}>
                {RECIPIENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Level <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={form.level} onChange={set("level")} required className={selectCls}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <input type="text" value={form.category} onChange={set("category")} placeholder="e.g., Newsletter, Compliance, Onboarding" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={set("description")} placeholder="Enter template description" rows={3} className={textareaCls} />
          </div>

          <div>
            <label className={labelCls}>Email Subject <span className="text-red-500">*</span></label>
            <input type="text" value={form.emailSubject} onChange={set("emailSubject")} placeholder="Enter email subject" required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Content <span className="text-red-500">*</span></label>
            <textarea value={form.content} onChange={set("content")} placeholder="Enter email content" rows={8} required className={textareaCls} />
          </div>

          <hr className="border-gray-200" />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate("/dashboard/communication/templates")} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm text-white rounded transition hover:opacity-90" style={{ backgroundColor: "#102b65" }}>
              {loading ? "Saving..." : (isEdit ? "Update Template" : "Save Template")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
