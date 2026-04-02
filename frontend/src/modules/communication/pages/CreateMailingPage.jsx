import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  createMailing,
  updateMailing,
  getMailingById,
  getAssociationOwners,
} from "../mailingApi";
import { getAssociations } from "../../associations/associationApi";
import { getTemplates } from "../templateApi";

const RECIPIENT_TYPES = [
  { label: "Association Owners", value: "OWNER" },        
  { label: "Board Members", value: "BOARD_MEMBERS" },
  { label: "All Residents", value: "ALL_RESIDENTS" },
  { label: "All Owners", value: "ALL_OWNERS" },        
];

const TEMPLATE_LEVELS = [
  { label: "Association", value: "ASSOCIATION" },
  { label: "Individual", value: "INDIVIDUAL" },
];

const SectionCard = ({ title, children }) => (
  <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const selectCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const inputCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function CreateMailingPage() {
  const navigate = useNavigate();
  
  const { id, tenantId } = useParams();
  console.log("Params:", { id, tenantId });
  const isEdit = !!id;

  // Form State
  const [associationId, setAssociationId] = useState("");
  
  const [recipientType, setRecipientType] = useState("OWNER"); 
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [templateLevel, setTemplateLevel] = useState("ASSOCIATION");
  const [templateId, setTemplateId] = useState("");
  const [mailingTitle, setMailingTitle] = useState("");
  const [content, setContent] = useState("");

  // UI/Data State
  const [associations, setAssociations] = useState([]);
  const [ownersList, setOwnersList] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssociations();
    if (isEdit) fetchMailing();
  }, [id]);

  useEffect(() => {
    if (associationId) {
      fetchOwners();
      fetchTemplatesData();
    } else {
      setOwnersList([]);
      setTemplates([]);
    }
  }, [associationId, templateLevel]);

  const fetchAssociations = async () => {
    try {
      const res = await getAssociations();
      const list = res.data?.data || res.data?.content || res.data || [];
      setAssociations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch associations", err);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await getAssociationOwners(associationId);
      const data = res.data?.data || res.data?.content || res.data || [];
      setOwnersList(data);
    } catch (err) {
      console.error("Owners error:", err);
      toast.error("Failed to load owners for this association.");
      setOwnersList([]);
    }
  };

  const fetchTemplatesData = async () => {
    try {
      const res = await getTemplates(templateLevel, associationId);
      const data = res.data?.data || res.data?.content || res.data || [];
      setTemplates(data);
    } catch (err) {
      console.error("Templates error:", err);
      setTemplates([]);
    }
  };

  const fetchMailing = async () => {
    setLoading(true);
    try {
      const res = await getMailingById(id);
      const data = res.data?.data || res.data;
      setRecipientType(data.recipientType);
      setAssociationId(String(data.associationId));
      setSelectedOwners(data.ownerIds || []);
      setTemplateId(data.templateId ? String(data.templateId) : "");
      setMailingTitle(data.title || "");
      setContent(data.content || "");
    } catch (err) {
      console.error("Fetch mailing error:", err);
      toast.error("Could not retrieve mailing details.");
    } finally {
      setLoading(false);
    }
  };

  const toggleOwner = (ownerId) => {
    setSelectedOwners((prev) =>
      prev.includes(ownerId) ? prev.filter((i) => i !== ownerId) : [...prev, ownerId]
    );
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    const payload = {
      associationId: Number(associationId),
      recipientType,
      title: mailingTitle,
      content,
      ...(recipientType === "OWNER" && selectedOwners.length > 0 && {
  ownerIds: selectedOwners.map((ownerId) => Number(ownerId)),
}),
      ...(templateId && { templateId: Number(templateId) }),
    };
console.log("FINAL PAYLOAD:", JSON.stringify(payload, null, 2));
    console.log("Submitting Payload:", payload);

    if (isEdit) {
      await updateMailing(id, payload);
      toast.success("Mailing updated successfully!");
    } else {
      await createMailing(payload);
      toast.success("Mailing created and sent successfully!");
    }

    navigate(`/dashboard/${tenantId}/communication/mailings`);
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Internal Server Error";
      toast.error(`Error: ${errorMessage}`);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-6xl w-full mx-auto py-6 px-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Communication
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEdit ? "Edit Mailing" : "Create Mailing"}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* From Address Section */}
        <SectionCard title="From Address">
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white mb-2 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Acme Property Management</p>
            <p className="text-sm text-gray-600">123 Main Street, Suite 100, Los Angeles, CA 90012</p>
          </div>
          <p className="text-xs text-gray-400">From address is pulled from Settings → Account</p>
        </SectionCard>

        {/* Recipients Section */}
        <SectionCard title="To Address (Recipients)">
          <div className="space-y-4">
            {/* Recipient Type */}
            <div>
              <label className={labelCls}>Recipient Type <span className="text-red-500">*</span></label>
              <select value={recipientType} onChange={(e) => setRecipientType(e.target.value)} className={selectCls}>
                {RECIPIENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Association */}
            <div>
              <label className={labelCls}>Association <span className="text-red-500">*</span></label>
              <select 
                value={associationId} 
                onChange={(e) => { setAssociationId(e.target.value); setSelectedOwners([]); }} 
                className={selectCls} 
                required
              >
                <option value="">Select an association</option>
                {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Owner Multi-Select List */}
            {recipientType === "OWNER" && associationId && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls + " mb-0"}>Select Owners</label>
                  <button 
                    type="button" 
                    onClick={() => setSelectedOwners(ownersList.map(o => o.ownerId))} 
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto shadow-inner">
                  {ownersList.length === 0 && <p className="p-4 text-sm text-gray-400 italic">No owners found.</p>}
                  {ownersList.map((owner) => (
                    <label key={owner.ownerId} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedOwners.includes(owner.ownerId)}
                        onChange={() => toggleOwner(owner.ownerId)}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: "var(--color-primary)" }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{owner.name}</p>
                        <p className="text-xs text-gray-500">{owner.unitNumber} • {owner.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Recipient Tags */}
            {selectedOwners.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Selected Recipients ({selectedOwners.length})</p>
                <div className="flex flex-wrap gap-2">
                  {ownersList.filter(o => selectedOwners.includes(o.ownerId)).map((o) => (
                    <span key={o.ownerId} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2 py-1 rounded">
                      {o.name}
                      <button 
                        type="button" 
                        onClick={() => setSelectedOwners(prev => prev.filter(id => id !== o.ownerId))} 
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Template Section */}
        <SectionCard title="Select Template (Optional)">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Template Level</label>
              <select value={templateLevel} onChange={(e) => setTemplateLevel(e.target.value)} className={selectCls}>
                {TEMPLATE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Template</label>
              <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={selectCls}>
                <option value="">-- Select a template (optional) --</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Mailing Details Section */}
        <SectionCard title="Mailing Details">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Mailing Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={mailingTitle} 
                onChange={(e) => setMailingTitle(e.target.value)} 
                placeholder="Enter mailing title" 
                required 
                className={inputCls} 
              />
            </div>
            <div>
              <label className={labelCls}>Content <span className="text-red-500">*</span></label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Enter content" 
                rows={5} 
                required 
                className={`${inputCls} resize-y`} 
              />
            </div>
          </div>
        </SectionCard>

        {/* Final Actions */}
        <div className="flex justify-start gap-3 pt-2 pb-6">
          <button 
            type="submit" 
            disabled={submitting}
            className="px-6 py-2 text-sm text-white rounded-lg transition hover:opacity-90 flex items-center gap-2" 
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? "Update Mailing" : "Create Mailing"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


