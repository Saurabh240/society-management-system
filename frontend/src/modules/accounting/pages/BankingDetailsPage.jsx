import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

import { getBankAccountById } from "../api/accountingApi"; 

export default function BankingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- States ---
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: "This Month",
    fromDate: "",
    toDate: "",
    transactionType: "All Transactions",
  });

  // --- Date Logic Helper ---


dayjs.extend(quarterOfYear);

const calculateDates = (preset) => {
  if (preset === "Custom Range") {
    return { from: "", to: "" };
  }

  let start = dayjs();
  let end = dayjs();

  switch (preset) {
    case "Today":
      start = end = dayjs();
      break;

    case "Yesterday":
      start = end = dayjs().subtract(1, "day");
      break;

    case "This Week":
      start = dayjs().startOf("week");
      end = dayjs().endOf("week");
      break;

    case "Last Week":
      start = dayjs().subtract(1, "week").startOf("week");
      end = dayjs().subtract(1, "week").endOf("week");
      break;

    case "This Month":
      start = dayjs().startOf("month");
      end = dayjs().endOf("month");
      break;

    case "Last Month":
      start = dayjs().subtract(1, "month").startOf("month");
      end = dayjs().subtract(1, "month").endOf("month");
      break;

    case "This Quarter":
      start = dayjs().startOf("quarter");
      end = dayjs().endOf("quarter");
      break;

    case "Last Quarter":
      start = dayjs().subtract(1, "quarter").startOf("quarter");
      end = dayjs().subtract(1, "quarter").endOf("quarter");
      break;

    case "This Year":
      start = dayjs().startOf("year");
      end = dayjs().endOf("year");
      break;

    case "Last Year":
      start = dayjs().subtract(1, "year").startOf("year");
      end = dayjs().subtract(1, "year").endOf("year");
      break;

    default:
      return { from: "", to: "" };
  }

  return {
    from: start.format("YYYY-MM-DD"),
    to: end.format("YYYY-MM-DD"),
  };
};

  // --- Initial Load ---
useEffect(() => {
  const init = async () => {
    const initialDates = calculateDates("This Month");

    const initialFilters = {
      dateRange: "This Month",
      fromDate: initialDates.from,
      toDate: initialDates.to,
      transactionType: "All Transactions",
    };

    setFilters(initialFilters);

    try {
      setLoading(true);
      const res = await getBankAccountById(id);
      setAccount(res.data?.data);

      await handleApplyFilters(initialFilters); 
    } catch {
      toast.error("Failed to load account details");
    } finally {
      setLoading(false);
    }
  };

  init();
}, [id]);

  // --- Filter Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "dateRange") {
      const { from, to } = calculateDates(value);
      setFilters((prev) => ({ ...prev, dateRange: value, fromDate: from, toDate: to }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

 const handleApplyFilters = async (customFilters) => {
  try {
    setLoading(true);

    const appliedFilters = customFilters || filters;

    console.log("Fetching with:", appliedFilters);

    
     await getTransactionsByAccount(id, appliedFilters)

    setTransactions([]);
  } catch (err) {
    toast.error("Failed to filter transactions");
  } finally {
    setLoading(false);
  }
};

  const handleResetFilters = () => {
    const defaultDates = calculateDates("This Month");
    const reset = {
      dateRange: "This Month",
      fromDate: defaultDates.from,
      toDate: defaultDates.to,
      transactionType: "All Transactions",
    };
    setFilters(reset);
handleApplyFilters(reset);
  };

  if (!account && loading) return <div className="p-6 text-slate-600">Loading...</div>;

  return (
    <div className="p-6  min-h-screen">
      {/* Header & Back Button */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-6 text-slate-800">Banking</h2>
        <button 
          onClick={() => navigate("/dashboard/accounting/banking")}
          className="flex items-center text-sm font-semibold text-slate-600 hover:text-blue-800 transition-colors bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to All Accounts
        </button>
      </div>

   

      {/* Account Info Card */}
    <Card className="p-6 mb-6 border-none shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Association</p>
            <p className="font-semibold text-slate-700">{account?.associationName || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Account Name</p>
            <p className="font-semibold text-slate-700">{account?.bankAccountName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Account Number</p>
            <p className="font-mono text-slate-600">{account?.accountNumberMasked}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Current Balance</p>
            <p className="font-bold text-xl text-slate-900">
              ${(account?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>

      {/* Filter Card */}
      <Card className="p-6 mb-6 border-none shadow-sm bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select 
            label="Date Range" 
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            options={[
              "Today", "Yesterday", "This Week", "Last Week", 
              "This Month", "Last Month", "This Quarter", 
              "Last Quarter", "This Year", "Last Year", "Custom Range"
            ].map(v => ({ label: v, value: v }))}
          />
          <Input 
            label="From Date" 
            name="fromDate"
            type="date" 
            value={filters.fromDate}
            onChange={handleFilterChange}
          />
          <Input 
            label="To Date" 
            name="toDate"
            type="date" 
            value={filters.toDate}
            onChange={handleFilterChange}
          />
          <Select 
            label="Transaction Type" 
            name="transactionType"
            value={filters.transactionType}
            onChange={handleFilterChange}
            options={[
              { label: "All Transactions", value: "All Transactions" },
              { label: "Deposits", value: "DEPOSIT" },
              { label: "Payments", value: "PAYMENT" }
            ]}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="primary" onClick={handleApplyFilters} loading={loading} className="px-8">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleResetFilters} className="px-8 border-gray-300 text-slate-600">
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Action Area */}
      <div className="flex justify-end mb-4">
        <Button variant="primary"
          onClick={() => navigate(`/dashboard/accounting/banking/record/${id}`)}>
          <Plus size={18} className="mr-2" /> Record Banking Transaction
        </Button>
      </div>

    
  {/* Transaction Table / Empty State */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {transactions.length > 0 ? (
          <table className="w-full text-left">
             {/* Map your transaction data here */}
          </table>
        ) : (
          <div className="p-20 text-center">
            <p className="text-slate-800 text-lg font-semibold mb-2">
              No transactions found matching the selected filters.
            </p>
            <p className="text-slate-500">
              Try adjusting your filters or selecting a different date range.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

