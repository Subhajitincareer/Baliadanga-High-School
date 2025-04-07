
import React from "react";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon: Icon, ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <Input
          ref={ref}
          className={`${Icon ? "pl-8" : ""} ${className}`}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
