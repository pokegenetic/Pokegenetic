import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
const NatureSelect = ({ value, onChange, natureEntries, statLabels, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);
    const selectedNature = natureEntries.find(n => n.name === value) || natureEntries[0];
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleSelect = (nature) => {
        onChange(nature);
        setIsOpen(false);
    };
    // Render nature badge based on its properties
    const renderNatureBadge = (nature) => {
        const hasEffect = nature.plus && nature.minus && (nature.plus !== nature.minus);
        if (hasEffect) {
            const plusLabel = statLabels[nature.plus];
            const minusLabel = statLabels[nature.minus];
            return (_jsxs("span", { className: "inline-flex items-center justify-center rounded-full bg-orange-500 text-white min-w-[46px] h-[16px] text-[7px] font-bold px-1.5 shadow-sm ml-1.5", title: `${nature.name} incrementa ${plusLabel} y reduce ${minusLabel}`, children: ["+", plusLabel, " -", minusLabel] }));
        }
        else {
            return (_jsx("span", { className: "inline-flex items-center justify-center rounded-full bg-gray-400 text-white min-w-[46px] h-[16px] text-[7px] font-bold px-1.5 shadow-sm ml-1.5", title: `${nature.name} no afecta las estadísticas`, children: "Neutral" }));
        }
    };
    return (_jsxs("div", { className: "relative w-full", ref: selectRef, children: [_jsxs("button", { type: "button", className: cn("w-full flex items-center justify-between px-2 py-0.5 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-xs font-semibold text-left", className), onClick: () => setIsOpen(!isOpen), children: [_jsxs("div", { className: "flex items-center truncate", children: [_jsx("span", { children: selectedNature?.name }), renderNatureBadge(selectedNature)] }), _jsx("svg", { className: "w-4 h-4 ml-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), isOpen && (_jsx("div", { className: "absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto", children: natureEntries.map((nature, idx) => (_jsxs("div", { className: cn("flex items-center px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700", nature.name === value ? "bg-blue-50 dark:bg-blue-900/30" : ""), onClick: () => handleSelect(nature.name), children: [_jsx("span", { className: "mr-1", children: nature.name }), renderNatureBadge(nature)] }, `${nature.name}-${idx}`))) }))] }));
};
export default NatureSelect;
