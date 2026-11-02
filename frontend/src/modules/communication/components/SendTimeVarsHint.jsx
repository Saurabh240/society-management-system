import { useState } from "react";
import { Info } from "lucide-react";

/**
 * Small info icon that explains which placeholders are filled in per recipient
 * when the message is sent. Hover, focus or click the icon to see the list.
 */
export default function SendTimeVarsHint({ vars = [], className = "" }) {
  const [open, setOpen] = useState(false);
  if (!vars.length) return null;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        aria-label="Variables resolved per recipient at send time"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 focus:outline-none"
      >
        <Info size={16} />
        <span className="font-medium">{vars.length} variable{vars.length > 1 ? "s" : ""}</span>
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute left-0 top-full mt-1 z-50 w-72 rounded-lg border border-amber-200 bg-white p-3 shadow-lg"
        >
          <p className="text-xs font-semibold text-amber-700 mb-2">Resolved per recipient at send time</p>
          <div className="flex flex-wrap gap-1">
            {vars.map((v) => (
              <span key={v} className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-mono">
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
