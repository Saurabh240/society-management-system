

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  required = false,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
      className={`
  px-3 py-2 rounded-md border text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  transition
  ${
    error
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300"
  }
  ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
`}
      >
        {/* Placeholder */}
        <option value="" disabled>
          {placeholder}
        </option>

        {/* Options */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Error Message */}
      {error && (
        <span className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}