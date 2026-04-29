

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getBills, getBillsSummary, payBill, getVendors } from "../api/accountingApi";
import { getAssociations } from "@/modules/associations/associationApi";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
// UI Components
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

// Constants 
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

// Helpers 
const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const fmtDate = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "—");

// Status Badge 
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

export default function BillsTab() {
  const navigate = useNavigate();

  const [bills, setBills]               = useState([]);
  const [summary, setSummary]           = useState({});
  const [associations, setAssociations] = useState([]);
  const [vendors, setVendors]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [payingId, setPayingId]         = useState(null);

  // Filters
  const [assocFilter, setAssocFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange]       = useState("THIS_MONTH");
  const [fromDate, setFromDate]         = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [toDate, setToDate]             = useState(dayjs().endOf("month").format("YYYY-MM-DD"));

  const handleDateChange = (value) => {
    setDateRange(value);
    let start = dayjs();
    let end = dayjs();

    switch (value) {
      case "THIS_MONTH":
        start = dayjs().startOf("month");
        end = dayjs().endOf("month");
        break;
      case "LAST_MONTH":
        start = dayjs().subtract(1, "month").startOf("month");
        end = dayjs().subtract(1, "month").endOf("month");
        break;
      case "THIS_YEAR":
        start = dayjs().startOf("year");
        end = dayjs().endOf("year");
        break;
      case "CUSTOM": return;
      default: return;
    }
    setFromDate(start.format("YYYY-MM-DD"));
    setToDate(end.format("YYYY-MM-DD"));
  };

  useEffect(() => {
    getAssociations().then((res) => setAssociations(res.data?.data ?? []));
    getVendors().then((res) => setVendors(res.data ?? []));
  }, []);

  const buildParams = useCallback(() => {
    const p = {};
    if (assocFilter) p.associationId = assocFilter;
    if (statusFilter) p.status = statusFilter;
    if (fromDate && toDate) {
      p.from = fromDate;
      p.to = toDate;
    }
    return p;
  }, [assocFilter, statusFilter, fromDate, toDate]);

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

  const handlePay = async (bill) => {
    try {
      if (!bill.bankAccountId) {
      toast.error("Bank account is missing for this bill");
      return;
    }
      setPayingId(bill.id);
      const payload = {
        bankAccountId: bill.bankAccountId,
        paymentDate: dayjs().format("YYYY-MM-DD"),
      };
      await payBill(bill.id, payload);
      toast.success(`Bill ${bill.billNumber} marked as paid`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  const vendorMap = vendors.reduce((acc, v) => {
    acc[v.id] = `${v.companyName} (${v.contactName})`;
    return acc;
  }, {});

  const associationMap = associations.reduce((acc, a) => {
    acc[a.id] = a.name;
    return acc;
  }, {});

  return (
    <div className="p-6">
      {/* ── Summary Cards ── */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Card className="p-5 flex-1 min-w-160px">
          <p className="text-sm text-gray-500 mb-2">Total Bills</p>
          <p className="text-2xl font-bold text-gray-900">{summary.totalBills ?? 0}</p>
        </Card>
        <Card className="p-5 flex-1 min-w-160px">
          <p className="text-sm text-gray-500 mb-2">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">{fmtCurrency(summary.totalAmount)}</p>
        </Card>
        <Card className="p-5 flex-1 min-w-160px">
          <p className="text-sm text-gray-500 mb-2">Unpaid</p>
          <p className="text-2xl font-bold text-yellow-600">{fmtCurrency(summary.unpaidAmount)}</p>
        </Card>
        <Card className="p-5 flex-1 min-w-160px">
          <p className="text-sm text-gray-500 mb-2">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{fmtCurrency(summary.overdueAmount)}</p>
        </Card>
      </div>

      {/* ── Filter Panel ── */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Association"
            value={assocFilter}
            onChange={(e) => setAssocFilter(e.target.value)}
            options={[{ value: "", label: "All Associations" }, ...associations.map(a => ({ value: String(a.id), label: a.name }))]}
          />

          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
          />

          <Select
            label="Date Range"
            value={dateRange}
            onChange={(e) => handleDateChange(e.target.value)}
            options={DATE_RANGE_OPTIONS}
          />

          {dateRange === "CUSTOM" && (
            <>
              <Input label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <Input label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </>
          )}
        </div>
      </Card>

      {/* Create button */}
      <div className="flex justify-end mb-3">
        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/accounting/bills/create")}>
           <Plus size={16} /> 
          Create Bill
        </Button>

        
      </div>

      {/* table */}
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
                  <td className="border-r border-gray-300 p-4 text-sm font-bold text-gray-900 hover:underline cursor-pointer" 
                  onClick={() => navigate(`/dashboard/accounting/bills/view/${bill.id}`)}>
                {bill.billNumber}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{vendorMap[bill.vendorId] || "—"}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{associationMap[bill.associationId] || "—"}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{bill.expenseAccount || "—"}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{fmtDate(bill.issueDate)}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{fmtDate(bill.dueDate)}</td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{fmtCurrency(bill.totalAmount)}</td>
                  <td className="border-r border-gray-300 p-4"><StatusBadge status={bill.status} /></td>
                  <td className="border-r border-gray-300 p-4 text-sm text-gray-700">{bill.bankAccountName || "—"}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/accounting/bills/edit/${bill.id}`)}>
                        Edit
                      </Button>
                      {(bill.status === "UNPAID" || bill.status === "OVERDUE") && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handlePay(bill)} 
                          loading={payingId === bill.id}
                        >
                          Pay
                        </Button>
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