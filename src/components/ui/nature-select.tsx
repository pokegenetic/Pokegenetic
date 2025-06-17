import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type StatKey = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

interface NatureSelectProps {
  value: string;
  onChange: (value: string) => void;
  natureEntries: Array<{name: string, plus?: string, minus?: string}>;
  statLabels: Record<StatKey, string>;
  className?: string;
}

const NatureSelect: React.FC<NatureSelectProps> = ({ 
  value, 
  onChange, 
  natureEntries, 
  statLabels,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedNature = natureEntries.find(n => n.name === value) || natureEntries[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (nature: string) => {
    onChange(nature);
    setIsOpen(false);
  };

  // Render nature badge based on its properties
  const renderNatureBadge = (nature: {name: string, plus?: string, minus?: string}) => {
    const hasEffect = nature.plus && nature.minus && (nature.plus !== nature.minus);
    
    if (hasEffect) {
      const plusLabel = statLabels[nature.plus as StatKey];
      const minusLabel = statLabels[nature.minus as StatKey];
      
      return (
        <span 
          className="inline-flex items-center justify-center rounded-full bg-orange-500 text-white min-w-[46px] h-[16px] text-[7px] font-bold px-1.5 shadow-sm ml-1.5"
          title={`${nature.name} incrementa ${plusLabel} y reduce ${minusLabel}`}
        >
          +{plusLabel} -{minusLabel}
        </span>
      );
    } else {
      return (
        <span 
          className="inline-flex items-center justify-center rounded-full bg-gray-400 text-white min-w-[46px] h-[16px] text-[7px] font-bold px-1.5 shadow-sm ml-1.5"
          title={`${nature.name} no afecta las estadísticas`}
        >
          Neutral
        </span>
      );
    }
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      {/* Custom select button */}
      <button
        type="button"
        className={cn(
          "w-full flex items-center justify-between px-2 py-0.5 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-xs font-semibold text-left",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center truncate">
          <span>{selectedNature?.name}</span>
          {renderNatureBadge(selectedNature)}
        </div>
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {natureEntries.map((nature, idx) => (
            <div
              key={`${nature.name}-${idx}`}
              className={cn(
                "flex items-center px-2 py-1.5 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                nature.name === value ? "bg-blue-50 dark:bg-blue-900/30" : ""
              )}
              onClick={() => handleSelect(nature.name)}
            >
              <span className="mr-1">{nature.name}</span>
              {renderNatureBadge(nature)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NatureSelect;
