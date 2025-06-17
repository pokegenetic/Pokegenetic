import * as React from "react"

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
const PokeballIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className={cn("w-4 h-4", className)}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M2 12h20" />
  </svg>
);
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MagnetizeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    particleCount?: number;
    attractRadius?: number;
}

function MagnetizeButton({
    className,
    particleCount = 18,
    attractRadius = 1000,
    ...props
}: MagnetizeButtonProps) {
    const [isPressed, setIsPressed] = useState(false);

    const onDown = () => setIsPressed(true);
    const onUp = () => setIsPressed(false);

    return (
        <Button
            className={cn(
                "min-w-40 relative touch-none overflow-visible",
                "bg-violet-100 dark:bg-violet-900",
                "hover:bg-violet-200 dark:hover:bg-violet-800",
                "text-violet-600 dark:text-violet-300",
                "border border-violet-300 dark:border-violet-700",
                "transition-all duration-300",
                isPressed && "scale-95 shadow-md",
                className
            )}
            onMouseDown={onDown}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStartCapture={onDown}
            onTouchEndCapture={onUp}
            {...props}
        >
            {Array.from({ length: 18 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{
                        x: [0, (Math.random() - 0.5) * 40],
                        y: [0, (Math.random() - 0.5) * 40],
                        scale: [0, Math.random() * 0.8 + 0.4],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: Math.random() * 1.5 + 1.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                    className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                    style={{ left: `${Math.random() * 140 - 20}%`, top: `${Math.random() * 140 - 20}%`, filter: "blur(2px)" }}
                />
            ))}
            <span className="relative w-full flex items-center justify-center gap-2">
                <PokeballIcon
                    className={cn(
                        "transition-transform duration-300"
                    )}
                />
                Crear Pokémon
            </span>
        </Button>
    );
}

export { MagnetizeButton }