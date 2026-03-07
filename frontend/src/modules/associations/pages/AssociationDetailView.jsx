

import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";

import AssociationOverview from "../components/AssociationOverview";
import AssociationUnits from "../components/AssociationUnits";
import AssociationFinancials from "../components/AssociationFinancials";
import AssociationBoard from "../components/AssociationBoard";
import AssociationFiles from "../components/AssociationFiles";

// Mock data
const DUMMY_DETAILS = {
  1: {
    name: "Riverside Community",
    status: "Active",
    address: "456 Sunset Blvd",
    city: "Los Angeles",
    state: "CA",
    zip: "90028",
    taxType: "EIN",
    taxPayerId: "98-7654321",
    totalUnits: 3,
  },
};

export default function AssociationDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const association = DUMMY_DETAILS[id] || DUMMY_DETAILS[1];
  const tabs = ["Overview", "Units", "Financials", "Board", "Files"];

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "Overview"
  );

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">

      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard/associations")}
        className="flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors"
      >
        <ChevronLeft size={18} />
        <span className="text-sm font-medium">Back to Associations</span>
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-8">{association.name}</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium relative transition-colors ${
              activeTab === tab
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>


      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "Overview" && (
          <AssociationOverview association={association} />
        )}

        {activeTab === "Units" && (
          <AssociationUnits associationId={id} />
        )}

        {activeTab === "Financials" && (
          <AssociationFinancials associationId={id} />
        )}

        {activeTab === "Board" && (
          <AssociationBoard associationId={id} />
        )}

        {activeTab === "Files" && (
          <AssociationFiles associationId={id} />
        )}
      </div>

    </div>
  );
}