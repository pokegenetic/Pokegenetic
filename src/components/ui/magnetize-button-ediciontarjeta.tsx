import React from 'react';
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface MagnetizeButtonEdicionTarjetaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  particleCount?: number;
}

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

const MagnetizeButtonEdicionTarjeta: React.FC<MagnetizeButtonEdicionTarjetaProps> = ({
  children,
  className = '',
  particleCount = 18,
  ...props
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const onDown = () => setIsPressed(true);
  const onUp = () => setIsPressed(false);

  return (
    <button
      type="button"
      className={cn(
        // Gradiente y colores personalizados para ediciontarjeta
        "min-w-40 relative touch-none overflow-visible rounded-lg px-5 py-2.5 bg-gradient-to-r from-red-500 to-violet-700 text-white font-bold shadow-lg hover:scale-105 transition-transform text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800",
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
      {Array.from({ length: particleCount }).map((_, i) => (
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
        <PokeballIcon className="transition-transform duration-300" />
        {children}
      </span>
    </button>
  );
};

export default MagnetizeButtonEdicionTarjeta;
