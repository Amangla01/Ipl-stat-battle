import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "gold" | "danger" | "ghost" | "glass";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-glow-blue hover:from-blue-500 hover:to-blue-400",
  gold:
    "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-bold shadow-glow-gold hover:from-amber-400 hover:to-yellow-300",
  danger:
    "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-glow-red hover:from-red-500 hover:to-red-400",
  ghost:
    "bg-transparent text-slate-300 border border-white/10 hover:bg-white/5 hover:border-white/20 hover:text-white",
  glass:
    "bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 hover:border-white/20",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 text-xs rounded-lg gap-1",
  sm: "px-4 py-2 text-sm rounded-xl gap-1.5",
  md: "px-6 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3 text-base rounded-2xl gap-2",
  xl: "px-9 py-4 text-lg rounded-2xl gap-2.5",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.03, y: -1 }}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center font-display font-semibold
        transition-all duration-200 cursor-pointer select-none overflow-hidden
        ${VARIANTS[variant]} ${SIZES[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {/* Shimmer overlay */}
      {!isDisabled && variant !== "ghost" && (
        <span
          className="absolute inset-0 shimmer pointer-events-none rounded-inherit"
          style={{ borderRadius: "inherit" }}
        />
      )}

      {loading ? (
        <Loader2 className="animate-spin" size={size === "xs" ? 14 : size === "sm" ? 15 : 16} />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
