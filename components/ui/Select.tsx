import { ChangeEvent } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select...",
  required = false,
  disabled = false,
}: SelectProps) {
  return (
    <div className="w-full">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5AC893] focus:border-transparent text-[#141B29] appearance-none bg-white"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
