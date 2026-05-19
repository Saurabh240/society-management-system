import { useState } from "react";
import { toast } from "react-toastify";
import { submitSupportTicket, submitFeatureSuggestion } from "../api/helpApi";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// ─── Shared textarea styled like project Input component ──────────────────────
const Textarea = ({ label, name, required, placeholder, value, onChange, error }) => (
  <div>
    <label className="block mb-2 text-sm text-(--color-primary)">
      {label}
      {required && <span className="text-(--color-danger) ml-1">*</span>}
    </label>
    <textarea
      name={name}
      rows={5}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
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
      <Card.Header>
        <Card.Title>Submit Support Ticket</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-5 flex-1">
        <Input
          label="Subject"
          name="subject"
          required
          placeholder="Brief description of the issue"
          value={form.subject}
          onChange={handleChange}
          error={errors.subject}
        />
        <Textarea
          label="Description"
          name="description"
          required
          placeholder="Please provide detailed information about your issue..."
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />
      </Card.Content>
      <Card.Footer className="flex justify-end">
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          Submit Ticket
        </Button>
      </Card.Footer>
    </Card>
  );
};

// ─── Feature Suggestion Card ──────────────────────────────────────────────────
const FeatureSuggestionCard = () => {
  const [form, setForm]       = useState({ title: "", description: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Feature title is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await submitFeatureSuggestion(form);
      toast.success("Thank you for your suggestion!");
      setForm({ title: "", description: "" });
    } catch {
      toast.error("Failed to submit suggestion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <Card.Header>
        <Card.Title>Suggest a Feature</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-5 flex-1">
        <Input
          label="Feature Title"
          name="title"
          required
          placeholder="Brief title for your feature request"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
        />
        <Textarea
          label="Description"
          name="description"
          required
          placeholder="Describe the feature you'd like to see..."
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />
      </Card.Content>
      <Card.Footer className="flex justify-end">
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
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