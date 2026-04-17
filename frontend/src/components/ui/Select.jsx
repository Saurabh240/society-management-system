import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error = "",
  required = false,
  disabled = false,
  fullWidth = true,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange({
      target: {
        name,
        value: option.value,
      },
    });
    setOpen(false);
  };

  return (
    <div
      className={`${fullWidth ? "w-full" : "inline-block"} relative`}
      ref={dropdownRef}
    >
      {label && (
        <label className="block mb-2 text-sm text-(--color-primary)">
          {label}
          {required && (
            <span className="text-(--color-danger) ml-1">*</span>
          )}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-center px-4 py-3 rounded-lg border bg-white text-gray-900
        ${
          error
            ? "border-(--color-danger)"
            : "border-(--color-primary-light)"
        }
        focus:outline-none focus:ring-2 focus:ring-(--color-primary)`}
      >

        <span>{selected ? selected.label : "Select option"}</span>

        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white border border-(--color-primary-light) rounded-lg shadow-lg mt-1 z-50">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => !option.disabled && handleSelect(option)}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-(--color-primary-light)
              ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-(--color-danger)">{error}</p>
      )}
    </div>
  );
}