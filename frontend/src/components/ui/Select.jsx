export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
 
  error = '',
  required = false,
  disabled = false,
  fullWidth = true,
  className = "",
}) {

  const selectClasses = [
    'block w-full px-4 py-3 text-base',
    'rounded-lg border transition-all duration-200',
    'bg-white text-gray-900',
    'focus:outline-none focus:ring-2',
    disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed opacity-60',
    error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
      : 'border-blue-500 focus:border-blue-500 focus:ring-blue-500',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
      
      {label && (
        <label
          htmlFor={name}
          className="block mb-2 text-sm text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={selectClasses}
      >
      

        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}