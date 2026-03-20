import { useState } from "react";
import EmailPage       from "./EmailPage";
import MailingPage     from "./MailingPage";
import TemplatePage    from "./TemplatePage";
import TextMessagePage from "./TextMessagePage";

const TABS = [
  { id: "email",    label: "Emails"        },
  { id: "mailing",  label: "Mailings"      },
  { id: "template", label: "Templates"     },
  { id: "text",     label: "Text Messages" },
];

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState("email");

  const renderTab = () => {
    switch (activeTab) {
      case "email":    return <EmailPage />;
      case "mailing":  return <MailingPage />;
      case "template": return <TemplatePage />;
      case "text":     return <TextMessagePage />;
      default:         return null;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Communication</h2>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-1 mr-8 pb-3 text-sm font-medium border-b-2 transition-colors"
            style={
              activeTab === tab.id
                ? { borderColor: "var(--color-primary)", color: "var(--color-primary)" }
                : { borderColor: "transparent", color: "#6b7280" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{renderTab()}</div>
    </div>
  );
}