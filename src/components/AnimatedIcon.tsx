import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = "success" | "error" | "warning" | "loading";

interface AnimatedIconProps {
  type: IconType;
  className?: string;
  size?: number;
  delay?: number;
}

/**
 * AnimatedIcon component provides animated feedback icons
 * with entrance animations and visual effects
 */
const AnimatedIcon = ({ type, className, size = 20, delay = 0 }: AnimatedIconProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const iconClasses = cn(
    "transition-all duration-500 ease-bounce-in",
    isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0",
    className
  );

  switch (type) {
    case "success":
      return (
        <CheckCircle
          size={size}
          className={cn(
            iconClasses,
            "text-primary animate-bounce-in"
          )}
          aria-hidden="true"
        />
      );
    case "error":
      return (
        <XCircle
          size={size}
          className={cn(
            iconClasses,
            "text-destructive animate-bounce-in"
          )}
          aria-hidden="true"
        />
      );
    case "warning":
      return (
        <AlertCircle
          size={size}
          className={cn(
            iconClasses,
            "text-yellow-500 animate-bounce-in"
          )}
          aria-hidden="true"
        />
      );
    case "loading":
      return (
        <Loader2
          size={size}
          className={cn(
            iconClasses,
            "text-primary animate-spin"
          )}
          aria-hidden="true"
        />
      );
    default:
      return null;
  }
};

export default AnimatedIcon;

