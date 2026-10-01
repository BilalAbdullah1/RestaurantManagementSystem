import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";

type PropsType = {
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export default function TimePicker({
  id,
  value,
  onChange,
  label,
  placeholder = "Select Time",
  required = false,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpInstance = useRef<any>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (inputRef.current) {
      fpInstance.current = flatpickr(inputRef.current, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        onChange: (_, dateStr) => {
          if (onChangeRef.current) {
            const event = {
              target: { value: dateStr, name: inputRef.current?.name || "" },
            } as React.ChangeEvent<HTMLInputElement>;
            onChangeRef.current(event);
          }
        },
      });
    }

    return () => {
      if (fpInstance.current) fpInstance.current.destroy();
    };
  }, []);

  // Sync external value
  useEffect(() => {
    if (fpInstance.current && value !== undefined) {
      fpInstance.current.setDate(value || "", false);
    }
  }, [value]);

  return (
    <div className="w-full">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          required={required}
          placeholder={placeholder}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-blue-300 focus:ring-blue-500/20 dark:border-gray-700 dark:focus:border-blue-800 cursor-pointer"
        />
        <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-500">
        </span>
      </div>
    </div>
  );
}