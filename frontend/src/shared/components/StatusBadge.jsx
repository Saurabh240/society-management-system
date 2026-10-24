import React from "react";

const TONES = {
  green: "bg-green-50 text-green-700 border-green-200",
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
};

const AUTO = {
  ACTIVE: "green", PAID: "green", SENT: "green", COMPLETED: "green", DELIVERED: "green", OCCUPIED: "green",
  UNPAID: "amber", PENDING: "amber", PARTIALLY_PAID: "amber", SCHEDULED: "amber", DRAFT: "gray",
  OVERDUE: "red", FAILED: "red", INACTIVE: "gray", VACANT: "gray", CANCELLED: "gray",
};

/** Consistent pill for any status; tone is picked from the value unless given. */
export default function StatusBadge({ status, tone, className = "" }) {
  if (!status) return <span className="text-gray-400">—</span>;
  const key = String(status).toUpperCase().replace(/[\s-]+/g, "_");
  const cls = TONES[tone || AUTO[key] || "blue"];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls} ${className}`}>
      {String(status).replace(/_/g, " ")}
    </span>
  );
}
