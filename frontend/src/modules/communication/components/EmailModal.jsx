import { useState , useEffect } from "react";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SelectRecipientsModal from "./SelectRecipientsModal";
import { createEmail } from "../emailApi";
import { getTemplates } from "../templateApi";

const textareaCls =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 resize-y transition-all duration-200";
export default function EmailModal({
    mode = "create", // create | resend | edit
    email = {},
    tenantId,
    associationId,
    onClose,
    onSuccess,
}) {
    const isResend = mode === "resend";
    const isEdit = mode === "edit";

    const [showRecipients, setShowRecipients] = useState(false);
    const [recipients, setRecipients] = useState([]);
    const [template, setTemplate] = useState("");   
    const [templates, setTemplates] = useState([]); 
    const [subject, setSubject] = useState(email?.subject || "");
    const [message, setMessage] = useState(email?.body || "");
    const [schedDate, setSchedDate] = useState("");
    const [schedTime, setSchedTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [templatesLoaded, setTemplatesLoaded] = useState(false);
    




         useEffect(() => {
        if (isEdit && email) {
            setSubject(email.subject || "");
            setTemplate(email.templateId ? String(email.templateId) : "");
            
           
            setMessage(email.body || ""); 

          
            if (email.recipient) {
                setRecipients([{ id: 'prefilled', name: email.recipient }]);
            }

    
            if (email.date) {
                const d = new Date(email.date);
                setSchedDate(d.toISOString().split('T')[0]);
                setSchedTime(d.toTimeString().split(' ')[0].substring(0, 5));
            }
        }
            }, [email, isEdit]);




const [loadingTemplates, setLoadingTemplates] = useState(false);

// Replace your existing fetchTemplates and useEffect logic with this:
useEffect(() => {
  const assocId = Number(associationId);
  
  // Only fetch if we have a valid ID and haven't loaded them yet
  if (assocId && !templatesLoaded) {
    const triggerFetch = async () => {
      try {
        setLoadingTemplates(true);
        const res = await getTemplates("ASSOCIATION", assocId);
        setTemplates(res?.data || []);
        setTemplatesLoaded(true);
      } catch (err) {
        console.error("Fetch templates failed:", err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    triggerFetch();
  }
}, [associationId, templatesLoaded]); // Add dependencies here

const handleSubmit = async (isSchedule = false) => {
  if (loading) return;

  try {
    setLoading(true);

    const payload = {
      tenantId: Number(tenantId),
      associationId: Number(associationId),
      subject: subject.trim(),
      body: message.trim(),
      channel: "EMAIL",
      recipient: {
        type: "ALL_OWNERS",
        ownerId: 0, 
        associationId: Number(associationId),
      },
      templateId: template ? Number(template) : 0,
       status: isSchedule ? "SCHEDULED" : "SENT",
      scheduledAt: isSchedule && schedDate && schedTime 
        ? new Date(`${schedDate}T${schedTime}`).toISOString() 
        : new Date().toISOString() 
        
    };

    console.log(" SENDING PAYLOAD:", payload);

    await createEmail(payload);
    onSuccess?.();
    onClose();
  } catch (err) {
    console.error(" ERROR:", err.response?.data);
    alert(`Error: ${err.response?.data?.error || "Internal Server Error"}`);
  } finally {
    setLoading(false);
  }
};




    const removeRecipient = (id) =>
        setRecipients((p) => p.filter((r) => r.id !== id));

    const addRecipients = (selected) => {
        setRecipients((prev) => {
            const ids = new Set(prev.map((r) => r.id));
            return [...prev, ...selected.filter((r) => !ids.has(r.id))];
        });
    };

    const getTitle = () => {
        if (isResend) return "Resend Email";
        if (isEdit) return "Edit Email";
        return "Create Email";
    };





    return ReactDOM.createPortal(
        <>
            <div className="fixed inset-0 z-9999 bg-black/40" />
            <div className="fixed inset-0 z-10000 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {getTitle()}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        <Input label="From" defaultValue="admin@example.com" />

                        {/* Recipients */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                To <span style={{ color: "var(--color-danger)" }}>*</span>
                            </label>

                            {recipients.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {recipients.map((r) => (
                                        <span key={r.id} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                            {r.name}
                                            <button onClick={() => removeRecipient(r.id)} className="text-gray-400 hover:text-gray-600">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <Button variant="outline" size="sm" onClick={() => setShowRecipients(true)}>
                                + Add Recipients
                            </Button>
                        </div>

                        {/* Template */}
 
               {/* Change this */}
<div>
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
</div>



                        {/* Subject */}
                        <Input
                            label="Subject"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter email subject"
                        />

                        {/* Message */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter email message"
                                rows={6}
                                className={textareaCls}
                            />
                        </div>

                        {/* Schedule */}
                        <Input
                            label="Scheduled Date"
                            type="date"
                            value={schedDate}
                            onChange={(e) => setSchedDate(e.target.value)}
                        />

                        <Input
                            label="Scheduled Time"
                            type="time"
                            value={schedTime}
                            onChange={(e) => setSchedTime(e.target.value)}
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Cancel
                        </Button>

                       <Button
  variant="primary"
  size="sm"
  onClick={() => handleSubmit(false)}
>
  Send Email
</Button>

<Button
  variant="primary"
  size="sm"
  onClick={() => handleSubmit(true)}
>
  Schedule Email
</Button>
                    </div>
                </div>
            </div>

            {showRecipients && (
                <SelectRecipientsModal
                    onClose={() => setShowRecipients(false)}
                    onAdd={addRecipients}
                />
            )}
        </>,
        document.body
    );
}


