import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface RegistrationFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  icon?: ReactNode;
  autoComplete?: string;
}

export const RegistrationField = ({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  icon,
  autoComplete,
}: RegistrationFieldProps) => {
  const hasError = !!error;
  const isSuccess = touched && !error && !!value;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn(hasError && "text-destructive")}>
        {icon && <span className="inline-block mr-1.5">{icon}</span>}
        {label} {required && "*"}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={cn(
            "bg-muted border-border focus:border-primary pr-10 transition-all duration-300",
            hasError && "border-destructive focus:border-destructive animate-error-flash",
            isSuccess && "border-primary"
          )}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
        {touched && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {hasError ? (
              <XCircle
                className="w-5 h-5 text-destructive animate-bounce-in"
                aria-hidden="true"
              />
            ) : isSuccess ? (
              <CheckCircle
                className="w-5 h-5 text-primary animate-success-pulse"
                aria-hidden="true"
                id={`${id}-success`}
                data-testid={`${id}-success`}
              />
            ) : null}
          </div>
        )}
      </div>
      {hasError && (
        <p
          id={`${id}-error`}
          className="text-sm text-destructive flex items-center gap-1.5"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
