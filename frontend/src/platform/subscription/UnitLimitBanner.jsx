import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, XCircle, ArrowUpCircle } from "lucide-react";
import { getPlanStatus } from "./planApi";

export default function UnitLimitBanner() {
  const navigate = useNavigate();
  const [status, setStatus]   = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    // Only show for tenant users
    if (role === "PLATFORM_ADMIN") return;

    getPlanStatus()
      .then((r) => setStatus(r.data?.data ?? r.data))
      .catch(() => {}); // Silent fail — don't block UI
  }, []);

  if (!status || dismissed) return null;

  const { plan, isAtLimit, unitsRemaining } = status;

  // STANDARD plan → no banner
  if (plan === "STANDARD") return null;

  // FREE plan, plenty of units → no banner
  if (!isAtLimit && unitsRemaining > 3) return null;

  const atLimit = isAtLimit;

  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-sm
      ${atLimit
        ? "bg-red-50 border-b border-red-200 text-red-800"
        : "bg-amber-50 border-b border-amber-200 text-amber-800"}`}>

      <div className="flex items-center gap-2">
        {atLimit
          ? <XCircle size={16} className="flex-shrink-0" />
          : <AlertTriangle size={16} className="flex-shrink-0" />}
        <span>
          {atLimit
            ? "You've reached the 15-unit FREE limit. Upgrade to continue adding units."
            : `You have ${unitsRemaining} free unit${unitsRemaining === 1 ? "" : "s"} remaining on your Free Trial.`}
        </span>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={() => navigate("/plan-selection")}
          className={`flex items-center gap-1 font-semibold underline underline-offset-2 whitespace-nowrap
            ${atLimit ? "text-red-700 hover:text-red-900" : "text-amber-700 hover:text-amber-900"}`}>
          <ArrowUpCircle size={14} />
          Upgrade Plan
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-60 hover:opacity-100 font-medium">
          ×
        </button>
      </div>
    </div>
  );
}