import React from "react";

interface RecipientChipProps {
  id: string;
  label: string;
  isActive?: boolean;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

export default function RecipientChip({
  id,
  label,
  isActive = false,
  onDelete,
  onClick,
}: RecipientChipProps) {
  return (
    <div
      className={`
        inline-flex items-center bg-green-100 text-green-800 
        px-3 py-1 rounded-full text-sm transition-all
        ${isActive ? "ring-2 ring-green-500" : ""}
      `}
    >
      <span
        className="cursor-pointer truncate max-w-[150px]"
        onClick={() => onClick(id)}
        title={label}
      >
        {label}
      </span>
      <button
        type="button"
        className="ml-2 text-green-700 hover:text-green-900 focus:outline-none"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        aria-label={`Remove ${label}`}
      >
        <span className="text-lg font-bold text-red-500 cursor-pointer">×</span>
      </button>
    </div>
  );
}
