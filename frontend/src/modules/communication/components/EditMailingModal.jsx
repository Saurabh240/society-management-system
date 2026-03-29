import { useState } from "react";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import Button from "@/components/ui/Button";
import Input  from "@/components/ui/Input";

const textareaCls = "w-full border rounded-lg px-4 py-2.5 text-base bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-y transition-all duration-200";

export default function EditMailingModal({ mailing, onClose, onSave }) {
  const [title,   setTitle]   = useState(mailing.title   || "");
  const [subject, setSubject] = useState(mailing.subject || "");
  const [content, setContent] = useState(mailing.content || "");

  const handleSave = () => {
    onSave({ ...mailing, title, subject, content });
    onClose();
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/40" />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: "90vh" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Edit Mailing</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            <Input
              label="Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter mailing title"
            />

            <Input
              label="Subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
            />

            <div>
              <label className="block mb-2 text-sm" style={{ color: "var(--color-primary)" }}>
                Content <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter mailing content"
                rows={8}
                className={textareaCls}
                style={{ borderColor: "var(--color-primary-light)", "--tw-ring-color": "var(--color-primary)" }}
              />
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>Save Mailing</Button>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}