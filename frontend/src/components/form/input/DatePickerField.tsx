// components/form/input/DatePickerField.tsx
import React from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  id?: string;
  value?: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
  className?: string;
}

export default function DatePickerField({ id, value, onChange, placeholder, className = "" }: Props) {
  const selected: Date | null = value ? new Date(value) : null;

  return (
    <div className={`relative ${className}`}>
      <DatePicker
        id={id}
        selected={selected}
        onChange={(date) => {
          if (!date) return onChange(null);
          const iso = format(date as Date, "yyyy-MM-dd");
          onChange(iso);
        }}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder || "dd/mm/yyyy"}
        className="h-11 w-98 rounded-lg border px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094C81] dark:bg-gray-900 dark:text-white"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
    </div>
  );
}
