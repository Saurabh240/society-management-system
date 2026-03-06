import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";

// Mock data 
const DUMMY_DETAILS = {
  1: {
    name: "Sunset Village",
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
  const [activeTab, setActiveTab] = useState("Overview");


  const association = DUMMY_DETAILS[id] || DUMMY_DETAILS[1];

  const tabs = ["Overview", "Units", "Financials", "Board", "Files"];

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      {/* Back Link */}
      <button
        onClick={() => navigate("/dashboard/associations")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ChevronLeft size={18} />
        <span className="text-sm font-medium">Back to Associations</span>
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-8">{association.name}</h1>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeTab === "Overview" ? (
        <Card className="border-none shadow-none bg-white p-6">
          <h2 className="text-lg font-bold mb-6">Association Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
         
            <div className="space-y-6">
              <DetailItem label="Association Name" value={association.name} />
              <DetailItem label="Street Address" value={association.address} />
              <DetailItem label="State" value={association.state} />
              <DetailItem label="Tax Identity Type" value={association.taxType} />
              <DetailItem label="Total Units" value={association.totalUnits} />
            </div>

        
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className="bg-gray-100 px-3 py-1 text-xs font-medium border border-gray-200 rounded text-gray-700">
                  {association.status}
                </span>
              </div>
              <DetailItem label="City" value={association.city} />
              <DetailItem label="ZIP Code" value={association.zip} />
              <DetailItem label="Tax Payer ID" value={association.taxPayerId} />
            </div>
          </div>
        </Card>
      ) : (
        <div className="p-12 text-center text-gray-400">
          {activeTab} content coming soon...
        </div>
      )}
    </div>
  );
}


function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900">{value}</p>
    </div>
  );
}