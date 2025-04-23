import React, { useState } from "react";

interface RecipientChipProps {
  id: string;
  label: string;
  isActive?: boolean;
  isSaved?: boolean;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

export default function RecipientChip({
  id,
  label,
  isActive = false,
  isSaved = false, // Default to false
  onDelete,
  onClick,
}: RecipientChipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative group">
      {/* Tooltip - only show on hover when not active */}
      {showTooltip && !isActive && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
          Click to edit recipient
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* Chip with animated border on hover (but not when active) */}
      <div
        className={`
          inline-flex items-center ${
            isSaved ? "bg-green-100" : "bg-green-100/50"
          } text-green-800 
          px-3 py-1 rounded-full text-sm transition-all
          relative overflow-hidden
          ${isActive ? "ring-2 ring-green-500" : ""}
          ${isSaved ? "border border-green-300" : ""}
          group-hover:shadow-sm
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Animated border - only shown on hover when not active */}
        {!isActive && (
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100">
            <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-border-flow"></div>
          </div>
        )}

        {/* Add a small bookmark icon for saved contacts */}
        {isSaved && (
          <span className="mr-1 text-green-600" title="Saved contact">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 h-3"
            >
              <path
                fillRule="evenodd"
                d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 001.075.676L10 15.082l5.925 2.844A.75.75 0 0017 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0010 2z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}

        <span
          className="cursor-pointer truncate max-w-[150px] relative z-10"
          onClick={() => onClick(id)}
          // title={label}
        >
          {label}
        </span>
        <button
          type="button"
          className="ml-2 text-green-700 hover:text-green-900 focus:outline-none relative z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          aria-label={`Remove ${label}`}
        >
          <span className="text-xl font-bold cursor-pointer">×</span>
        </button>
      </div>
    </div>
  );
}
