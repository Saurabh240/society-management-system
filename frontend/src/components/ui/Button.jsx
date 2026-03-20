const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  className = "",
  leftIcon,
  rightIcon,
  ...props
}) => {

  const variantStyles = {
    primary:
      "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)] shadow-md hover:shadow-lg",

    secondary:
      "bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-gray-100 focus:ring-[var(--color-primary)]",

    outline:
      "bg-white text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus:ring-[var(--color-primary)]",

    danger:
      "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)] focus:ring-[var(--color-danger)] shadow-md hover:shadow-lg",

    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg",
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-sm font-medium rounded-md",
    md: "px-4 py-3 text-base font-medium rounded-lg",
    lg: "px-6 py-3.5 text-lg font-semibold rounded-xl",
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const disabledStyle =
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none";

  const baseClasses =
    "inline-flex items-center justify-center font-sans transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1";

  const combinedClasses = [
    baseClasses,
    variantStyles[variant] || variantStyles.primary,
    sizeStyles[size] || sizeStyles.md,
    widthStyle,
    disabledStyle,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      )}

      {!loading && leftIcon && (
        <span className="mr-2 flex items-center">{leftIcon}</span>
      )}

      <span className="flex items-center">{children}</span>

      {!loading && rightIcon && (
        <span className="ml-2 flex items-center">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;