

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import { getCoaList, getLedgerEntries } from "../api/accountingApi";
import { toast } from "react-toastify";
import dayjs from "dayjs"; 

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const DATE_RANGE_OPTIONS = [
  { value: "Today", label: "Today" },
  { value: "Yesterday", label: "Yesterday" },
  { value: "This Week", label: "This Week" },
  { value: "Last Week", label: "Last Week" },
  { value: "This Month", label: "This Month" },
  { value: "Last Month", label: "Last Month" },
  { value: "This Quarter", label: "This Quarter" },
  { value: "Last Quarter", label: "Last Quarter" },
  { value: "This Year", label: "This Year" },
  { value: "Last Year", label: "Last Year" },
  { value: "Custom Range", label: "Custom Range" },
];

export default function GeneralLedgerTab() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    associationId: "All",
    accountId: "All",
    dateRange: "This Month",
    fromDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    toDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    basis: "Cash"
  });

  // Fetch Dropdowns 
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [assocRes, coaRes] = await Promise.all([
          getAssociations(),
          getCoaList("", "", 0, 1000)
        ]);
        const rawAssoc = assocRes.data?.data || assocRes.data?.content || [];
        setAssociations([{ value: "All", label: "All Assc" }, ...rawAssoc.map(a => ({ value: a.id, label: a.name }))]);
        
        const rawCoa = coaRes.data?.content || coaRes.data || [];
        setAccounts([{ value: "All", label: "All Acco..." }, ...rawCoa.map(acc => ({ 
          value: acc.id, 
          label: `${acc.accountCode} - ${acc.accountName}` 
        }))]);
      } catch (err) {
        toast.error("Failed to load filter options");
      }
    };
    loadDropdowns();
  }, []);

  //  Auto-fill Dates 
  const handleDatePresetChange = (preset) => {
    let start = "";
    let end = "";

    switch (preset) {
      case "Today": start = end = dayjs().format('YYYY-MM-DD'); break;
      case "Yesterday": start = end = dayjs().subtract(1, 'day').format('YYYY-MM-DD'); break;
      case "This Week": start = dayjs().startOf('week').format('YYYY-MM-DD'); end = dayjs().endOf('week').format('YYYY-MM-DD'); break;
      case "This Month": start = dayjs().startOf('month').format('YYYY-MM-DD'); end = dayjs().endOf('month').format('YYYY-MM-DD'); break;
      case "Last Month": start = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'); end = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'); break;
      case "This Quarter": start = dayjs().startOf('quarter').format('YYYY-MM-DD'); end = dayjs().endOf('quarter').format('YYYY-MM-DD'); break;
      case "This Year": start = dayjs().startOf('year').format('YYYY-MM-DD'); end = dayjs().endOf('year').format('YYYY-MM-DD'); break;
      default: break; 
    }

    setFilters(prev => ({ ...prev, dateRange: preset, fromDate: start, toDate: end }));
  };

  //  Fetch Ledger (Apply Filters) 
  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (filters.associationId !== "All") params.associationId = filters.associationId;
      if (filters.accountId !== "All") params.accountId = filters.accountId;
      if (filters.fromDate) params.from = filters.fromDate;
      if (filters.toDate) params.to = filters.toDate;
      if (filters.basis) params.basis = filters.basis;

      const res = await getLedgerEntries(params);
      setLedgerData(res.data?.content || res.data || []);
    } catch (err) {
      toast.error("Failed to fetch ledger entries");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLedger(); }, []); 

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">General Ledger</h2>
        <Button variant="primary" onClick={() => navigate("/dashboard/accounting/journal-entry/create")}>
          + Record General Journal Entry
        </Button>
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Select label="Association" name="associationId" options={associations} value={filters.associationId} onChange={(e) => setFilters({...filters, associationId: e.target.value})} />
          <Select label="Account" name="accountId" options={accounts} value={filters.accountId} onChange={(e) => setFilters({...filters, accountId: e.target.value})} />
          <Select label="Date Range" options={DATE_RANGE_OPTIONS} value={filters.dateRange} onChange={(e) => handleDatePresetChange(e.target.value)} />
          <Input type="date" label="From Date" value={filters.fromDate} onChange={(e) => setFilters({...filters, fromDate: e.target.value, dateRange: "Custom Range"})} />
          <Input type="date" label="To Date" value={filters.toDate} onChange={(e) => setFilters({...filters, toDate: e.target.value, dateRange: "Custom Range"})} />
          <Select label="Accounting Basis" options={[{value: "Cash", label: "Cash"}, {value: "Accrual", label: "Accrual"}]} value={filters.basis} onChange={(e) => setFilters({...filters, basis: e.target.value})} />
        </div>

        <div className="flex gap-4">
          <Button variant="primary" loading={loading} onClick={fetchLedger}>Apply Filters</Button>
          <Button variant="outline" onClick={() => {
            const reset = { associationId: "All", accountId: "All", dateRange: "This Month", fromDate: dayjs().startOf('month').format('YYYY-MM-DD'), toDate: dayjs().endOf('month').format('YYYY-MM-DD'), basis: "Cash" };
            setFilters(reset);
            
          }}>Reset Filters</Button>
        </div>
      </Card>

      {/* Table  */}
      <div className="w-full border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <table className="w-full table-auto text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Date", "Account", "Description", "Debit", "Credit"].map(h => (
                <th key={h} className="p-4 text-xs font-bold uppercase text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ledgerData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-500">
                  No transactions found matching the selected filters. <br/>
                  <span className="text-sm">Try adjusting your filters or selecting a different date range.</span>
                </td>
              </tr>
            ) : (
              ledgerData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-sm text-gray-700">{dayjs(entry.date).format('MMM DD, YYYY')}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{entry.accountName}</td>
                  <td className="p-4 text-sm text-gray-600">{entry.description}</td>
                  <td className="p-4 text-sm text-green-600 font-semibold">{entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : "—"}</td>
                  <td className="p-4 text-sm text-red-600 font-semibold">{entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}