import React from "react";

export default function Loader({
  size = "md",
  text,
  fullScreen = false,
  className = "",
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-4",
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-blue-500 border-t-transparent ${sizeClasses[size]} ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        {spinner}
        {text && (
          <p className="mt-3 text-sm text-gray-600 font-medium">
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {spinner}
      {text && (
        <span className="text-sm text-gray-600 font-medium">
          {text}
        </span>
      )}
    </div>
  );
}