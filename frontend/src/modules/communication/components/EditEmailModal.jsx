import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SelectRecipientsModal from "./SelectRecipientsModal";
import { toast } from "react-toastify";
import { getTemplates, resolveTemplate } from "../templateApi";
import { updateEmail, getEmailById, resendEmail } from "../emailApi";

const textareaCls =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-y transition-all duration-200";

const COMPOSE_TIME_VARS = new Set(["associationName", "date"]);

function extractPlaceholders(text) {
  if (!text) return [];
  return [...new Set([...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

export default function EditEmailModal({ email, associationId, associationName = "", onClose, onSave }) {
  const [showRecipients, setShowRecipients]     = useState(false);
  const [templates, setTemplates]               = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loading, setLoading]                   = useState(false);

  const [recipients, setRecipients]   = useState([]);
  const [template, setTemplate]       = useState("");
  const [subject, setSubject]         = useState("");
  const [body, setBody]               = useState("");
  const [sendTimeVars, setSendTimeVars] = useState([]);

  useEffect(() => {
    if (!email?.id) return;

    const init = async () => {
      try {
        setLoadingTemplates(true);
        const [emailRes, templateRes] = await Promise.all([
          getEmailById(email.id),
          getTemplates(),
        ]);
        const data = emailRes?.data;
        const list = Array.isArray(templateRes?.data)
          ? templateRes.data
          : templateRes?.data?.content ?? [];

        setTemplates(list);
        setSubject(data?.subject || "");
        setBody(data?.body || "");
        setTemplate(data?.templateId ? String(data.templateId) : "");

        if (data?.recipientLabel) {
          setRecipients([{ id: "prefilled", name: data.recipientLabel }]);
        }

        // Show send-time vars for the existing body
        updateSendTimeVars(data?.subject || "", data?.body || "");
      } catch (err) {
        toast.error("Could not load email details");
      } finally {
        setLoadingTemplates(false);
      }
    };
    init();
  }, [email?.id]);

  const updateSendTimeVars = (subj, b) => {
    const all = [...extractPlaceholders(subj), ...extractPlaceholders(b)];
    setSendTimeVars([...new Set(all.filter((k) => !COMPOSE_TIME_VARS.has(k)))]);
  };

  const handleTemplateChange = async (e) => {
    const selectedId = e.target.value;
    setTemplate(selectedId);
    setSendTimeVars([]);

    if (!selectedId) return;

    const found = templates.find((t) => String(t.id) === selectedId);
    if (!found) return;

    const rawSubject = found.subject || "";
    const rawBody    = found.body || found.content || "";
    setSubject(rawSubject);
    setBody(rawBody);
    updateSendTimeVars(rawSubject, rawBody);

    try {
      const res = await resolveTemplate({
        templateId: Number(selectedId),
        variables: {
          associationName: associationName || "",
          date: new Date().toLocaleDateString(),
        },
      });
      const resolvedSubject = res?.data?.subject || rawSubject;
      const resolvedBody    = res?.data?.body    || rawBody;
      setSubject(resolvedSubject);
      setBody(resolvedBody);
      updateSendTimeVars(resolvedSubject, resolvedBody);
    } catch (err) {
      console.warn("Template resolve failed:", err);
    }
  };

  const handleSave = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const payload = {
        ...(subject.trim() && { subject: subject.trim() }),
        ...(body.trim()    && { body: body.trim() }),
        ...(template       && { templateId: Number(template) }),
        ...(email.date     && { scheduledAt: new Date(email.date).toISOString() }),
      };
      await updateEmail(email.id, payload);
      toast.success("Email updated");
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(`Failed to update: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const payload = {
        ...(subject.trim() && { subject: subject.trim() }),
        ...(body.trim()    && { body: body.trim() }),
        ...(template       && { templateId: Number(template) }),
      };
      await updateEmail(email.id, payload);
      await resendEmail(email.id);
      toast.success("Email sent successfully");
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(`Failed to send: ${err.response?.data?.message || err.message}`);
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

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-9999 bg-black/40" />
      <div className="fixed inset-0 z-10000 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Edit Email</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <Input label="From" defaultValue="admin@example.com" />

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                To <span style={{ color: "var(--color-danger)" }}>*</span>
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
              <Button variant="outline" size="sm" onClick={() => setShowRecipients(true)}>+ Add Recipients</Button>
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
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter email message"
                rows={7}
                className={textareaCls}
                style={{ borderColor: "var(--color-primary-light)" }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={loading}>Save Email</Button>
            <Button variant="primary" size="sm" onClick={handleSend} disabled={loading}>
              {loading ? "Processing..." : "Send Email"}
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