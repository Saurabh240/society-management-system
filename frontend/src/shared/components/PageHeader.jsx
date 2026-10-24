import React from "react";
import { ChevronLeft } from "lucide-react";

/**
 * Standard page header: optional back link, title (+ badge/subtitle) and right-aligned actions.
 * Use on every list, view and form page so titles and buttons sit in the same place.
 */
export default function PageHeader({ title, subtitle, badge, onBack, backLabel = "Back", actions, className = "" }) {
  return (
    <div className={`mb-6 ${className}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-[var(--color-primary)] hover:text-gray-800 mb-3 transition-colors font-medium text-sm group"
        >
          <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          {backLabel}
        </button>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
