import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from "lucide-react";
import { getUnitLedgerSummary, getUnitLedgerTransactions } from '../unitLedgerApi';
import { getUnitById } from '../unitApi';
import { getAssociationById } from '../associationApi';
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StatCard from "@/components/ui/StatCard";

// Utility functions for Date Presets
const getDatePresets = () => {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
  const endOfYear = new Date(now.getFullYear(), 12, 0).toISOString().split('T')[0];

  return {
    'This Month': { from: startOfMonth, to: endOfMonth },
    'Last Month': { from: startOfLastMonth, to: endOfLastMonth },
    'This Year': { from: startOfYear, to: endOfYear },
    'Custom': { from: '', to: '' }
  };
};

const UnitLedgerPage = () => {
  const { associationId, unitId } = useParams();
  const navigate = useNavigate();
  const presets = getDatePresets();

  // Component States
  const [unit, setUnit] = useState(null);
  const [association, setAssociation] = useState(null);
  const [summary, setSummary] = useState({ currentBalance: 0, totalCharges: 0, totalPayments: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [dateRangePreset, setDateRangePreset] = useState('This Month');
  const [fromDate, setFromDate] = useState(presets['This Month'].from);
  const [toDate, setToDate] = useState(presets['This Month'].to);
  const [transactionType, setTransactionType] = useState('All Types');

  // Fetch Fully Dynamic Page Context Metadata
  useEffect(() => {
    if (!unitId || !associationId) return;
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const [unitRes, summaryRes, associationRes] = await Promise.all([
          getUnitById(unitId),
          getUnitLedgerSummary(unitId),
          getAssociationById(associationId),
        ]);
        const unitData = unitRes.data?.data || unitRes.data;
        const summaryData = summaryRes.data?.data || summaryRes.data;
        const associationData = associationRes.data?.data || associationRes.data;
        setUnit(unitData || null);
        setSummary(summaryData || { currentBalance: 0, totalCharges: 0, totalPayments: 0 });
        setAssociation(associationData || null);
      } catch (error) {
        console.error('Error fetching ledger metadata:', error);
        toast.error('Failed to load ledger data');
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [unitId, associationId]);

  // Main Transactions Fetcher
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        type: transactionType !== 'All Types' ? transactionType.toUpperCase() : undefined
      };
      const res = await getUnitLedgerTransactions(unitId, params);
      setTransactions(res.data?.data?.content ?? []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [unitId, fromDate, toDate, transactionType]);

  // Initial Auto-fetch on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle preset dropdown changes
  const handlePresetChange = (e) => {
    const selectedPreset = e.target.value;
    setDateRangePreset(selectedPreset);
    if (selectedPreset !== 'Custom') {
      setFromDate(presets[selectedPreset].from);
      setToDate(presets[selectedPreset].to);
    }
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setDateRangePreset('This Month');
    setFromDate(presets['This Month'].from);
    setToDate(presets['This Month'].to);
    setTransactionType('All Types');

    setLoading(true);
    getUnitLedgerTransactions(unitId, {
      fromDate: presets['This Month'].from,
      toDate: presets['This Month'].to
    }).then(res => {
      setTransactions(res.data?.data?.content ?? []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleExport = () => {
    alert("Feature coming soon!");
  };

  //Falls back to checking the unit's direct nested associationName property
  const associationName = association?.name || unit?.associationName || '...';
  
  const unitNumber = unit?.unitNumber || '...';
  const streetAddress = unit?.street || '—'; 
  const city = unit?.city || '';
  const state = unit?.state || '';
  const zipCode = unit?.zipCode || '';
  
  // Clean up comma formatting so it doesn't show trailing punctuation when values are empty
  const fullAddress = streetAddress !== '—' 
    ? `${streetAddress}, ${city}, ${state} ${zipCode}`.replace(/,\s*,/g, ',').trim() 
    : '—';
    
  // Format the occupancy text cleanly if it comes back with underscores
  const occupancyStatus = unit?.occupancyStatus 
    ? unit.occupancyStatus.replace('_', ' ') 
    : '—';
  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">
      {/* Top Header Controls Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link
            to={`/dashboard/associations/${associationId}/units/${unitId}`}
            className="flex items-center text-blue-900 hover:text-gray-800 text-sm font-medium mb-1 transition-colors group"
          >
            <ChevronLeft size={16} className="mr-0.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Unit {unitNumber}</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Unit Ledger - Unit {unitNumber}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/associations/${associationId}/units/${unitId}`)}
          >
            Back to Unit {unitNumber}
          </Button>

          <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden text-sm h-10">
            <button type="button" className="px-3 h-full hover:bg-gray-50 border-r border-gray-200 transition-colors">&larr;</button>
            <span className="px-4 text-gray-600 font-medium">1 / 3</span>
            <button type="button" className="px-3 h-full hover:bg-gray-50 border-l border-gray-200 transition-colors">&rarr;</button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Current Balance"
          value={`$${Number(summary.currentBalance || 0).toFixed(2)}`}
        />
        <StatCard
          title="Total Charges"
          value={`$${Number(summary.totalCharges || 0).toFixed(2)}`}
        />
        <StatCard
          title="Total Payments"
          value={`$${Number(summary.totalPayments || 0).toFixed(2)}`}
        />
      </div>

      {/* Unit Information Context Block */}
      <Card className="mb-8 overflow-hidden">
        <Card.Content className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Unit Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-sm">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Association</label>
              <p className="mt-1 font-medium text-gray-900">{associationName}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Number</label>
              <p className="mt-1 font-medium text-gray-900">{unitNumber}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</label>
              <p className="mt-1 text-gray-900 truncate font-medium" title={fullAddress}>{fullAddress}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Occupancy</label>
              <div className="mt-1">
                <span className="px-3 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  {occupancyStatus}
                </span>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Filter Interactive Component Row */}
      <form onSubmit={handleApplyFilters} className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <Select
              label="Date Range"
              name="dateRangePreset"
              value={dateRangePreset}
              onChange={handlePresetChange}
              options={[
                { value: 'This Month', label: 'This Month' },
                { value: 'Last Month', label: 'Last Month' },
                { value: 'This Year', label: 'This Year' },
                { value: 'Custom', label: 'Custom' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">From Date</label>
            <Input
              type="date"
              value={fromDate}
              disabled={dateRangePreset !== 'Custom'}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">To Date</label>
            <Input
              type="date"
              value={toDate}
              disabled={dateRangePreset !== 'Custom'}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div>
            <Select
              label="Transaction Type"
              name="transactionType"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              options={[
                { value: 'All Types', label: 'All Types' },
                { value: 'Invoice', label: 'Invoice' },
                { value: 'Payment', label: 'Payment' },
                { value: 'Fee', label: 'Fee' }
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 border-t border-gray-200 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Apply Filters
          </Button>
        </div>
      </form>

      {/* Primary Table Interface Block */}
      <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="p-6 flex justify-between items-center bg-white border-b border-gray-200">
          <span className="text-sm text-gray-500 font-medium">
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/associations/${associationId}/units/${unitId}/invoice/create`)}
            >
              Create Invoice
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 italic">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <p className="text-sm font-semibold text-gray-900 mb-1">No transactions found for the selected filters.</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or selecting a different date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead style={{ backgroundColor: "#a9c3f7" }}>
                <tr>
                  <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Date</th>
                  <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Description</th>
                  <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Account</th>
                  <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Type</th>
                  <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Charges</th>
                  <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Payments</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="border-r border-gray-200 p-4 text-sm text-center text-gray-600 whitespace-nowrap">{tx.date}</td>
                    <td className="border-r border-gray-200 p-4 text-sm text-center text-gray-600">{tx.description}</td>
                    <td className="border-r border-gray-200 p-4 text-sm text-center text-gray-600 whitespace-nowrap">{tx.account || 'General'}</td>
                    <td className="border-r border-gray-200 p-4 text-sm text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${tx.type === 'CHARGE' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="border-r border-gray-200 p-4 text-sm text-center whitespace-nowrap text-red-600 font-medium">
                      {tx.charges ? `$${Number(tx.charges).toFixed(2)}` : '—'}
                    </td>
                    <td className="border-r border-gray-200 p-4 text-sm text-center whitespace-nowrap text-green-700 font-medium">
                      {tx.payments ? `$${Number(tx.payments).toFixed(2)}` : '—'}
                    </td>
                    <td className="p-4 text-sm text-center whitespace-nowrap font-bold text-blue-600">
                      ${Number(tx.balance ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitLedgerPage;