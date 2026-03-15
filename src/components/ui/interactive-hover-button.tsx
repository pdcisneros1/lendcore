import React from "react";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'ghost' | 'blue' | 'green' | 'dark';
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", icon: Icon, variant = 'default', className, ...props }, ref) => {
  const variantStyles = {
    default: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
    outline: "bg-background border-input text-foreground hover:bg-accent",
    ghost: "bg-transparent border-transparent text-foreground hover:bg-accent",
    blue: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
    green: "bg-white border-input text-green-600 hover:text-green-700 hover:bg-green-50",
    dark: "bg-slate-900 text-white border-slate-900 hover:bg-slate-800",
  };

  const hoverBgStyles = {
    default: "bg-primary",
    outline: "bg-accent",
    ghost: "bg-accent",
    blue: "bg-blue-700",
    green: "bg-green-600",
    dark: "bg-slate-800",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border px-4 py-2 text-center text-sm font-semibold transition-all",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {/* Background animation layer - behind everything */}
      <div className={cn(
        "absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] -z-10",
        hoverBgStyles[variant]
      )}></div>

      {/* Default text - slides out on hover */}
      <span className="relative z-20 inline-flex items-center gap-1.5 translate-x-0 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {text}
      </span>

      {/* Hover text with arrow - slides in on hover */}
      <div className={cn(
        "absolute top-0 left-0 z-20 flex h-full w-full translate-x-12 items-center justify-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
        variant === 'green' ? "text-white" : "text-primary-foreground"
      )}>
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{text}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
