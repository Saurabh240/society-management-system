import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SelectRecipientsModal from "./SelectRecipientsModal";
import { toast } from "react-toastify";
import { createEmail } from "../emailApi";
import { getTemplates, resolveTemplate } from "../templateApi";

const textareaCls =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 resize-y transition-all duration-200";

/**
 * Variables resolved at compose time (known globally).
 * All other placeholders (ownerName, amount, dueDate, etc.) are
 * resolved per-recipient at send time by the backend VariableResolvers.
 */
const COMPOSE_TIME_VARS = new Set(["associationName", "date"]);

/** Extract {{placeholder}} names from text */
function extractPlaceholders(text) {
  if (!text) return [];
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

export default function EmailModal({
  mode = "create",
  email = {},
  associationId,
  associationName = "",
  onClose,
  onSuccess,
}) {
  const isResend = mode === "resend";
  const isEdit   = mode === "edit";

  const [showRecipients, setShowRecipients]         = useState(false);
  const [recipients, setRecipients]                 = useState([]);
  const [template, setTemplate]                     = useState("");
  const [templates, setTemplates]                   = useState([]);
  const [subject, setSubject]                       = useState(email?.subject || "");
  const [message, setMessage]                       = useState(email?.body || "");
  const [schedDate, setSchedDate]                   = useState("");
  const [schedTime, setSchedTime]                   = useState("");
  const [loading, setLoading]                       = useState(false);
  const [loadingTemplates, setLoadingTemplates]     = useState(false);
  // Placeholders that will be resolved at send time (informational only)
  const [sendTimeVars, setSendTimeVars]             = useState([]);

  const isSchedulingFilled = schedDate !== "" && schedTime !== "";

  useEffect(() => {
    if (isEdit && email) {
      setSubject(email.subject || "");
      setTemplate(email.templateId ? String(email.templateId) : "");
      setMessage(email.body || "");
      if (email.recipient) setRecipients([{ id: "prefilled", name: email.recipient }]);
      if (email.date) {
        const d = new Date(email.date);
        setSchedDate(d.toISOString().split("T")[0]);
        setSchedTime(d.toTimeString().split(" ")[0].substring(0, 5));
      }
    }
  }, [email, isEdit]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const res = await getTemplates();
        const list = Array.isArray(res?.data) ? res.data : res?.data?.content ?? [];
        setTemplates(list);
      } catch (err) {
        toast.error("Could not load templates");
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  /** Variables the backend resolves per-recipient — shown as an info hint */
  const updateSendTimeVars = (subj, body) => {
    const all = [...extractPlaceholders(subj), ...extractPlaceholders(body)];
    setSendTimeVars([...new Set(all.filter((k) => !COMPOSE_TIME_VARS.has(k)))]);
  };

  const handleTemplateChange = async (e) => {
    const selectedId = e.target.value;
    setTemplate(selectedId);
    setSendTimeVars([]);

    if (!selectedId) { setSubject(""); setMessage(""); return; }

    const found = templates.find((t) => String(t.id) === selectedId);
    if (!found) return;

    const rawSubject = found.subject || "";
    const rawBody    = found.body || found.content || "";

    // Show raw content immediately
    setSubject(rawSubject);
    setMessage(rawBody);
    updateSendTimeVars(rawSubject, rawBody);

    // Resolve only compose-time vars (associationName, date) via backend
    try {
      const res = await resolveTemplate({
        templateId: Number(selectedId),
        variables: {
          associationName: associationName || "",
          date: new Date().toLocaleDateString(),
        },
      });
      // Backend returns partially-resolved text — per-recipient placeholders remain intact
      const resolvedSubject = res?.data?.subject || rawSubject;
      const resolvedBody    = res?.data?.body    || rawBody;
      setSubject(resolvedSubject);
      setMessage(resolvedBody);
      updateSendTimeVars(resolvedSubject, resolvedBody);
    } catch (err) {
      console.warn("Template resolve failed, using raw content:", err);
    }
  };

  const handleSubmit = async (type) => {
    if (loading) return;

    let status = "SENT";
    if (type === "SAVE") status = "DRAFT";
    if (type === "SEND_LOGIC" && isSchedulingFilled) status = "SCHEDULED";

    try {
      setLoading(true);

      // Save subject/body as-is (with any remaining per-recipient placeholders intact).
      // MailjetEmailProvider resolves them per-recipient at actual send time.
      const payload = {
        associationId: Number(associationId),
        subject:       subject.trim(),
        body:          message.trim(),
        channel:       "EMAIL",
        recipient: {
          type:          recipients.length > 0 ? "OWNER" : "ALL_OWNERS",
          ownerIds:      recipients.filter(r => !String(r.id).startsWith("v")).map(r => Number(r.id)),
          vendorIds:     recipients.filter(r => String(r.id).startsWith("v")).map(r => Number(r.id)),
          associationId: Number(associationId),
        },
        templateId: template ? Number(template) : 0,
        status,
      };

      if (status === "SCHEDULED" && schedDate && schedTime) {
        payload.scheduledAt = new Date(`${schedDate}T${schedTime}`).toISOString();
      }

      await createEmail(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("ERROR:", err.response?.data);
      toast.error(err.response?.data?.error || "Internal Server Error");
    } finally {
      setLoading(false);
    }
  };

  const removeRecipient = (id) => setRecipients((p) => p.filter((r) => r.id !== id));
  const addRecipients = (selected) => {
    setRecipients((prev) => {
      const ids = new Set(prev.map((r) => r.id));
      return [...prev, ...selected.filter((r) => !ids.has(r.id))];
    });
  };

  const getTitle = () => isResend ? "Resend Email" : isEdit ? "Edit Email" : "Create Email";

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 bg-black/40" />
      <div className="fixed inset-0 z-10000 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <Input label="From" defaultValue="admin@example.com" />

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                To <span style={{ color: "red" }}>*</span>
              </label>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {recipients.map((r) => (
                    <span key={r.id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {r.name}
                      <button onClick={() => removeRecipient(r.id)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowRecipients(true)}>
                + Add Recipients
              </Button>
            </div>

            <Select
              label="Use Template"
              value={template}
              onChange={handleTemplateChange}
              options={[
                { label: loadingTemplates ? "Loading templates..." : "-- Select template (optional) --", value: "" },
                ...templates.map((t) => ({ label: t.name, value: String(t.id) })),
              ]}
            />

            {/* Info banner — shows which placeholders will be resolved per-recipient at send time */}
            {sendTimeVars.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
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

            <Input
              label="Subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter email message"
                rows={6}
                className={textareaCls}
              />
            </div>

            <Input label="Scheduled Date" type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
            <Input label="Scheduled Time" type="time" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="outline" size="sm" onClick={() => handleSubmit("SAVE")} disabled={loading}>Save Email</Button>
            <Button variant="primary" size="sm" onClick={() => handleSubmit("SEND_LOGIC")} disabled={loading}>
              {loading ? "Processing..." : isSchedulingFilled ? "Schedule Email" : "Send Email"}
            </Button>
          </div>
        </div>
      </div>

      {showRecipients && (
        <SelectRecipientsModal onClose={() => setShowRecipients(false)} onAdd={addRecipients} />
      )}
    </>,
    document.body
  );
}