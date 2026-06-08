import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { submitSupportTicket, submitFeatureSuggestion } from "../api/helpApi";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Paperclip, X, Upload } from "lucide-react";
import httpClient from "@/api/httpClient";

// ─── Shared textarea ──────────────────────────────────────────────────────────
const Textarea = ({ label, name, required, placeholder, value, onChange, error }) => (
  <div>
    <label className="block mb-2 text-sm text-(--color-primary)">
      {label}{required && <span className="text-(--color-danger) ml-1">*</span>}
    </label>
    <textarea
      name={name} rows={5} placeholder={placeholder} value={value} onChange={onChange}
      className={`block w-full px-4 py-2.5 text-base rounded-lg border transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-none ${
        error
          ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)] bg-red-50"
          : "border-[var(--color-primary-light)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
      }`}
    />
    {error && (
      <p className="mt-2 text-xs text-(--color-danger) flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

// ─── Support Ticket Card ──────────────────────────────────────────────────────
const SupportTicketCard = () => {
  const [form, setForm]       = useState({ subject: "", description: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };
  const validate = () => {
    const e = {};
    if (!form.subject.trim())     e.subject     = "Subject is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await submitSupportTicket(form);
      toast.success("Support ticket submitted successfully");
      setForm({ subject: "", description: "" });
    } catch {
      toast.error("Failed to submit support ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <Card.Header><Card.Title>Submit Support Ticket</Card.Title></Card.Header>
      <Card.Content className="flex flex-col gap-5 flex-1">
        <Input
          label="Subject" name="subject" required
          placeholder="Brief description of the issue"
          value={form.subject} onChange={handleChange} error={errors.subject}
        />
        <Textarea
          label="Description" name="description" required
          placeholder="Please provide detailed information about your issue..."
          value={form.description} onChange={handleChange} error={errors.description}
        />
      </Card.Content>
      <Card.Footer className="flex justify-end">
        <Button variant="primary" loading={loading} onClick={handleSubmit}>Submit Ticket</Button>
      </Card.Footer>
    </Card>
  );
};

// ─── Feature Suggestion Card (with file attachment) ───────────────────────────
const FeatureSuggestionCard = () => {
  const [form, setForm]       = useState({ title: "", description: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  // Attachment state
  const [attachedFile, setAttachedFile] = useState(null);   // File object
  const [attachmentUrl, setAttachmentUrl] = useState("");   // URL after upload
  const [uploading, setUploading]        = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // ── File selection ────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation — max 10 MB, common image/doc types
    const allowedTypes = [
      "image/png", "image/jpeg", "image/gif", "image/webp",
      "application/pdf", "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("File type not supported. Use PNG, JPG, GIF, PDF, DOC or TXT.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be smaller than 10 MB");
      return;
    }

    setAttachedFile(file);
    setAttachmentUrl("");

    // Upload the file immediately to get a URL
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      // POST /api/v1/help/upload returns { url: "https://..." }
      const res = await httpClient.post("/api/v1/help/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.data?.url || res.data?.url || "";
      setAttachmentUrl(url);
      toast.success("File attached");
    } catch {
      toast.error("File upload failed. You can still submit without an attachment.");
      setAttachedFile(null);
      setAttachmentUrl("");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setAttachmentUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Feature title is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (uploading) { toast.info("Please wait — file is still uploading"); return; }
    try {
      setLoading(true);
      await submitFeatureSuggestion({
        title:       form.title.trim(),
        description: form.description.trim(),
        attachmentUrl: attachmentUrl || undefined,
      });
      toast.success("Thank you for your suggestion!");
      setForm({ title: "", description: "" });
      setAttachedFile(null);
      setAttachmentUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Failed to submit suggestion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <Card.Header><Card.Title>Suggest a Feature</Card.Title></Card.Header>
      <Card.Content className="flex flex-col gap-5 flex-1">

        <Input
          label="Feature Title" name="title" required
          placeholder="Brief title for your feature request"
          value={form.title} onChange={handleChange} error={errors.title}
        />

        <Textarea
          label="Description" name="description" required
          placeholder="Describe the feature you'd like to see..."
          value={form.description} onChange={handleChange} error={errors.description}
        />

        {/* ── Attachment section ── */}
        <div>
          <label className="block mb-2 text-sm text-(--color-primary)">
            Attachment <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
          />

          {/* Attached file chip */}
          {attachedFile ? (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              uploading
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : attachmentUrl
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200  bg-red-50  text-red-700"
            }`}>
              {uploading ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Paperclip size={13} className="flex-shrink-0" />
              )}
              <span className="flex-1 truncate max-w-xs">{attachedFile.name}</span>
              {uploading ? (
                <span className="text-xs text-blue-500">Uploading…</span>
              ) : (
                <button onClick={removeAttachment} className="flex-shrink-0 hover:opacity-70 transition">
                  <X size={13} />
                </button>
              )}
            </div>
          ) : (
            /* Attach button */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition"
            >
              <Upload size={14} />
              Attach a file
              <span className="text-xs text-gray-400 ml-1">(PNG, JPG, PDF, DOC — max 10 MB)</span>
            </button>
          )}
        </div>

      </Card.Content>
      <Card.Footer className="flex justify-end">
        <Button
          variant="primary"
          loading={loading || uploading}
          onClick={handleSubmit}
        >
          Submit Suggestion
        </Button>
      </Card.Footer>
    </Card>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HelpPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Help</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SupportTicketCard />
        <FeatureSuggestionCard />
      </div>
    </div>
  );
}