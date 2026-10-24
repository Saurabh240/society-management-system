import React from "react";

/** Titled card used to group read-only fields on view pages. */
export function DetailSection({ title, actions, children, className = "" }) {
  return (
    <section className={`bg-white border border-gray-200 rounded-xl shadow-sm mb-6 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

/** Responsive 1/2/3-column grid of fields. */
export function DetailGrid({ cols = 2, children }) {
  const map = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" };
  return <div className={`grid grid-cols-1 ${map[cols] || map[2]} gap-x-12 gap-y-6`}>{children}</div>;
}

/** Label above value; empty values render an em dash. */
export function DetailField({ label, value, children, span2 = false }) {
  const content = children ?? value;
  const empty = content === null || content === undefined || content === "";
  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-gray-900 break-words">{empty ? "—" : content}</dd>
    </div>
  );
}
