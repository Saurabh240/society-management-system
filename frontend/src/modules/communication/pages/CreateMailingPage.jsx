import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, X } from "lucide-react";
import { ASSOCIATIONS, TEMPLATES } from "../data";

const RECIPIENT_TYPES = ["Association Owners", "Board Members", "All Residents"];
const TEMPLATE_LEVELS = ["Association", "Individual"];

const SectionCard = ({ title, children }) => (
  <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const selectCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition";
const inputCls  = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition";
const labelCls  = "block text-sm font-medium text-gray-700 mb-1";

export default function CreateMailingPage({ mailingData = null }) {
  const navigate = useNavigate();
  const isEdit   = !!mailingData;

  const [recipientType,  setRecipientType]  = useState("Association Owners");
  const [association,    setAssociation]    = useState(mailingData?.associationName || "");
  const [selectedOwners, setSelectedOwners] = useState(mailingData?.recipients || []);
  const [templateLevel,  setTemplateLevel]  = useState("Association");
  const [template,       setTemplate]       = useState("");
  const [mailingTitle,   setMailingTitle]   = useState(mailingData?.title   || "");
  const [content,        setContent]        = useState(mailingData?.content || "");

  // Owners of selected association
  const assocObj    = ASSOCIATIONS.find((a) => a.name === association);
  const ownersList  = assocObj?.owners || [];

  const toggleOwner = (owner) => {
    setSelectedOwners((prev) =>
      prev.find((o) => o.id === owner.id)
        ? prev.filter((o) => o.id !== owner.id)
        : [...prev, owner]
    );
  };

  const removeOwner = (id) => setSelectedOwners((prev) => prev.filter((o) => o.id !== id));

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard/communication/mailings");
  };

  return (
    <div className="max-w-6xl w-full mx-auto py-6 px-4">

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Communication
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{isEdit ? "Edit Mailing" : "Create Mailing"}</h1>

      <form onSubmit={handleSubmit}>

        {/* From Address */}
        <SectionCard title="From Address">
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white mb-2">
            <p className="text-sm font-semibold text-gray-900">Acme Property Management</p>
            <p className="text-sm text-gray-600">123 Main Street, Suite 100, Los Angeles, CA 90012</p>
          </div>
          <p className="text-xs text-gray-400">From address is pulled from Settings → Account</p>
        </SectionCard>

        {/* To Address */}
        <SectionCard title="To Address (Recipients)">
          <div className="space-y-4">

            {/* Recipient Type */}
            <div>
              <label className={labelCls}>Recipient Type <span className="text-red-500">*</span></label>
              <select value={recipientType} onChange={(e) => setRecipientType(e.target.value)} className={selectCls}>
                {RECIPIENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Association */}
            <div>
              <label className={labelCls}>Association <span className="text-red-500">*</span></label>
              <select value={association} onChange={(e) => { setAssociation(e.target.value); setSelectedOwners([]); }} className={selectCls}>
                <option value="">Select an association</option>
                {ASSOCIATIONS.map((a) => <option key={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Select Owners */}
            {assocObj && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls + " mb-0"}>Select Owners</label>
                  <button type="button" onClick={() => setSelectedOwners(ownersList)} className="text-xs text-blue-600 hover:underline">Select All</button>
                </div>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {ownersList.map((owner) => (
                    <label key={owner.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={!!selectedOwners.find((o) => o.id === owner.id)}
                        onChange={() => toggleOwner(owner)}
                        className="w-4 h-4"
                        style={{ accentColor: "var(--color-primary)" }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{owner.name}</p>
                        <p className="text-xs text-gray-500">{owner.unit} • {owner.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Recipients tags */}
            {selectedOwners.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Selected Recipients ({selectedOwners.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOwners.map((o) => (
                    <span key={o.id} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2 py-1 rounded">
                      {o.name}
                      <button type="button" onClick={() => removeOwner(o.id)} className="text-blue-400 hover:text-blue-600"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Select Template */}
        <SectionCard title="Select Template (Optional)">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Template Level</label>
              <select value={templateLevel} onChange={(e) => setTemplateLevel(e.target.value)} className={selectCls}>
                {TEMPLATE_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Template</label>
              <select value={template} onChange={(e) => setTemplate(e.target.value)} className={selectCls}>
                <option value="">-- Select a template (optional) --</option>
                {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.category}</option>)}
              </select>
            </div>
            {template && (
              <div className="border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-sm text-gray-600 space-y-1">
                {(() => {
                  const t = TEMPLATES.find((t) => String(t.id) === template);
                  return t ? (
                    <>
                      <p>Template Preview</p>
                      <p>Category: {t.category}</p>
                      <p>Description: Standard {t.category.toLowerCase()} template</p>
                      <p>Subject: Your {t.name}</p>
                    </>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Mailing Details */}
        <SectionCard title="Mailing Details">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Mailing Title <span className="text-red-500">*</span></label>
              <input type="text" value={mailingTitle} onChange={(e) => setMailingTitle(e.target.value)} placeholder="Enter mailing title" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Content <span className="text-red-500">*</span></label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter content" rows={5} required className={`${inputCls} resize-y`} />
            </div>
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex justify-start gap-3 pt-2 pb-6">
          <button type="submit" className="px-5 py-2 text-sm text-white rounded-lg transition hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>
            {isEdit ? "Update Mailing" : "Create Mailing"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}