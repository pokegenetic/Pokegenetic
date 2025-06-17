import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ClipboardPaste } from "lucide-react"; // Import paste icon
import { parseShowdownText, parseShowdownTeam } from "@/lib/parseShowdown";

// Gooey SVG filter (similar to search-bar)
const GooeyFilter: React.FC = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect-textarea"> {/* Unique ID */}
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

// Focus Particles hook (adapted from search-bar)
const useFocusParticles = (isActive: boolean) => {
  return useMemo(
    () =>
      Array.from({ length: isActive ? 18 : 0 }).map((_, i) => (
        <motion.div
          key={`focus-particle-${i}`}
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
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: "blur(2px)",
          }}
        />
      )),
    [isActive]
  );
};

// Click Particles component (adapted from search-bar)
const ClickParticles: React.FC<{ count: number; mousePosition: { x: number; y: number } }> = ({ count, mousePosition }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={`click-particle-${i}`}
          initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
          animate={{
            x: mousePosition.x + (Math.random() - 0.5) * 160,
            y: mousePosition.y + (Math.random() - 0.5) * 160,
            scale: Math.random() * 0.8 + 0.2,
            opacity: [1, 0],
          }}
          transition={{ duration: Math.random() * 0.8 + 0.5, ease: "easeOut" }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
              Math.random() * 200 + 55
            )}, ${Math.floor(Math.random() * 255)}, 0.8)`,
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
          }}
        />
      ))}
    </>
  );
};

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  onCreateShowdown?: (poke: ReturnType<typeof parseShowdownTeam>) => void; // MODIFIED: Expect Array from parseShowdownTeam
};

const ShowdownTextarea: React.FC<Props> = ({ className, onCreateShowdown, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const focusParticles = useFocusParticles(isFocused);

  // Validar showdown
  const parsed = useMemo(() => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return []; // Return empty array for empty input
    }
    // parseShowdownTeam handles both single and multiple entries and always returns an array.
    return parseShowdownTeam(trimmedValue);
  }, [value]);

  const isValid = Array.isArray(parsed) && parsed.length > 0 && parsed.every(p => p.pokemon && p.pokemon.species && p.pokemon.species !== 'Unknown');

  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent.toLowerCase();
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium");
    const isChromeOniOS = ua.includes("crios");
    return isSafari || isChromeOniOS;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFocused || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsClicked(true);
  };

  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => setIsClicked(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  // Ajustar altura del textarea según el contenido
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <div className="relative w-full max-w-md mx-auto my-2">
      <GooeyFilter />
      <motion.div
        ref={wrapperRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className={cn(
          "relative w-full p-0.5 border overflow-hidden backdrop-blur-sm flex items-start",
          isFocused
            ? "border-transparent"
            : "border-gray-300 dark:border-gray-700 bg-white/30 dark:bg-gray-800/50"
        )}
        initial={{ borderRadius: "9999px" }} // Removed height from initial
        animate={{
          boxShadow: isClicked
            ? "0 0 30px rgba(139, 92, 246, 0.4), inset 0 0 10px rgba(236, 72, 153, 0.6)"
            : isFocused
            ? "0 10px 25px rgba(0, 0, 0, 0.15)"
            : "none",
          borderRadius: isFocused || value.trim().length > 0 ? "1rem" : "9999px", // Redondo solo si no hay foco y está vacío
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          borderRadius: { type: "tween", duration: 0.01 }
        }}
      >
        {isFocused && (
          <motion.div
            className="absolute inset-0 -z-20 rounded-[calc(1rem-2px)]"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.2,
              background: [
                "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
                "linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)",
                "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
              ],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        )}

        <div
          className="absolute inset-0 overflow-hidden rounded-[calc(1rem-2px)] -z-10"
          style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect-textarea)" }}
        >
          {focusParticles}
        </div>

        {isClicked && <ClickParticles count={14} mousePosition={mousePosition} />}

        {/* Icon container */}
        <div className="pl-4 pr-2 py-3 self-start">
          <ClipboardPaste
            size={20}
            strokeWidth={isFocused ? 2.5 : 2}
            className={cn(
              "transition-all duration-300",
              isFocused
                ? "text-purple-600"
                : "text-gray-500 dark:text-gray-300"
            )}
          />
        </div>

        <textarea
          {...props}
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus && props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur && props.onBlur(e);
          }}
          style={{
            resize: 'none',
            minHeight: '68px',
            maxHeight: '400px',
            overflowY: textareaRef.current && textareaRef.current.scrollHeight > 400 ? 'auto' : 'hidden',
            ...props.style
          }}
          className={cn(
            "flex-grow w-full pl-1 pr-3 py-3",
            "bg-transparent dark:bg-transparent",
            "text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "font-medium text-base",
            "outline-none relative z-0",
            className
          )}
          placeholder={props.placeholder || "Pega aquí el texto..."}
        />
        {isValid && (
          <div className="absolute right-4 bottom-4 z-20 flex gap-2">
            <button
              type="button"
              className="px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              onClick={() => onCreateShowdown && onCreateShowdown(parsed)}
            >
              Crear
            </button>
            <button
              type="button"
              className="px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg"
              onClick={() => setValue("")}
            >
              Borrar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ShowdownTextarea;