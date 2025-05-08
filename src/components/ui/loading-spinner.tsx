import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
}

export const LoadingSpinner = ({ text = "Loading..." }: LoadingSpinnerProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-school-primary" />
        <p className="text-lg text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};