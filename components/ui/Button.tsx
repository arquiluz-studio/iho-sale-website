import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "outline" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-arquiluz-black text-white hover:bg-gray-800",
    outline: "border border-arquiluz-black text-arquiluz-black hover:bg-arquiluz-black hover:text-white",
    accent:
      "bg-arquiluz-accent text-white border border-arquiluz-accent hover:bg-arquiluz-black hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-7 py-3 text-sm",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
