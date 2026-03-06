import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import OwnershipAccountTable from "../components/OwnershipAccountTable";

const DUMMY_ACCOUNTS = [
  { id: 1,  firstName: "Emily",   lastName: "Martinez", associationName: "Sunset Village",      unit: "201", email: "emily.martinez@example.com",  phone: "(555) 111-2222" },
  { id: 2,  firstName: "David",   lastName: "Chen",     associationName: "Sunset Village",      unit: "202", email: "david.chen@example.com",       phone: "(555) 222-3333" },
  { id: 3,  firstName: "Sarah",   lastName: "Chen",     associationName: "Sunset Village",      unit: "202", email: "sarah.chen@example.com",       phone: "(555) 222-3334" },
  { id: 4,  firstName: "Jessica", lastName: "Williams", associationName: "Riverside Community", unit: "301", email: "jessica.williams@example.com", phone: "(555) 333-4444" },
  { id: 5,  firstName: "Robert",  lastName: "Taylor",   associationName: "Riverside Community", unit: "302", email: "robert.taylor@example.com",    phone: "(555) 444-5555" },
  { id: 6,  firstName: "Amanda",  lastName: "Wilson",   associationName: "Green Valley",        unit: "401", email: "amanda.wilson@example.com",    phone: "(555) 555-6666" },
  { id: 7,  firstName: "Michael", lastName: "Wilson",   associationName: "Green Valley",        unit: "401", email: "michael.wilson@example.com",   phone: "(555) 555-6667" },
  { id: 8,  firstName: "James",   lastName: "Anderson", associationName: "Green Valley",        unit: "402", email: "james.anderson@example.com",   phone: "(555) 666-7777" },
  { id: 9,  firstName: "Lisa",    lastName: "Thompson", associationName: "Green Valley",        unit: "403", email: "lisa.thompson@example.com",    phone: "(555) 777-8888" },
  { id: 10, firstName: "Carlos",  lastName: "Rivera",   associationName: "Sunset Village",      unit: "203", email: "carlos.rivera@example.com",    phone: "(555) 888-9999" },
  { id: 11, firstName: "Nina",    lastName: "Patel",    associationName: "Riverside Community", unit: "303", email: "nina.patel@example.com",       phone: "(555) 999-0000" },
  { id: 12, firstName: "Thomas",  lastName: "Brown",    associationName: "Green Valley",        unit: "404", email: "thomas.brown@example.com",     phone: "(555) 100-2000" },
];

const ASSOCIATIONS = ["All Associations", "Sunset Village", "Riverside Community", "Green Valley"];
const PAGE_SIZE = 5;

const OwnershipAccountList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState(DUMMY_ACCOUNTS);
  const [selectedAssociation, setSelectedAssociation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = selectedAssociation
    ? accounts.filter((a) => a.associationName === selectedAssociation)
    : accounts;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDeleted = (id) => {
    const newAccounts = accounts.filter((a) => a.id !== id);
    setAccounts(newAccounts);
    const newFiltered = newAccounts.filter((a) =>
      selectedAssociation ? a.associationName === selectedAssociation : true
    );
    const newTotalPages = Math.ceil(newFiltered.length / PAGE_SIZE);
    if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
  };

  const handleFilterChange = (e) => {
    setSelectedAssociation(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Ownership Accounts</h1>
        <button
          onClick={() => navigate("/dashboard/associations/accounts/create")}
          className="self-start sm:self-auto bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          + Add Owner
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-600 font-medium">Filter by Association:</span>
        <select
          value={selectedAssociation}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ASSOCIATIONS.map((a) => (
            <option key={a} value={a === "All Associations" ? "" : a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Table — horizontal scroll on small screens */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <OwnershipAccountTable accounts={paginated} onDeleted={handleDeleted} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} accounts
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition border ${
                  currentPage === page
                    ? "bg-black text-white border-black"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnershipAccountList;