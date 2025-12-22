// components/form/input/TimePickerField.tsx
import React from "react";
import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  id?: string;
  value?: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
  className?: string;
}

export default function TimePickerField({ id, value, onChange, placeholder, className = "" }: Props) {
  const toDate = (t?: string | null) => {
    if (!t) return null;
    const [hh, mm] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    return d;
  };

  const fromDate = toDate(value ?? null);

  return (
    <div className={className}>
      <DatePicker
        id={id}
        selected={fromDate}
        onChange={(date) => {
          if (!date) return onChange(null);
          const val = format(date as Date, "HH:mm");
          onChange(val);
        }}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={5}
        timeCaption="Time"
        dateFormat="HH:mm"
        placeholderText={placeholder || "--:--"}
        className="h-11 w-98 rounded-lg border px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094C81] dark:bg-gray-900 dark:text-white"
      />
    </div>
  );
}
