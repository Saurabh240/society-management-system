import { useState, useEffect } from "react";
import { getOverview } from "../api/accountingApi";
import { toast } from "react-toastify";
import StatCard from "@/components/ui/StatCard";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export default function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const res = await getOverview();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch accounting overview:", err);
        toast.error("Could not load financial overview");
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl border border-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={formatCurrency(stats?.totalRevenue)} 
        />
        <StatCard 
          label="Total Expenses" 
          value={formatCurrency(stats?.totalExpenses)} 
        />
        <StatCard 
          label="Net Income" 
          value={formatCurrency(stats?.netIncome)} 
        />
        <StatCard 
          label="Outstanding" 
          value={formatCurrency(stats?.outstanding)} 
          isAlert={true} 
        />
      </div>
    </div>
  );
}