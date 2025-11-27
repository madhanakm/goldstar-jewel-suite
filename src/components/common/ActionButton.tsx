import { ReactNode, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "dark" | "outline" | "ghost" | "default";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>((
  {
    children,
    onClick,
    variant = "primary",
    size = "md",
    icon: Icon,
    loading = false,
    disabled = false,
    className
  },
  ref
) => {
  const variants = {
    default: "bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-700 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95",
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95",
    secondary: "bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 shadow-sm hover:shadow transform hover:scale-105 active:scale-95",
    success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95",
    warning: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95",
    dark: "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95",
    outline: "border-2 border-slate-300 text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-400 transform hover:scale-105 active:scale-95",
    ghost: "hover:bg-gradient-to-r hover:from-slate-100/50 hover:to-slate-200/50 text-slate-700 transform hover:scale-105 active:scale-95"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 rounded-xl",
    lg: "px-6 py-3 text-lg rounded-xl"
  };

  return (
    <Button
      ref={ref}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "transition-all duration-200 font-medium relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        variants[variant],
        sizes[size],
        loading && "opacity-70 cursor-not-allowed transform-none",
        disabled && "opacity-50 cursor-not-allowed transform-none",
        className
      )}
    >
      <span className="relative z-10 flex items-center">
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : Icon ? (
          <Icon className="w-4 h-4 mr-2" />
        ) : null}
        {children}
      </span>
    </Button>
  );
});

ActionButton.displayName = "ActionButton";