"use client";

import React, { useEffect, useRef, useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface MaterialTextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

const MaterialTextField = forwardRef<HTMLInputElement, MaterialTextFieldProps>(
  (
    { label, type = "text", id, icon, readOnly = false, placeholder, ...props },
    ref
  ) => {
    MaterialTextField.displayName = "Input";

    const [active, setActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (!ref) return;
      const element = inputRef.current;
      if (typeof ref === "function") {
        ref(element);
      } else {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current =
          element;
      }
    }, [ref]);

    const hasValue =
      props.value !== undefined
        ? props.value !== ""
        : inputRef.current?.value !== "";

    const handleFocus = () => setActive(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setActive(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(e);
    };

    return (
      <div className="relative !font-normal !m-0  mt-2.5">
        <input
          {...props}
          id={id}
          type={type}
          readOnly={readOnly}
          placeholder={placeholder}
          tabIndex={readOnly ? -1 : 0}
          ref={inputRef}
          onFocus={readOnly ? undefined : handleFocus}
          onBlur={readOnly ? undefined : handleBlur}
          onChange={handleChange}
          className={cn(
            "block w-full border rounded-[5px] bg-transparent p-3 text-base transition-colors duration-200 focus:outline-none",
            {
              "cursor-default text-zinc-500 dark:text-[#838383]": readOnly,
              "text-zinc-900 dark:text-white": !readOnly,
            },
            {
              "border-sidebar-primary": active,
              "border-zinc-300 dark:border-zinc-700": !active,
            },
            icon && "pl-10"
          )}
        />
        {icon && (
          <>
            <div className="absolute top-[17px] left-3">{icon}</div>
            <div className="absolute inset-y-0 left-6 top-[16px] w-px h-5 bg-gray-300 mx-2" />
          </>
        )}

        <label
          htmlFor={id}
          className={cn(
            "absolute left-3 top-3 pointer-events-none origin-left transition-all duration-200",
            {
              "-translate-y-6 scale-75": active || hasValue || placeholder,
              "translate-y-0 scale-100 text-zinc-500 dark:text-zinc-400 -ml-2":
                !(active || hasValue || placeholder),
            },
            {
              "text-sidebar-primary": active,
              "text-zinc-500": !active,
            }
          )}
        >
          <span className={cn({ "bg-white px-2 dark:bg-black": label })}>
            {label}
          </span>
        </label>
      </div>
    );
  }
);
export default MaterialTextField;
