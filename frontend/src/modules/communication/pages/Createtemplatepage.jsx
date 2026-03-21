import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const RECIPIENT_TYPES = [
    { label: "Association Owners", value: "association_owners" },
    { label: "Board Members", value: "board_members" },
    { label: "All Residents", value: "all_residents" },
];

const LEVELS = [
    { label: "Association", value: "Association" },
    { label: "Individual", value: "Individual" },
];

const textareaCls = "w-full border rounded-lg px-4 py-2.5 text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-y transition-all duration-200";

export default function CreateTemplatePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        templateName: "",
        recipientType: "association_owners",
        level: "Association",
        category: "",
        description: "",
        emailSubject: "",
        content: "",
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: connect to API
        navigate("/dashboard/communication/templates");
    };

    return (
        <div className="max-w-7xl w-full mx-auto py-6 px-4">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create Template</h1>

            {/* Form card */}
            <div className="border border-gray-200 rounded-lg bg-white p-6 space-y-5">

                <Input
                    label="Template Name"
                    name="templateName"
                    required
                    value={form.templateName}
                    onChange={handleChange}
                    placeholder="Enter template name"
                />

                <Select
                    label="Recipient Type"
                    name="recipientType"
                    required
                    value={form.recipientType}
                    onChange={handleChange}
                    options={RECIPIENT_TYPES}
                />

                <Select
                    label="Level"
                    name="level"
                    required
                    value={form.level}
                    onChange={handleChange}
                    options={LEVELS}
                />

                <Input
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g., Newsletter, Compliance, Onboarding"
                />

                <div>
                    <label className="block mb-2 text-sm" style={{ color: "var(--color-primary)" }}>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Enter template description"
                        rows={4}
                        className={textareaCls}
                        style={{ borderColor: "var(--color-primary-light)", "--tw-ring-color": "var(--color-primary)" }}
                    />
                </div>

                <Input
                    label="Email Subject"
                    name="emailSubject"
                    required
                    value={form.emailSubject}
                    onChange={handleChange}
                    placeholder="Enter email subject"
                />

                <div>
                    <label className="block mb-2 text-sm" style={{ color: "var(--color-primary)" }}>
                        Content <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        placeholder="Enter email content"
                        rows={8}
                        className={textareaCls}
                        style={{ borderColor: "var(--color-primary-light)", "--tw-ring-color": "var(--color-primary)" }}
                    />
                </div>

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/communication/templates")}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSubmit}>
                        Save Template
                    </Button>
                </div>

            </div>
        </div>
    );
}