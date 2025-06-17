import React, { useState } from 'react';
import { StatKey } from '@/types/pokemonTypes';
import { cn } from '@/lib/utils';

interface StatInputGroupProps {
  label: string;
  statsKeys: StatKey[];
  statLabels: Record<StatKey, string>;
  inputValues: Record<StatKey, string>;
  setInputValues: (values: Record<StatKey, string>) => void;
  values: Record<StatKey, number>;
  setValues: (values: Record<StatKey, number>) => void;
  min: number;
  max: number;
  natureAffectedStats?: { boosted: StatKey | null; reduced: StatKey | null };
  isNatureEffectAnimating?: boolean;
  onBlur?: (stat: StatKey) => void;
  onChange?: (stat: StatKey, value: string) => void;
  type?: 'IV' | 'EV';
  locked?: boolean; // Nueva prop para bloquear la edición
}

const StatInputGroup: React.FC<StatInputGroupProps> = ({
  label,
  statsKeys,
  statLabels,
  inputValues,
  setInputValues,
  values,
  setValues,
  min,
  max,
  natureAffectedStats,
  isNatureEffectAnimating,
  onBlur,
  onChange,
  type = 'IV',
  locked = false, // Valor por defecto
}) => {
  const [showLockedMessage, setShowLockedMessage] = useState(false);

  const handleLockedClick = () => {
    if (locked) {
      setShowLockedMessage(true);
      setTimeout(() => setShowLockedMessage(false), 3000); // Ocultar después de 3 segundos
    }
  };

  return (
    <div className="w-full relative">
      <strong className="block text-sm font-semibold text-white mb-1 bg-gradient-to-r from-red-500 to-violet-700 py-1 px-2 rounded-lg text-center">{label}</strong>
      
      {/* Mensaje de IVs bloqueados */}
      {showLockedMessage && type === 'IV' && (
        <div className="absolute top-full left-0 right-0 z-10 bg-yellow-500 text-black text-xs p-2 rounded-lg shadow-lg mt-1 text-center">
          Los IVs de este Pokémon están predefinidos por legalidad y no pueden modificarse.
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 mt-2">
        {statsKeys.map((stat) => (
          <div key={stat} className="flex flex-col gap-2">
            <label className="text-[10px] font-medium text-center text-gray-700 dark:text-gray-300 mb-0.5">{statLabels[stat]}</label>
            <div className={type === 'EV' ? 'relative w-full flex' : ''}>
              <input
                key={`${type.toLowerCase()}-${stat}`}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={min}
                max={max}
                value={inputValues[stat]}
                disabled={locked} // Deshabilitar cuando esté bloqueado
                onClick={handleLockedClick} // Mostrar mensaje al hacer click si está bloqueado
                onChange={e => {
                  if (locked) {
                    handleLockedClick();
                    return; // No permitir cambios si está bloqueado
                  }
                  if (onChange) onChange(stat, e.target.value);
                  else setInputValues({ ...inputValues, [stat]: e.target.value });
                }}
                onFocus={e => {
                  if (locked) {
                    handleLockedClick();
                    return; // No permitir focus si está bloqueado
                  }
                  setInputValues({ ...inputValues, [stat]: '' });
                }}
                onBlur={() => {
                  if (locked) {
                    handleLockedClick();
                    return; // No permitir blur si está bloqueado
                  }
                  if (onBlur) onBlur(stat);
                  else {
                    const num = parseInt(inputValues[stat], 10);
                    if (isNaN(num) || inputValues[stat].trim() === '') {
                      setInputValues({ ...inputValues, [stat]: values[stat].toString() });
                    } else {
                      const clamped = Math.min(max, Math.max(min, Math.floor(num)));
                      setValues({ ...values, [stat]: clamped });
                      setInputValues({ ...inputValues, [stat]: clamped.toString() });
                    }
                  }
                }}
                style={{ fontSize: 12 }}
                className={cn(
                  'w-full text-center rounded border p-1 border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-normal focus:outline-none focus:ring-2 focus:ring-blue-400',
                  locked && 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700', // Estilos para campos bloqueados
                  type === 'EV' && natureAffectedStats?.boosted === stat ? 'bg-green-400 dark:bg-green-600' : '',
                  type === 'EV' && natureAffectedStats?.reduced === stat ? 'bg-red-400 dark:bg-red-600' : '',
                  type === 'EV' && isNatureEffectAnimating && natureAffectedStats?.boosted === stat && 'animate-ping',
                  type === 'EV' && isNatureEffectAnimating && natureAffectedStats?.reduced === stat && 'animate-ping'
                )}
              />
              {/* Animaciones de naturaleza para EVs */}
              {type === 'EV' && isNatureEffectAnimating && natureAffectedStats?.boosted === stat && (
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-green-900 dark:text-green-100 pointer-events-none">+</span>
              )}
              {type === 'EV' && isNatureEffectAnimating && natureAffectedStats?.reduced === stat && (
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-red-900 dark:text-red-100 pointer-events-none">-</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatInputGroup;
