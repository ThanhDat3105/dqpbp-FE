"use client";

import * as React from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps extends React.InputHTMLAttributes<HTMLDivElement> {
  options: MultiSelectOption[];
  value?: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onValueChange,
      placeholder = "Select items...",
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabels = options
      .filter((opt) => value.includes(opt.value))
      .map((opt) => opt.label);

    const handleToggle = (optionValue: string) => {
      const newValues = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onValueChange?.(newValues);
    };

    const handleRemoveTag = (optionValue: string) => {
      onValueChange?.(value.filter((v) => v !== optionValue));
    };

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex min-h-8 w-full flex-wrap gap-1 rounded border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2 cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-within:ring-slate-300",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {selectedLabels.length > 0 ? (
            <>
              {selectedLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800"
                >
                  {label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(
                        options.find((o) => o.label === label)?.value || "",
                      );
                    }}
                    className="ml-0.5 inline-flex hover:opacity-70"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <ChevronDown className="ml-auto h-4 w-4 opacity-50 shrink-0" />
            </>
          ) : (
            <>
              <span className="text-slate-500 flex-1">{placeholder}</span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </>
          )}
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="max-h-48 overflow-y-auto p-1">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2",
                      value.includes(option.value)
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900",
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded border shrink-0",
                        value.includes(option.value)
                          ? "border-slate-900 bg-slate-900 dark:border-slate-50 dark:bg-slate-50"
                          : "border-slate-300 dark:border-slate-600",
                      )}
                    >
                      {value.includes(option.value) && (
                        <svg
                          className="h-full w-full p-0.5 text-white dark:text-slate-950"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-slate-500">
                  No options available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
