

export default function ErrorMessage({ message, className = "" }) {
  if (!message) return null;

  return (
    <div
      className={`w-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2">
        {/* Icon */}
        <svg
          className="w-5 h-5 mt-0.5 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.516 11.59c.75 1.334-.213 2.99-1.742 2.99H3.483c-1.53 0-2.492-1.656-1.743-2.99L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-.993.883L9 8v3a1 1 0 001.993.117L11 11V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Message */}
        <span className="flex-1">{message}</span>
      </div>
    </div>
  );
}