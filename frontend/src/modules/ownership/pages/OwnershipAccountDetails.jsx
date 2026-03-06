import { useNavigate, useParams } from "react-router-dom";
import { User, Mail, Phone, Building2, Home, Pencil } from "lucide-react";

const DUMMY_ACCOUNTS = [
  { id: "1",  firstName: "Emily",   lastName: "Martinez", associationName: "Sunset Village",      unit: "201", email: "emily.martinez@example.com",  phone: "(555) 111-2222" },
  { id: "2",  firstName: "David",   lastName: "Chen",     associationName: "Sunset Village",      unit: "202", email: "david.chen@example.com",       phone: "(555) 222-3333" },
  { id: "3",  firstName: "Sarah",   lastName: "Chen",     associationName: "Sunset Village",      unit: "202", email: "sarah.chen@example.com",       phone: "(555) 222-3334" },
  { id: "4",  firstName: "Jessica", lastName: "Williams", associationName: "Riverside Community", unit: "301", email: "jessica.williams@example.com", phone: "(555) 333-4444" },
  { id: "5",  firstName: "Robert",  lastName: "Taylor",   associationName: "Riverside Community", unit: "302", email: "robert.taylor@example.com",    phone: "(555) 444-5555" },
  { id: "6",  firstName: "Amanda",  lastName: "Wilson",   associationName: "Green Valley",        unit: "401", email: "amanda.wilson@example.com",    phone: "(555) 555-6666" },
  { id: "7",  firstName: "Michael", lastName: "Wilson",   associationName: "Green Valley",        unit: "401", email: "michael.wilson@example.com",   phone: "(555) 555-6667" },
  { id: "8",  firstName: "James",   lastName: "Anderson", associationName: "Green Valley",        unit: "402", email: "james.anderson@example.com",   phone: "(555) 666-7777" },
  { id: "9",  firstName: "Lisa",    lastName: "Thompson", associationName: "Green Valley",        unit: "403", email: "lisa.thompson@example.com",    phone: "(555) 777-8888" },
  { id: "10", firstName: "Carlos",  lastName: "Rivera",   associationName: "Sunset Village",      unit: "203", email: "carlos.rivera@example.com",    phone: "(555) 888-9999" },
  { id: "11", firstName: "Nina",    lastName: "Patel",    associationName: "Riverside Community", unit: "303", email: "nina.patel@example.com",       phone: "(555) 999-0000" },
  { id: "12", firstName: "Thomas",  lastName: "Brown",    associationName: "Green Valley",        unit: "404", email: "thomas.brown@example.com",     phone: "(555) 100-2000" },
];

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={15} className="text-gray-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium break-words">{value || "—"}</p>
    </div>
  </div>
);

const OwnershipAccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const account = DUMMY_ACCOUNTS.find((a) => a.id === id);

  if (!account) return <div className="p-6 text-sm text-red-500">Account not found.</div>;

  const initials = `${account.firstName[0]}${account.lastName[0]}`;

  return (
    <div className="max-w-2xl w-full">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        ← Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Owner Details</h1>
        <button
          onClick={() => navigate(`/dashboard/associations/accounts/${id}/edit`)}
          className="self-start sm:self-auto flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          <Pencil size={14} /> Edit
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Avatar banner */}
        <div className="bg-gray-50 px-4 md:px-6 py-5 border-b border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 truncate">
              {account.firstName} {account.lastName}
            </h2>
            <p className="text-sm text-gray-500 truncate">{account.associationName} · Unit {account.unit}</p>
          </div>
        </div>

        <div className="px-4 md:px-6">
          <DetailRow icon={User}      label="Full Name"   value={`${account.firstName} ${account.lastName}`} />
          <DetailRow icon={Mail}      label="Email"       value={account.email} />
          <DetailRow icon={Phone}     label="Phone"       value={account.phone} />
          <DetailRow icon={Building2} label="Association" value={account.associationName} />
          <DetailRow icon={Home}      label="Unit"        value={account.unit} />
        </div>
      </div>
    </div>
  );
};

export default OwnershipAccountDetails;