"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface CardProps extends HTMLMotionProps<"div"> {
    glow?: boolean;
}

export const Card = ({ className, glow, children, ...props }: CardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
                "relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/[0.08]",
                glow && "shadow-[0_0_30px_rgba(139,92,246,0.1)] border-violet-500/30",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
