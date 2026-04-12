
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAssociations } from "@/modules/associations/associationApi";
import { getCoaList, getLedgerEntries } from "../api/accountingApi";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear"; 
   
import ReactSelect from "react-select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {  Plus } from "lucide-react";


const BASIS_OPTIONS = [
  { value: "Cash", label: "Cash" },
  { value: "Accrual", label: "Accrual" },
];

/* CUSTOM OPTION (Checkbox) */
const CustomOption = (props) => {
  const { innerRef, innerProps, isSelected, label } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
    >
      <input type="checkbox" checked={isSelected} readOnly className="rounded border-gray-300 accent-blue-900 w-4 h-4 " />
      <span>{label}</span>
    </div>
  );
};
const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: "48px", 
    margin:"8px",
    borderColor: "#d1d5db",
    borderRadius: "0.5rem",
    boxShadow: "none",
    padding: "2px", 
    "&:hover": {
      borderColor: "#9ca3af",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 12px", 
  }),
  placeholder: (base) => ({
    ...base,
    color: "#6b7280",
    fontSize: "0.875rem", 
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#eff6ff", 
    borderRadius: "4px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#1e40af", 
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};
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

  dayjs.extend(quarterOfYear); 

export default function GeneralLedgerTab() {
  const navigate = useNavigate();
  const [associations, setAssociations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    associationId: "All",
    accountId: [],
    dateRange: "This Month",
    fromDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    toDate: dayjs().endOf("month").format("YYYY-MM-DD"),
    basis: "Cash",
  });

const groupedData = ledgerData.reduce((acc, entry) => {
    const group = entry.accountName || "Unassigned Account";
    if (!acc[group]) acc[group] = [];
    acc[group].push(entry);
    return acc;
  }, {});
 
  /*  group helper */
  const selectGroup = (group) => {
    const values = group.options.map((opt) => opt.value);
    setFilters((prev) => ({
      ...prev,
      accountId: Array.from(new Set([...prev.accountId, ...values])),
    }));
  };

  const deselectGroup = (group) => {
    const values = group.options.map((opt) => opt.value);
    setFilters((prev) => ({
      ...prev,
      accountId: prev.accountId.filter((id) => !values.includes(id)),
    }));
  };

  /* CUSTOM GROUP HEADER */
  const formatGroupLabel = (data) => (
    <div className="flex justify-between items-center px-2 py-1 font-semibold text-gray-700 border-b border-gray-100">
      <span className="text-xs uppercase tracking-wider">{data.label}</span>
      <div className="flex gap-3 text-blue-900 text-[10px]">
        <button type="button" className="hover:underline" onClick={(e) => { e.stopPropagation(); selectGroup(data); }}>
          Select All
        </button>
        <button type="button" className="hover:underline text-gray-400" onClick={(e) => { e.stopPropagation(); deselectGroup(data); }}>
          Clear
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [assocRes, coaRes] = await Promise.all([
          getAssociations(),
          getCoaList("", "", 0, 1000),
        ]);
        const rawAssoc = assocRes.data?.data || assocRes.data?.content || [];
        setAssociations([{ value: "All", label: "All Assc" }, ...rawAssoc.map((a) => ({ value: a.id, label: a.name }))]);

        const rawCoa = coaRes.data?.content || coaRes.data || [];
        const groupMap = {};
        rawCoa.forEach((acc) => {
          const groupName = acc.accountType || "Other";
          if (!groupMap[groupName]) groupMap[groupName] = [];
          groupMap[groupName].push({ value: acc.id, label: `${acc.accountCode} - ${acc.accountName}` });
        });

        const grouped = Object.keys(groupMap).map(group => ({
          label: group.toUpperCase(),
          options: groupMap[group]
        }));
        setAccounts(grouped);
      } catch (err) {
        toast.error("Failed to load filter options");
      }
    };
    loadDropdowns();
  }, []);


// date handling
const handleDatePresetChange = (preset) => {
  if (preset === "Custom Range") {
    setFilters((prev) => ({ ...prev, dateRange: preset }));
    return;
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
      // Explicitly set to start/end of quarter
      start = dayjs().startOf("quarter");
      end = dayjs().endOf("quarter");
      break;
    case "Last Quarter":
      // Move back 3 months (1 quarter) then get start/end
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
      return;
  }

  
  console.log(`Range for ${preset}:`, start.format("YYYY-MM-DD"), "to", end.format("YYYY-MM-DD"));

  setFilters((prev) => ({
    ...prev,
    dateRange: preset,
    fromDate: start.format("YYYY-MM-DD"),
    toDate: end.format("YYYY-MM-DD"),
  }));
};
  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (params.associationId === "All") delete params.associationId;
      if (params.accountId.length > 0) params.accountIds = params.accountId.join(",");
      const res = await getLedgerEntries(params);
      setLedgerData(res.data?.content || res.data || []);
    } catch (err) {
      toast.error("Failed to fetch ledger entries");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLedger(); }, [filters]);

  return (
    <div className="p-6 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">General Ledger</h2>
        <Button variant="primary" onClick={() => navigate("/dashboard/accounting/journal-entry/create")}>
         <Plus size={18} />
           Record General Journal Entry
        </Button>
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <Select label="Association" options={associations} value={filters.associationId} onChange={(e) => setFilters({ ...filters, associationId: e.target.value })} />

          <div className="lg:col-span-2">
            <label className="block text-sm  mb-1 accent-blue-900">Account</label>
            <ReactSelect
              isMulti
              options={accounts}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              placeholder="Search accounts..."
              components={{ Option: CustomOption }}
              formatGroupLabel={formatGroupLabel}
              styles={customStyles}
              value={accounts.flatMap((g) => g.options).filter((opt) => filters.accountId.includes(opt.value))}
              onChange={(selected) => setFilters({ ...filters, accountId: selected ? selected.map((s) => s.value) : [] })}
            />
          </div>

          <Select label="Date Range" 
          options={DATE_RANGE_OPTIONS} 
          value={filters.dateRange}
           onChange={(e) => handleDatePresetChange(e.target.value)} />
<Input
  type="date"
  label="From Date"
  value={filters.fromDate}
  onChange={(e) =>
    setFilters({
      ...filters,
      fromDate: e.target.value,
      dateRange: "Custom Range",
    })
  }
/>
          <Input type="date"
           label="To Date" 
           value={filters.toDate} 
           onChange={(e) => 
           setFilters({ ...filters,
            toDate: e.target.value, 
            dateRange: "Custom Range" })} />


            <Select 
            label="Accounting Basis" 
            options={BASIS_OPTIONS} 
            value={filters.basis} 
            onChange={(e) => setFilters({ ...filters, basis: e.target.value })} 
          />
        </div> 

        <div className="flex gap-4  pt-4">
          <Button variant="primary" loading={loading} onClick={fetchLedger}>Apply Filters</Button>
          <Button variant="outline" onClick={() => setFilters({ associationId: "All", accountId: [], dateRange: "This Month", fromDate: dayjs().startOf("month").format("YYYY-MM-DD"), toDate: dayjs().endOf("month").format("YYYY-MM-DD"), basis: "Cash" })}>
            Reset Filters
          </Button>
        </div>
      </Card>


{/* Table Section */}
      <div className="space-y-8">
        {loading ? (
          <div className="p-10 text-center text-gray-400 bg-white rounded-xl border">Loading...</div>
        ) : Object.keys(groupedData).length === 0 ? (
          <div className="p-10 text-center text-gray-500 bg-white rounded-xl border">
            No transactions found matching the selected filters.
          </div>
        ) : (
          Object.keys(groupedData).map((accountName) => {
            const entries = groupedData[accountName];
            
            // Calculate totals for this specific account group
            const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
            const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);

            return (
              <div key={accountName} className="overflow-hidden border border-gray-300 rounded-lg bg-white shadow-sm">
                {/* ACCOUNT HEADER */}
                <div
                  className="text-white px-4 py-3 text-sm font-bold tracking-wide"
                  style={{ backgroundColor: "var(--color-primary, #1e3a8a)" }}
                >
                  {accountName}
                </div>

                <table className="w-full table-auto border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600 uppercase font-bold">
                      <th className="p-3 text-left w-32">Date</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-right">Debit</th>
                      <th className="p-3 text-right">Credit</th>
                      <th className="p-3 text-right w-40">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {entries.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3">{dayjs(entry.date).format("YYYY-MM-DD")}</td>
                        <td className="p-3">{entry.description || "—"}</td>
                        <td className="p-3 text-right">
                          {entry.debit > 0 ? `$${entry.debit.toLocaleString(undefined, {minimumFractionDigits: 2})}` : ""}
                        </td>
                        <td className="p-3 text-right">
                          {entry.credit > 0 ? `$${entry.credit.toLocaleString(undefined, {minimumFractionDigits: 2})}` : ""}
                        </td>
                        <td className="p-3 text-right font-medium">
                           {/* entry.balance  */}
                           {entry.balance ? `$${entry.balance.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    ))}

                    {/* SUB-TOTAL ROW */}
                    <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                      <td colSpan={2} className="p-3">Total for {accountName}</td>
                      <td className="p-3 text-right">${totalDebit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-3 text-right">${totalCredit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-3 text-right">
                        {/* Final balance of the group */}
                        ${(entries[entries.length - 1]?.balance || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


