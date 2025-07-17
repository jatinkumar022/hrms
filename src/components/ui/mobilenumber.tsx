"use client";

import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ id, label = "Mobile Number", ...props }, ref) => {
    const localRef = useRef<HTMLInputElement>(null);
    const [active, setActive] = useState(false);

    // Forward the ref
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(localRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current =
          localRef.current;
      }
    }, [ref]);

    const hasValue =
      props.value !== undefined
        ? props.value !== ""
        : localRef.current?.value !== "";

    return (
      <div className="relative !m-0 mt-2.5 ">
        {/* +91 Prefix */}
        <span
          className={cn(
            "absolute inset-y-0 left-0 flex items-center pl-3 text-sm select-none",
            !active && "text-muted-foreground"
          )}
        >
          <span className="text-lg mb-0.5">🇮🇳</span> +91
        </span>

        {/* Divider */}
        <div className="absolute inset-y-0 left-14 top-[16px] w-px h-5 bg-gray-300 mx-2" />

        {/* Input */}
        <input
          {...props}
          id={id}
          ref={localRef}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          onFocus={(e) => {
            setActive(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setActive(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            props.onChange?.(e);
          }}
          className={cn(
            "block w-full border font-normal rounded-[5px] bg-transparent p-3 text-base text-zinc-900 dark:text-white pl-18 transition-colors duration-200 focus:outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [mozappearance:textfield]",
            {
              "border-sidebar-primary": active,
              "border-zinc-300 dark:border-zinc-700": !active,
            }
          )}
          maxLength={11}
        />

        {/* Label */}
        <label
          htmlFor={id}
          className={cn(
            "absolute left-3  top-3 pointer-events-none origin-left transition-all duration-200 -translate-y-6 scale-75",
            {
              "text-sidebar-primary": active,
              "text-zinc-500 dark:text-zinc-400": !active,
            }
          )}
        >
          <span className="bg-white px-2 dark:bg-black">{label}</span>
        </label>
      </div>
    );
  }
);

MobileInput.displayName = "MobileInput";
export default MobileInput;
