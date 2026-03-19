import { useState } from "react";
import EmailPage from "./EmailPage";
import MailingPage from "./MailingPage";
import TemplatePage from "./TemplatePage";
import TextMessagePage from "./TextMessagePage";

const tabs = [
  { id: "email", label: "Email" },
  { id: "mailing", label: "Mailing" },
  { id: "template", label: "Template" },
  { id: "text", label: "Text Message" },
];

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState("emails");

  const renderContent = () => {
    switch (activeTab) {
      case "email":
        return <EmailPage />;
      case "mailing":
        return <MailingPage />;
      case "template":
        return <TemplatePage />;
      case "text":
        return <TextMessagePage />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Title */}
      <h2 className="text-2xl font-semibold text-gray-900">
        Communication
      </h2>

      {/* Tabs */}
      <div className="flex gap-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {renderContent()}
      </div>

    </div>
  );
}