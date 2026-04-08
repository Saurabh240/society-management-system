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
import { getTemplates, resolveTemplate } from "../templateApi";

const RECIPIENT_TYPES = [
  { label: "Association Owners", value: "OWNER" },
  { label: "Board Members",      value: "BOARD_MEMBERS" },
  { label: "All Residents",      value: "ALL_RESIDENTS" },
  { label: "All Owners",         value: "ALL_OWNERS" },
];

/** Variables resolved at compose time — everything else stays for backend */
const COMPOSE_TIME_VARS = new Set(["associationName", "date"]);

function extractPlaceholders(text) {
  if (!text) return [];
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

const SectionCard = ({ title, children }) => (
  <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm">
    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
      <p className="text-sm font-semibold text-gray-700">{title}</p>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const selectCls = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const inputCls  = "w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls  = "block text-sm font-medium text-gray-700 mb-1";

export default function CreateMailingPage() {
  const navigate = useNavigate();
  const { id, tenantId: paramTenantId } = useParams();
  const tenantId = paramTenantId || localStorage.getItem("tenantId");
  const isEdit = !!id;

  // Form state
  const [associationId, setAssociationId]   = useState("");
  const [associationName, setAssociationName] = useState("");
  const [recipientType, setRecipientType]   = useState("OWNER");
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [templateId, setTemplateId]         = useState("");
  const [mailingTitle, setMailingTitle]     = useState("");
  const [content, setContent]               = useState("");
  const [sendTimeVars, setSendTimeVars]     = useState([]);

  // Data state
  const [associations, setAssociations] = useState([]);
  const [ownersList, setOwnersList]     = useState([]);
  const [templates, setTemplates]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

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
      setTemplateId("");
    }
  }, [associationId]);

  const fetchAssociations = async () => {
    try {
      const res = await getAssociations();
      // ApiResponse wrapper: res.data.data is the list
      const list = res?.data?.data ?? res?.data?.content ?? res?.data ?? [];
      setAssociations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch associations", err);
    }
  };

  const fetchOwners = async () => {
    try {
      // Returns List<OwnerDto> directly — no ApiResponse wrapper
      const res = await getAssociationOwners(associationId);
      const data = Array.isArray(res?.data) ? res.data : res?.data?.content ?? [];
      setOwnersList(data);
    } catch (err) {
      toast.error("Failed to load owners for this association.");
      setOwnersList([]);
    }
  };

  const fetchTemplatesData = async () => {
    try {
      setLoadingTemplates(true);
      // getTemplates() returns all templates for the tenant — tenant isolation is server-side
      const res = await getTemplates();
      const data = Array.isArray(res?.data) ? res.data : res?.data?.content ?? [];
      setTemplates(data);
    } catch (err) {
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchMailing = async () => {
    setLoading(true);
    try {
      const res = await getMailingById(id);
      const data = res?.data?.data ?? res?.data;
      setRecipientType(data.recipientType || "OWNER");
      setAssociationId(String(data.associationId));
      setMailingTitle(data.title || "");
      setContent(data.content || "");
      if (data.templateId) setTemplateId(String(data.templateId));
      if (data.ownerIds)   setSelectedOwners(data.ownerIds.map(Number));
      updateSendTimeVars(data.title || "", data.content || "");
    } catch (err) {
      toast.error("Could not retrieve mailing details.");
    } finally {
      setLoading(false);
    }
  };

  // Track which placeholders will be resolved per-recipient at send time
  const updateSendTimeVars = (title, body) => {
    const all = [...extractPlaceholders(title), ...extractPlaceholders(body)];
    setSendTimeVars([...new Set(all.filter((k) => !COMPOSE_TIME_VARS.has(k)))]);
  };

  // When association changes — update the stored name for variable resolution
  const handleAssociationChange = (e) => {
    const selId = e.target.value;
    setAssociationId(selId);
    setSelectedOwners([]);
    setTemplateId("");
    setMailingTitle("");
    setContent("");
    setSendTimeVars([]);

    const found = associations.find((a) => String(a.id) === selId);
    setAssociationName(found?.name || "");
  };

  // When a template is selected — populate title/content and resolve compose-time vars
  const handleTemplateChange = async (e) => {
    const selId = e.target.value;
    setTemplateId(selId);
    setSendTimeVars([]);

    if (!selId) {
      setMailingTitle("");
      setContent("");
      return;
    }

    const found = templates.find((t) => String(t.id) === selId);
    if (!found) return;

    // Template subject → mailing title, template body/content → mailing content
    const rawTitle   = found.subject || found.name || "";
    const rawContent = found.body || found.content || "";

    // Show immediately
    setMailingTitle(rawTitle);
    setContent(rawContent);
    updateSendTimeVars(rawTitle, rawContent);

    // Resolve compose-time vars (associationName, date) via backend
    try {
      const res = await resolveTemplate({
        templateId: Number(selId),
        variables: {
          associationName: associationName || "",
          date: new Date().toLocaleDateString(),
        },
      });
      const resolvedSubject = res?.data?.subject || rawTitle;
      const resolvedBody    = res?.data?.body    || rawContent;
      setMailingTitle(resolvedSubject);
      setContent(resolvedBody);
      updateSendTimeVars(resolvedSubject, resolvedBody);
    } catch (err) {
      console.warn("Template resolve failed, using raw content:", err);
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
        title:   mailingTitle,
        content,
        ...(recipientType === "OWNER" && selectedOwners.length > 0 && {
          ownerIds: selectedOwners.map(Number),
        }),
        ...(templateId && { templateId: Number(templateId) }),
      };

      if (isEdit) {
        await updateMailing(id, payload);
        toast.success("Mailing updated successfully!");
      } else {
        await createMailing(payload);
        toast.success("Mailing created successfully!");
      }

      navigate(`/dashboard/${tenantId}/communication/mailings`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Internal Server Error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-10">
      <Loader2 className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="max-w-6xl w-full mx-auto py-6 px-4">
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

        {/* From Address */}
        <SectionCard title="From Address">
          <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white mb-2 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">
              {associationName || "Acme Property Management"}
            </p>
            <p className="text-sm text-gray-600">Address pulled from association record</p>
          </div>
          <p className="text-xs text-gray-400">From address is pulled from Settings → Account</p>
        </SectionCard>

        {/* Recipients */}
        <SectionCard title="To Address (Recipients)">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Recipient Type <span className="text-red-500">*</span></label>
              <select value={recipientType} onChange={(e) => setRecipientType(e.target.value)} className={selectCls}>
                {RECIPIENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Association <span className="text-red-500">*</span></label>
              <select value={associationId} onChange={handleAssociationChange} className={selectCls} required>
                <option value="">Select an association</option>
                {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

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
                  {ownersList.length === 0
                    ? <p className="p-4 text-sm text-gray-400 italic">No owners found.</p>
                    : ownersList.map((owner) => (
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
                      ))
                  }
                </div>
              </div>
            )}

            {selectedOwners.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Selected Recipients ({selectedOwners.length})</p>
                <div className="flex flex-wrap gap-2">
                  {ownersList.filter(o => selectedOwners.includes(o.ownerId)).map((o) => (
                    <span key={o.ownerId} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2 py-1 rounded">
                      {o.name}
                      <button
                        type="button"
                        onClick={() => setSelectedOwners(prev => prev.filter(i => i !== o.ownerId))}
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

        {/* Template */}
        <SectionCard title="Select Template (Optional)">
          <div>
            <label className={labelCls}>Template</label>
            <select
              value={templateId}
              onChange={handleTemplateChange}
              className={selectCls}
              disabled={!associationId}
            >
              <option value="">
                {loadingTemplates ? "Loading templates..." : "-- Select a template (optional) --"}
              </option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {!associationId && (
              <p className="text-xs text-gray-400 mt-1">Select an association first to load templates.</p>
            )}
          </div>
        </SectionCard>

        {/* Send-time variable hint */}
        {sendTimeVars.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">Resolved per recipient at send time</p>
            <div className="flex flex-wrap gap-1">
              {sendTimeVars.map((v) => (
                <span key={v} className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-mono">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mailing Details */}
        <SectionCard title="Mailing Details">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Mailing Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={mailingTitle}
                onChange={(e) => { setMailingTitle(e.target.value); updateSendTimeVars(e.target.value, content); }}
                placeholder="Enter mailing title"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Content <span className="text-red-500">*</span></label>
              <textarea
                value={content}
                onChange={(e) => { setContent(e.target.value); updateSendTimeVars(mailingTitle, e.target.value); }}
                placeholder="Enter content"
                rows={6}
                required
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>
        </SectionCard>

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