import React from 'react';
import { Moves } from '@/data/sv/moves';
import { typeColors } from '@/data/pokemonConstants';
import { cn } from '@/lib/utils';

interface MoveSelectorSlotProps {
  value: string;
  index: number;
  availableMoves: string[];
  onChange: (idx: number, value: string) => void;
  movesSeleccionados?: string[]; // Nueva prop opcional para bloquear repetidos
}

const MoveSelectorSlot: React.FC<MoveSelectorSlotProps> = ({ value, index, availableMoves, onChange, movesSeleccionados = [] }) => {
  const mvData = Moves[value] as any | undefined;
  const moveTypeDisplay = mvData?.type;
  const typeClassKey = moveTypeDisplay?.toLowerCase() || '';
  const bgClass = typeColors[typeClassKey] || 'bg-gray-600 text-white';

  return (
    <div className="flex flex-row items-center gap-1 w-full py-0.5">
      <div className="flex-grow">
        <select
          value={value}
          onChange={e => onChange(index, e.target.value)}
          className="w-full rounded-md py-0.5 px-1 text-xs bg-white/90 dark:bg-gray-800/90 border border-gray-300 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="-" disabled={value !== '-'}>- (Ninguno) -</option>
          {availableMoves.map((mId) => {
            const optionMoveData = Moves[mId] as any | undefined;
            const optionMoveName = optionMoveData?.name || mId;
            // Bloquear si ya está seleccionado en otra casilla
            const isSelectedElsewhere = movesSeleccionados.includes(mId) && value !== mId;
            return <option key={mId} value={mId} disabled={isSelectedElsewhere}>{optionMoveName}</option>;
          })}
        </select>
      </div>
      {moveTypeDisplay && value !== '-' && (
        <span className={cn("inline-flex items-center justify-center rounded-full min-w-[35px] w-[35px] h-[16px] text-[8px] font-semibold", bgClass)}>{moveTypeDisplay}</span>
      )}
    </div>
  );
};

export default MoveSelectorSlot;
