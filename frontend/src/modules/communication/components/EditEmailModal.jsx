import { useState, useEffect } from "react";
import { X }        from "lucide-react";
import ReactDOM      from "react-dom";
import Button        from "@/components/ui/Button";
import Input         from "@/components/ui/Input";
import Select        from "@/components/ui/Select";
import SelectRecipientsModal from "./SelectRecipientsModal";
import { getTemplates } from "../templateApi";
import { updateEmail } from "../emailApi";
import { getEmailById } from "../emailApi";

const textareaCls = "w-full border rounded-lg px-4 py-2.5 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-y transition-all duration-200";

export default function EditEmailModal({ email, associationId, onClose, onSave }) {
 const [showRecipients, setShowRecipients] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  
  const [recipients, setRecipients] = useState([]);
  const [template, setTemplate]     = useState("");
  const [subject, setSubject]       = useState("");
  const [body, setBody]             = useState("");


useEffect(() => {
  if (!email?.id) return;

  const init = async () => {
    try {
    
      const emailRes = await getEmailById(email.id);
      const data = emailRes?.data;

     
      const templateRes = await getTemplates(
        "ASSOCIATION",
        associationId 
      );

      const templateList = templateRes?.data || [];
      setTemplates(templateList);

     
      setSubject(data.subject || "");
      setBody(data.body || "");

      setTemplate(
        data.templateId ? String(data.templateId) : ""
      );

     
      if (data.recipientLabel) {
        setRecipients([
          { id: "prefilled", name: data.recipientLabel }
        ]);
      }

    } catch (err) {
      console.error("Init failed:", err);
    }
  };

  init();
}, [email]);

const [templatesLoaded, setTemplatesLoaded] = useState(false);
const [loadingTemplates, setLoadingTemplates] = useState(false);

const fetchTemplates = async () => {
  if (templatesLoaded) return; 

  try {
    setLoadingTemplates(true);

    const res = await getTemplates(
      "ASSOCIATION",
      email?.associationId 
    );

    setTemplates(res?.data || []);
    setTemplatesLoaded(true);
  } catch (err) {
    console.error("Failed to fetch templates:", err);
  } finally {
    setLoadingTemplates(false);
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

    console.log("Update payload:", payload); 

    await updateEmail(email.id, payload);
    onSave?.();
    onClose();
  } catch (err) {
    console.error("Update failed:", err.response?.data);
    alert(`Failed to update: ${err.response?.data?.message || err.message}`);
  } finally {
    setLoading(false);
  }
};



  const removeRecipient = (id) => setRecipients((p) => p.filter((r) => r.id !== id));
  const addRecipients   = (selected) => {
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
              <label className="block mb-2 text-sm font-medium text-gray-700">To <span style={{ color: "var(--color-danger)" }}>*</span></label>
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
         {/* Template */}
 
                  
                  <Select
                      label="Use Template"
                 value={template}
               onChange={(e) => setTemplate(e.target.value)}
                       options={[
                { label: loadingTemplates ? "Loading..." : "-- Select template(optional) --", value: "" },
              ...templates.map((t) => ({
               label: t.name,
               value: String(t.id),
                })),
                ]}
                    />
             

            <Input label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter email subject" />

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
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>Save Email</Button>
            <Button variant="primary" size="sm">Send Email</Button>
          </div>
        </div>
      </div>
      {showRecipients && <SelectRecipientsModal onClose={() => setShowRecipients(false)} onAdd={addRecipients} />}
    </>,
    document.body
  );
}


