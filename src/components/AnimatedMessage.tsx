import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageType = "success" | "error" | "warning";

interface AnimatedMessageProps {
  type: MessageType;
  message: string;
  className?: string;
  id?: string;
  role?: "alert" | "status";
}

/**
 * AnimatedMessage component provides animated error/success messages
 * with slide-in and fade animations
 */
const AnimatedMessage = ({
  type,
  message,
  className,
  id,
  role = "alert",
}: AnimatedMessageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [message]);

  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
  };

  const colorMap = {
    success: "text-primary",
    error: "text-destructive",
    warning: "text-yellow-500",
  };

  const Icon = iconMap[type];

  return (
    <div
      id={id}
      role={role}
      className={cn(
        "flex items-center gap-1.5 text-sm transition-all duration-500 ease-smooth",
        isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-4",
        className
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 flex-shrink-0 animate-bounce-in",
          colorMap[type]
        )}
        aria-hidden="true"
      />
      <span className={cn(colorMap[type])}>{message}</span>
    </div>
  );
};

export default AnimatedMessage;

