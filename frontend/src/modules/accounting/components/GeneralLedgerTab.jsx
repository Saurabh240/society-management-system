import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import { getLedgerEntries, getCoaList } from "../api/accountingApi";
import { getAssociations } from "../../associations/associationApi";

const DATE_RANGES = [
  { label: "This Month",   value: "this_month"   },
  { label: "Last Month",   value: "last_month"   },
  { label: "This Quarter", value: "this_quarter" },
  { label: "This Year",    value: "this_year"    },
  { label: "Custom",       value: "custom"       },
];

const BASIS_OPTIONS = [
  { label: "Cash",    value: "CASH"    },
  { label: "Accrual", value: "ACCRUAL" },
];

function resolveDateRange(preset) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  switch (preset) {
    case "this_month":
      return {
        from: new Date(year, month, 1).toISOString().split("T")[0],
        to:   new Date(year, month + 1, 0).toISOString().split("T")[0],
      };
    case "last_month":
      return {
        from: new Date(year, month - 1, 1).toISOString().split("T")[0],
        to:   new Date(year, month, 0).toISOString().split("T")[0],
      };
    case "this_quarter": {
      const q = Math.floor(month / 3);
      return {
        from: new Date(year, q * 3, 1).toISOString().split("T")[0],
        to:   new Date(year, q * 3 + 3, 0).toISOString().split("T")[0],
      };
    }
    case "this_year":
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    default:
      return { from: "", to: "" };
  }
}

const fmt = (val) =>
  val ? `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—";

const selectCls = "border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";
const inputCls  = selectCls;

export default function GeneralLedgerTab() {
  const navigate = useNavigate();

  const [associationId,  setAssociationId]  = useState("");
  const [accountId,      setAccountId]      = useState("");
  const [dateRange,      setDateRange]      = useState("this_month");
  const [fromDate,       setFromDate]       = useState("");
  const [toDate,         setToDate]         = useState("");
  const [basis,          setBasis]          = useState("CASH");

  const [entries,        setEntries]        = useState([]);
  const [associations,   setAssociations]   = useState([]);
  const [accounts,       setAccounts]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [assocRes, coaRes] = await Promise.all([getAssociations(), getCoaList()]);
        setAssociations(assocRes.data.data || assocRes.data || []);
        setAccounts(coaRes.data.data || []);
      } catch { /* non-fatal */ }
    };
    load();
    const { from, to } = resolveDateRange("this_month");
    setFromDate(from);
    setToDate(to);
  }, []);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLedgerEntries({
        associationId: associationId || null,
        accountId:     accountId     || null,
        from:          fromDate      || null,
        to:            toDate        || null,
        basis:         basis         || null,
      });
      setEntries(res.data.data || []);
      setFiltersApplied(true);
    } catch {
      toast.error("Failed to load ledger entries");
    } finally {
      setLoading(false);
    }
  }, [associationId, accountId, fromDate, toDate, basis]);

  const handleReset = () => {
    setAssociationId(""); setAccountId(""); setDateRange("this_month"); setBasis("CASH");
    const { from, to } = resolveDateRange("this_month");
    setFromDate(from); setToDate(to);
    setEntries([]); setFiltersApplied(false);
  };

  const handlePreset = (preset) => {
    setDateRange(preset);
    if (preset !== "custom") { const { from, to } = resolveDateRange(preset); setFromDate(from); setToDate(to); }
  };

  return (
    <div>
      {/* Filter Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Association</label>
            <select value={associationId} onChange={(e) => setAssociationId(e.target.value)} className={selectCls}>
              <option value="">All Associations</option>
              {associations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={selectCls}>
              <option value="">All Accounts</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.accountCode ? `${a.accountCode} — ` : ""}{a.accountName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
            <select value={dateRange} onChange={(e) => handlePreset(e.target.value)} className={selectCls}>
              {DATE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setDateRange("custom"); }} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setDateRange("custom"); }} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Basis</label>
            <select value={basis} onChange={(e) => setBasis(e.target.value)} className={selectCls}>
              {BASIS_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" size="sm" onClick={fetchEntries} loading={loading}>Apply Filters</Button>
          <Button variant="outline" size="sm" onClick={handleReset}>Reset Filters</Button>
        </div>
      </div>

      {/* Add button */}
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/accounting/journal-entry/create")}>
          + Record General Journal Entry
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              {["Date","Account","Description","Debit","Credit"].map((h, i) => (
                <th key={h} className={`border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 ${i >= 3 ? "text-right" : "text-left"} last:border-r-0`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-gray-400">Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <p className="text-gray-500 font-medium mb-1">
                    {filtersApplied ? "No transactions found matching the selected filters." : "Apply filters above to load transactions."}
                  </p>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 whitespace-nowrap">{entry.date}</td>
                  <td className="border-r border-gray-200 p-4 text-sm">
                    <span className="font-medium text-gray-900">{entry.accountName}</span>
                    {entry.accountCode && <span className="text-gray-400 text-xs ml-1">({entry.accountCode})</span>}
                  </td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-600">{entry.description || "—"}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-right font-mono">{parseFloat(entry.debit) > 0 ? fmt(entry.debit) : "—"}</td>
                  <td className="p-4 text-sm text-right font-mono">{parseFloat(entry.credit) > 0 ? fmt(entry.credit) : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}