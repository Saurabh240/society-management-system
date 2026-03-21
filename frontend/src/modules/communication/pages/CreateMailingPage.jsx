import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ASSOCIATIONS, TEMPLATES } from "../data";

const TEMPLATE_LEVELS = [
    { label: "Association", value: "Association" },
    { label: "Individual", value: "Individual" },
];

const SectionCard = ({ title, children }) => (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
        {title && (
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">{title}</p>
            </div>
        )}
        <div className="p-5">{children}</div>
    </div>
);

export default function CreateMailingPage() {
    const navigate = useNavigate();

    const [association, setAssociation] = useState("");
    const [templateLevel, setTemplateLevel] = useState("Association");
    const [template, setTemplate] = useState("");
    const [mailingTitle, setMailingTitle] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: connect to API
        navigate("/dashboard/communication/mailings");
    };

    return (
        <div className="max-w-7xl w-full">

            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create Mailing</h1>

            <form onSubmit={handleSubmit}>

                {/* From Address */}
                <SectionCard title="From Address">
                    <div className="border border-gray-200 rounded-lg px-4 py-3 bg-white mb-2">
                        <p className="text-sm font-semibold text-gray-900">Acme Property Management</p>
                        <p className="text-sm text-gray-600">123 Main Street, Suite 100, Los Angeles, CA 90012</p>
                    </div>
                    <p className="text-xs text-gray-400">From address is pulled from Settings → Account</p>
                </SectionCard>

                {/* To Address */}
                <SectionCard title="To Address (Recipients)">
                    <Select
                        label="Association"
                        name="association"
                        required
                        value={association}
                        onChange={(e) => setAssociation(e.target.value)}
                        options={[
                            { label: "Select an association", value: "" },
                            ...ASSOCIATIONS.map((a) => ({ label: a.name, value: String(a.id) })),
                        ]}
                    />
                </SectionCard>

                {/* Select Template */}
                <SectionCard title="Select Template (Optional)">
                    <div className="space-y-4">
                        <Select
                            label="Template Level"
                            name="templateLevel"
                            value={templateLevel}
                            onChange={(e) => setTemplateLevel(e.target.value)}
                            options={TEMPLATE_LEVELS}
                        />
                        <Select
                            label="Template"
                            name="template"
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            options={[
                                { label: "-- Select a template (optional) --", value: "" },
                                ...TEMPLATES.map((t) => ({ label: t.name, value: String(t.id) })),
                            ]}
                        />
                    </div>
                </SectionCard>

                {/* Mailing Details */}
                <SectionCard title="Mailing Details">
                    <Input
                        label="Mailing Title"
                        required
                        value={mailingTitle}
                        onChange={(e) => setMailingTitle(e.target.value)}
                        placeholder="Enter mailing title"
                    />
                </SectionCard>

                {/* Actions */}
                <div className="flex justify-end items-center gap-3 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" variant="primary" size="sm">Create Mailing</Button>

                </div>

            </form>
        </div>
    );
}