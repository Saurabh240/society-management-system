import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getBills, getBillsSummary, payBill } from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";
import Button from "@/components/ui/Button";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "",         label: "All Statuses" },
  { value: "UNPAID",   label: "Unpaid"       },
  { value: "PAID",     label: "Paid"         },
  { value: "OVERDUE",  label: "Overdue"      },
];

const DATE_RANGE_OPTIONS = [
  { value: "THIS_MONTH",  label: "This Month"  },
  { value: "LAST_MONTH",  label: "Last Month"  },
  { value: "THIS_QUARTER",label: "This Quarter"},
  { value: "THIS_YEAR",   label: "This Year"   },
  { value: "CUSTOM",      label: "Custom"      },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-CA") : "—");

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    UNPAID:  "bg-yellow-100 text-yellow-800 border border-yellow-300",
    PAID:    "bg-green-100  text-green-800  border border-green-300",
    OVERDUE: "bg-red-100    text-red-700    border border-red-300",
  };
  const labels = { UNPAID: "Unpaid", PAID: "Paid", OVERDUE: "Overdue" };
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, color }) => (
  <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-5 flex-1 min-w-160px">
    <p className="text-sm text-gray-500 mb-2">{label}</p>
    <p className={`text-2xl font-bold ${color || "text-gray-900"}`}>{value}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BillsTab() {
  const navigate = useNavigate();

  const [bills, setBills]               = useState([]);
  const [summary, setSummary]           = useState({});
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [payingId, setPayingId]         = useState(null);

  // Filters
  const [assocFilter, setAssocFilter]       = useState("");
  const [statusFilter, setStatusFilter]     = useState("");
  const [dateRange, setDateRange]           = useState("THIS_MONTH");
  const [fromDate, setFromDate]             = useState("");
  const [toDate, setToDate]                 = useState("");

  // Load associations
  useEffect(() => {
    getAssociations()
      .then((res) => setAssociations(res.data?.data ?? []))
      .catch(() => toast.error("Failed to load associations"));
  }, []);

  // Build filter params
  const buildParams = useCallback(() => {
    const p = {};
    if (assocFilter)  p.associationId = assocFilter;
    if (statusFilter) p.status        = statusFilter;
    if (dateRange !== "CUSTOM") {
      p.dateRange = dateRange;
    } else {
      if (fromDate) p.fromDate = fromDate;
      if (toDate)   p.toDate   = toDate;
    }
    return p;
  }, [assocFilter, statusFilter, dateRange, fromDate, toDate]);

  // Fetch bills + summary
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = buildParams();
      const [billsRes, summaryRes] = await Promise.all([
        getBills(params),
        getBillsSummary(params),
      ]);
      setBills(billsRes.data?.content ?? billsRes.data ?? []);
      setSummary(summaryRes.data ?? {});
    } catch {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Pay bill
  const handlePay = async (bill) => {
    try {
      setPayingId(bill.id);
      await payBill(bill.id);
      toast.success(`Bill ${bill.billNumber} marked as paid`);
      fetchData();
    } catch {
      toast.error("Failed to process payment");
    } finally {
      setPayingId(null);
    }
  };

  const filterSelectClass =
    "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-full";

  return (
    <div className="p-6">

      {/* ── Summary Cards ── */}
      <div className="flex flex-wrap gap-4 mb-6">
        <SummaryCard label="Total Bills"   value={summary.totalBills   ?? 0}                        />
        <SummaryCard label="Total Amount"  value={fmtCurrency(summary.totalAmount)}                  />
        <SummaryCard label="Unpaid"        value={fmtCurrency(summary.unpaidAmount)} color="text-yellow-600" />
        <SummaryCard label="Overdue"       value={fmtCurrency(summary.overdueAmount)} color="text-red-600"   />
      </div>

      {/* ── Filter Panel ── */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Association */}
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-primary)" }}>Association</label>
            <select value={assocFilter} onChange={(e) => setAssocFilter(e.target.value)} className={filterSelectClass}>
              <option value="">All Associations</option>
              {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-primary)" }}>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterSelectClass}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--color-primary)" }}>Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={filterSelectClass}>
              {DATE_RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Custom date pickers */}
          {dateRange === "CUSTOM" && (
            <>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--color-primary)" }}>From Date</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={filterSelectClass} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--color-primary)" }}>To Date</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={filterSelectClass} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Create button ── */}
      <div className="flex justify-end mb-3">
        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/accounting/bills/create")}>
          + Create Bill
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Bill #</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Vendor</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Association</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Expense Account</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Issue Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Due Date</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Amount</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Status</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-left">Bank Account</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={10} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={10} className="p-10 text-center text-gray-500">No bills found.</td></tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-300 p-4 text-sm font-bold text-gray-900">{bill.billNumber}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{bill.vendorName}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{bill.associationName}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{bill.expenseAccount || "—"}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{fmtDate(bill.issueDate)}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{fmtDate(bill.dueDate)}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{fmtCurrency(bill.amount)}</td>
                  <td className="border-r border-gray-300 p-4">
                    <StatusBadge status={bill.status} />
                  </td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{bill.bankAccountName || "—"}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/accounting/bills/edit/${bill.id}`)}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700"
                      >
                        Edit
                      </button>
                      {(bill.status === "UNPAID" || bill.status === "OVERDUE") && (
                        <button
                          onClick={() => handlePay(bill)}
                          disabled={payingId === bill.id}
                          className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition hover:opacity-90 disabled:opacity-60"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          {payingId === bill.id ? "..." : "Pay"}
                        </button>
                      )}
                    </div>
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