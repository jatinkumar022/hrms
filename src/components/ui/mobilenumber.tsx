"use client";

import { useRef, useState } from "react";

interface MaterialTextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

function MobileInput({
  id,
  label = "Mobile Number",
  ...props
}: MaterialTextFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");

  const handleFocus = () => setActive(true);

  const handleBlur = () => {
    setActive(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    raw = raw.slice(0, 10);

    // Insert space after 5 digits
    let formatted = raw;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)} ${raw.slice(5)}`;
    }

    setValue(formatted);
  };

  return (
    <div className="relative">
      <span
        className={`absolute inset-y-0 left-0 flex items-center pl-3 text-sm select-none ${
          active ? "" : " text-muted-foreground"
        }`}
      >
        <span className="text-lg mb-0.5">🇮🇳</span> +91
      </span>
      <div className="absolute inset-y-0 left-14 top-[16px] w-px h-5 bg-gray-300 mx-2" />

      <input
        {...props}
        id={id}
        type="text"
        ref={ref}
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        inputMode="numeric"
        pattern="\d*"
        className={`
          block w-full border-1 rounded-[5px] bg-transparent p-3 text-base text-zinc-900 dark:text-white pl-18
          transition-colors duration-200
          ${
            active
              ? "border-sidebar-primary"
              : "border-zinc-300 dark:border-zinc-700"
          }
          focus:outline-none appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
          [mozappearance:textfield]
        `}
        maxLength={11} // 10 digits + 1 space
      />
      <label
        htmlFor={id}
        className={`
          absolute left-3 top-3 pointer-events-none origin-left
          transition-all duration-200 -translate-y-6 scale-75  
          ${active ? " text-sidebar-primary " : "text-zinc-500"}
        `}
      >
        <span className="bg-white px-2 dark:bg-black">{label}</span>
      </label>
    </div>
  );
}

export default MobileInput;
