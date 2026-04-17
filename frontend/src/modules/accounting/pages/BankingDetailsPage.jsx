
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

import { getLedgerEntries, getBankAccountById } from "../api/accountingApi";

dayjs.extend(quarterOfYear);

export default function BankingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- States ---
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const [filters, setFilters] = useState({
    dateRange: "This Month",
    fromDate: "",
    toDate: "",
    transactionType: "All Transactions",
  });

  // --- Date Helper ---
  const calculateDates = (preset) => {
    if (preset === "Custom Range") return { from: "", to: "" };

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

        await fetchTransactions(initialFilters);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load account details");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  // --- Fetch Transactions ---
const fetchTransactions = async (appliedFilters) => {
  try {
    setLoading(true);

    const params = {
      accountId: id,
      from: appliedFilters.fromDate,
      to: appliedFilters.toDate,
    };

    if (appliedFilters.transactionType !== "All Transactions") {
      params.type = appliedFilters.transactionType;
    }

    const res = await getLedgerEntries(params);

    const raw = res.data?.content || [];

   

    setTransactions(raw);

  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch transactions");
  } finally {
    setLoading(false);
  }
};

  // --- Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "dateRange") {
      const { from, to } = calculateDates(value);
      setFilters((prev) => ({
        ...prev,
        dateRange: value,
        fromDate: from,
        toDate: to,
      }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyFilters = () => {
    fetchTransactions(filters);
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
    fetchTransactions(reset);
  };

  if (!account && loading) {
    return <div className="p-6 text-slate-600">Loading...</div>;
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-6 text-slate-800">Banking</h2>
        <button
          onClick={() => navigate("/dashboard/accounting/banking")}
          className="flex items-center text-sm font-semibold text-slate-600 hover:text-blue-800 transition bg-white border px-4 py-2 rounded-lg shadow-sm"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to All Accounts
        </button>
      </div>

      {/* Account Info */}
      <Card className="p-6 mb-6 bg-white">
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-400">Association</p>
            <p className="font-semibold">{account?.associationName || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Account Name</p>
            <p className="font-semibold">{account?.bankAccountName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Account Number</p>
            <p className="font-mono">{account?.accountNumberMasked}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Balance</p>
            <p className="font-bold text-xl">
              ${(account?.balance || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6 mb-6 bg-white">
        <div className="grid lg:grid-cols-4 gap-4">
          <Select
            label="Date Range"
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            options={[
              "Today","Yesterday","This Week","Last Week",
              "This Month","Last Month","This Quarter",
              "Last Quarter","This Year","Last Year","Custom Range"
            ].map(v => ({ label: v, value: v }))}
          />
          <Input name="fromDate" type="date" value={filters.fromDate} onChange={handleFilterChange} />
          <Input name="toDate" type="date" value={filters.toDate} onChange={handleFilterChange} />
          <Select
            name="transactionType"
            value={filters.transactionType}
            onChange={handleFilterChange}
            options={[
              { label: "All Transactions", value: "All Transactions" },
              { label: "Deposits", value: "DEPOSIT" },
              { label: "Payments", value: "PAYMENT" },
            ]}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleApplyFilters} loading={loading}>
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleResetFilters}>
            Reset
          </Button>
        </div>
      </Card>

      {/* Action */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => navigate(`/dashboard/accounting/banking/record/${id}`)}>
          <Plus size={18} className="mr-2" />
          Record Banking Transaction
        </Button>
      </div>

      {/* Table */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
  <table className="w-full table-auto border-collapse">
    
    {/* Header (same as COA) */}
    <thead style={{ backgroundColor: "#a9c3f7" }}>
      <tr>
        <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">
          Date
        </th>
        <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">
          Description
        </th>
        <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-right">
          Debit
        </th>
        <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-right">
          Credit
        </th>
        
      </tr>
    </thead>

    {/* Body */}
    <tbody className="divide-y divide-gray-200">
      {loading ? (
        <tr>
          <td colSpan={5} className="p-10 text-center text-gray-400">
            Loading...
          </td>
        </tr>
      ) : transactions.length === 0 ? (
        <tr>
          <td colSpan={5} className="p-10 text-center text-gray-500">
            No transactions found.
          </td>
        </tr>
      ) : (
        transactions.map((tx) => (
          <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
            
            {/* Date */}
            <td className="border-r border-gray-300 p-4 text-sm text-gray-700">
              {tx.date ? new Date(tx.date).toLocaleDateString() : "—"}
            </td>

            {/* Description */}
            <td className="border-r border-gray-300 p-4 text-sm font-semibold text-gray-900">
              {tx.description || "—"}
            </td>

            {/* Debit */}
            <td className="border-r border-gray-300 p-4 text-sm text-red-600 text-right">
              {tx.debit > 0 ? `$${Number(tx.debit).toFixed(2)}` : "—"}
            </td>

            {/* Credit */}
            <td className="border-r border-gray-300 p-4 text-sm text-green-600 text-right">
              {tx.credit > 0 ? `$${Number(tx.credit).toFixed(2)}` : "—"}
            </td>

            
            
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
 
    
  </div>
  );
}
