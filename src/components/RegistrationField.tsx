import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
  isLoading?: boolean;
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
  isLoading = false,
}: RegistrationFieldProps) => {
  const { t } = useTranslation();
  const hasError = !!error;
  const isSuccess = touched && !error && !!value && !isLoading;
  const isDuplicateEmailError = error && (
    error.includes("already registered") || 
    error.includes("tayari imesajiliwa") ||
    error === t("registration.errors.duplicateEmail")
  );

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
            {isLoading ? (
              <Loader2
                className="w-5 h-5 text-muted-foreground animate-spin"
                aria-hidden="true"
                aria-label="Checking email availability"
              />
            ) : hasError ? (
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
        <div
          id={`${id}-error`}
          className="text-sm text-destructive space-y-1"
          role="alert"
        >
          <p className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
          {/* Show helpful suggestion for duplicate email errors */}
          {isDuplicateEmailError && (
            <p className="text-xs text-muted-foreground ml-5 pl-0.5">
              {t("registration.errors.duplicateEmailSuggestion")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
