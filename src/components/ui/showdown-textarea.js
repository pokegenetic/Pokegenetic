import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ClipboardPaste } from "lucide-react"; // Import paste icon
import { parseShowdownTeam } from "@/lib/parseShowdown";
// Gooey SVG filter (similar to search-bar)
const GooeyFilter = () => (_jsx("svg", { style: { position: "absolute", width: 0, height: 0 }, "aria-hidden": "true", children: _jsx("defs", { children: _jsxs("filter", { id: "gooey-effect-textarea", children: [" ", _jsx("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "7", result: "blur" }), _jsx("feColorMatrix", { in: "blur", type: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8", result: "goo" }), _jsx("feComposite", { in: "SourceGraphic", in2: "goo", operator: "atop" })] }) }) }));
// Focus Particles hook (adapted from search-bar)
const useFocusParticles = (isActive) => {
    return useMemo(() => Array.from({ length: isActive ? 18 : 0 }).map((_, i) => (_jsx(motion.div, { initial: { scale: 0 }, animate: {
            x: [0, (Math.random() - 0.5) * 40],
            y: [0, (Math.random() - 0.5) * 40],
            scale: [0, Math.random() * 0.8 + 0.4],
            opacity: [0, 0.8, 0],
        }, transition: {
            duration: Math.random() * 1.5 + 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
        }, className: "absolute w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400", style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: "blur(2px)",
        } }, `focus-particle-${i}`))), [isActive]);
};
// Click Particles component (adapted from search-bar)
const ClickParticles = ({ count, mousePosition }) => {
    return (_jsx(_Fragment, { children: Array.from({ length: count }).map((_, i) => (_jsx(motion.div, { initial: { x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }, animate: {
                x: mousePosition.x + (Math.random() - 0.5) * 160,
                y: mousePosition.y + (Math.random() - 0.5) * 160,
                scale: Math.random() * 0.8 + 0.2,
                opacity: [1, 0],
            }, transition: { duration: Math.random() * 0.8 + 0.5, ease: "easeOut" }, className: "absolute w-3 h-3 rounded-full", style: {
                background: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 200 + 55)}, ${Math.floor(Math.random() * 255)}, 0.8)`,
                boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
            } }, `click-particle-${i}`))) }));
};
const ShowdownTextarea = ({ className, onCreateShowdown, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [value, setValue] = useState("");
    const textareaRef = useRef(null);
    const wrapperRef = useRef(null);
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
        if (typeof window === "undefined")
            return false;
        const ua = navigator.userAgent.toLowerCase();
        const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium");
        const isChromeOniOS = ua.includes("crios");
        return isSafari || isChromeOniOS;
    }, []);
    const handleMouseMove = (e) => {
        if (!isFocused || !wrapperRef.current)
            return;
        const rect = wrapperRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };
    const handleClick = (e) => {
        if (!wrapperRef.current)
            return;
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
    return (_jsxs("div", { className: "relative w-full max-w-md mx-auto my-2", children: [_jsx(GooeyFilter, {}), _jsxs(motion.div, { ref: wrapperRef, onMouseMove: handleMouseMove, onClick: handleClick, className: cn("relative w-full p-0.5 border overflow-hidden backdrop-blur-sm flex items-start", isFocused
                    ? "border-transparent"
                    : "border-gray-300 dark:border-gray-700 bg-white/30 dark:bg-gray-800/50"), initial: { borderRadius: "9999px" }, animate: {
                    boxShadow: isClicked
                        ? "0 0 30px rgba(139, 92, 246, 0.4), inset 0 0 10px rgba(236, 72, 153, 0.6)"
                        : isFocused
                            ? "0 10px 25px rgba(0, 0, 0, 0.15)"
                            : "none",
                    borderRadius: isFocused || value.trim().length > 0 ? "1rem" : "9999px", // Redondo solo si no hay foco y está vacío
                }, transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    borderRadius: { type: "tween", duration: 0.01 }
                }, children: [isFocused && (_jsx(motion.div, { className: "absolute inset-0 -z-20 rounded-[calc(1rem-2px)]", initial: { opacity: 0 }, animate: {
                            opacity: 0.2,
                            background: [
                                "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                                "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
                                "linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)",
                                "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                            ],
                        }, transition: { duration: 15, repeat: Infinity, ease: "linear" } })), _jsx("div", { className: "absolute inset-0 overflow-hidden rounded-[calc(1rem-2px)] -z-10", style: { filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect-textarea)" }, children: focusParticles }), isClicked && _jsx(ClickParticles, { count: 14, mousePosition: mousePosition }), _jsx("div", { className: "pl-4 pr-2 py-3 self-start", children: _jsx(ClipboardPaste, { size: 20, strokeWidth: isFocused ? 2.5 : 2, className: cn("transition-all duration-300", isFocused
                                ? "text-purple-600"
                                : "text-gray-500 dark:text-gray-300") }) }), _jsx("textarea", { ...props, ref: textareaRef, value: value, onChange: e => setValue(e.target.value), onFocus: (e) => {
                            setIsFocused(true);
                            props.onFocus && props.onFocus(e);
                        }, onBlur: (e) => {
                            setIsFocused(false);
                            props.onBlur && props.onBlur(e);
                        }, style: {
                            resize: 'none',
                            minHeight: '68px',
                            maxHeight: '400px',
                            overflowY: textareaRef.current && textareaRef.current.scrollHeight > 400 ? 'auto' : 'hidden',
                            ...props.style
                        }, className: cn("flex-grow w-full pl-1 pr-3 py-3", "bg-transparent dark:bg-transparent", "text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500", "font-medium text-base", "outline-none relative z-0", className), placeholder: props.placeholder || "Pega aquí el texto..." }), isValid && (_jsxs("div", { className: "absolute right-4 bottom-4 z-20 flex gap-2", children: [_jsx("button", { type: "button", className: "px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg", onClick: () => onCreateShowdown && onCreateShowdown(parsed), children: "Crear" }), _jsx("button", { type: "button", className: "px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg", onClick: () => setValue(""), children: "Borrar" })] }))] })] }));
};
export default ShowdownTextarea;
