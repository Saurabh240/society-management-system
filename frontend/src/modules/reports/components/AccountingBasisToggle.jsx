import React from "react";

export default function AccountingBasisToggle({ value = "ACCRUAL", onChange, className = "" }) {
  const currentVal = (value || "ACCRUAL").toUpperCase();

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Accounting Basis
      </label>
      <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onChange && onChange("ACCRUAL")}
          className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
            currentVal === "ACCRUAL"
              ? "bg-white text-blue-900 shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Accrual
        </button>
        <button
          type="button"
          onClick={() => onChange && onChange("CASH")}
          className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
            currentVal === "CASH"
              ? "bg-white text-blue-900 shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Cash
        </button>
      </div>
    </div>
  );
}
