const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 active:from-blue-800 active:to-blue-900 shadow-md hover:shadow-lg',
    secondary: 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-white',
    outline: 'bg-white text-gray-800 hover:bg-gray-50 focus:ring-blue-500 active:bg-gray-100 border border-gray-300 shadow-sm',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 active:from-red-800 active:to-red-900 shadow-md hover:shadow-lg',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 active:from-green-800 active:to-green-900 shadow-md hover:shadow-lg',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm font-medium rounded-md',
    md: 'px-4 py-3 text-base font-medium rounded-lg',
    lg: 'px-6 py-3.5 text-lg font-semibold rounded-xl',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = 'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none';

  const baseClasses = 'inline-flex items-center justify-center font-sans transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1';

  const combinedClasses = [
    baseClasses,
    variantStyles[variant] || variantStyles.primary,
    sizeStyles[size] || sizeStyles.md,
    widthStyle,
    disabledStyle,
    className
  ].filter(Boolean).join(' ');

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
            aria-hidden="true"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
      
      {!loading && leftIcon && (
        <span className="mr-2 flex items-center" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      
      <span className="flex items-center">{children}</span>
      
      {!loading && rightIcon && (
        <span className="ml-2 flex items-center" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;