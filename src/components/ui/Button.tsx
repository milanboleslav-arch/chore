"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
    children?: React.ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {
        const variantsStyles = {
            primary: "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:bg-violet-500",
            secondary: "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:bg-cyan-500",
            outline: "border-2 border-slate-700 hover:border-violet-500 text-slate-300",
            ghost: "hover:bg-white/5 text-slate-400 hover:text-white",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg font-bold",
        };

        return (
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                ref={ref}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
                    variantsStyles[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : null}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
