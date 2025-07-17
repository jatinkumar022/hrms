"use client";

import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

interface MaterialTextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  rows?: number;
}

const MaterialTextArea = forwardRef<HTMLTextAreaElement, MaterialTextAreaProps>(
  ({ label, id, readOnly = false, placeholder, rows = 4, ...props }, ref) => {
    MaterialTextArea.displayName = "MaterialTextArea";

    const [active, setActive] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (!ref) return;
      const element = textareaRef.current;
      if (typeof ref === "function") {
        ref(element);
      } else {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          element;
      }
    }, [ref]);

    const hasValue =
      props.value !== undefined
        ? props.value !== ""
        : textareaRef.current?.value !== "";

    const handleFocus = () => setActive(true);
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setActive(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      props.onChange?.(e);
    };

    return (
      <div className="w-full relative  font-normal">
        <textarea
          {...props}
          id={id}
          readOnly={readOnly}
          placeholder={placeholder}
          tabIndex={readOnly ? -1 : 0}
          ref={textareaRef}
          onFocus={readOnly ? undefined : handleFocus}
          onBlur={readOnly ? undefined : handleBlur}
          onChange={handleChange}
          rows={rows}
          className={cn(
            "block w-full border rounded-[5px] bg-transparent p-3 text-base transition-colors duration-200 resize-none focus:outline-none",
            {
              "cursor-default text-zinc-500 dark:text-[#838383]": readOnly,
              "text-zinc-900 dark:text-white": !readOnly,
            },
            {
              "border-sidebar-primary": active,
              "border-zinc-300 dark:border-zinc-700": !active,
            }
          )}
        />
        <label
          htmlFor={id}
          className={cn(
            "absolute left-3 top-3 pointer-events-none origin-left transition-all duration-200",
            {
              "-translate-y-6 scale-75": active || hasValue || placeholder,
              "translate-y-0 scale-100 text-zinc-500 dark:text-zinc-400": !(
                active ||
                hasValue ||
                placeholder
              ),
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

export default MaterialTextArea;
