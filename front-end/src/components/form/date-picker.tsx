import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";

type PropsType = {
  id?: string;
  mode?: "single" | "multiple" | "range" | "time";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
};

export default function DatePicker({
  id,
  mode = "single",
  value,
  onChange,
  label,
  placeholder,
  required = false,
}: PropsType) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpInstance = useRef<any>(null);
  
  // 1. Live onChange handler ko ref mein rakha taake useEffect baar-baar trigger na ho
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize Flatpickr (Sirf ek baar chale gaa on mount)
  useEffect(() => {
    if (inputRef.current) {
      fpInstance.current = flatpickr(inputRef.current, {
        mode: mode,
        monthSelectorType: "static",
        dateFormat: "Y-m-d",
        appendTo: document.body,
        disableMobile: true,
        clickOpens: true,
        onChange: (_, dateStr) => {
          if (onChangeRef.current) {
            const event = {
              target: {
                value: dateStr,
                name: inputRef.current?.name || "",
              },
              value: dateStr,
              toString: () => dateStr
            } as any;
            (onChangeRef.current as any)(event);
          }
        },
      });
    }

    return () => {
      if (fpInstance.current) {
        fpInstance.current.destroy();
      }
    };
  }, [mode]); // Removed onChange from dependencies to prevent destructive re-renders

  // External value sync karne k lye (Edit student ke waqt kaam ayega)
  useEffect(() => {
    if (fpInstance.current && value !== undefined) {
      fpInstance.current.setDate(value || "", false);
    }
  }, [value]);

  return (
    <div className="w-full">
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative cursor-pointer">
        <input
          ref={inputRef}
          id={id}
          required={required}
          placeholder={placeholder}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-blue-300 focus:ring-blue-500/20 dark:border-gray-700 dark:focus:border-blue-800 cursor-pointer"
        />

        <span 
          className="absolute text-gray-400 -translate-y-1/2 cursor-pointer right-3 top-1/2 dark:text-gray-500"
          onClick={() => fpInstance.current?.open()}
        >
          <CalenderIcon className="size-5" />
        </span>
      </div>
    </div>
  );
}