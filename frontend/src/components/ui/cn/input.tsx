import * as React from "react";
import { cn } from "../../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, ...props }, ref) => {
    if (type === "date") {
      return (
        <div
          className={cn(
            "relative max-w-[350px] flex h-12 w-full items-center justify-between",
            className
          )}
        >
          <input
            type="date"
            ref={ref}
            value={value ?? ""}
            className="absolute rounded-md border border-input right-0 top-0 h-full max-w-[300px] w-full cursor-pointer px-3 py-1 text-md shadow-sm"
            {...props}
          />
        </div>
      );
    }

    // Default for other inputs
    return (
      <input
        type={type}
        className={cn(
          "max-w-[350px] w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={value ?? ""}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
