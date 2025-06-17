import React from 'react';
import { statLabels, teraOptions, teraSprites } from '@/data/pokemonConstants';
import { cn } from '@/lib/utils';
import { PokedexEntry, StatKey, NatureEntry } from '@/types/pokemonTypes';

interface DetailFieldProps {
  chosenAbility: string;
  setChosenAbility: (v: string) => void;
  abilityValues: string[];
  entry: PokedexEntry;
  chosenNature: string;
  setChosenNature: (v: string) => void;
  natureEntries: NatureEntry[];
  chosenItem: string;
  setChosenItem: (v: string) => void;
  itemsList: { id?: string; name: string; gen: number }[];
  chosenTera: string;
  handleTeraChange: (v: string) => void;
  teraAnimating: boolean;
}

const selectClass =
  'flex-1 w-full min-w-0 max-w-full rounded-md py-0.5 px-1 text-xs bg-white/90 dark:bg-gray-800/90 border border-gray-300 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 h-[32px]';
const selectWrapperClass = 'w-full flex items-center';

const labelClass = 'text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5';

const DetailField: React.FC<DetailFieldProps> = ({
  chosenAbility,
  setChosenAbility,
  abilityValues,
  entry,
  chosenNature,
  setChosenNature,
  natureEntries,
  chosenItem,
  setChosenItem,
  itemsList,
  chosenTera,
  handleTeraChange,
  teraAnimating,
}) => {
  return (
    <div className="bg-gray-100 rounded-xl p-4 flex flex-row gap-4 w-full">
      {/* Columna izquierda: Habilidad, Objeto */}
      <div className="flex flex-col gap-2 w-1/2">
        {/* Habilidad */}
        <div>
          <label className={labelClass}>Habilidad:</label>
          <select
            value={chosenAbility}
            onChange={e => setChosenAbility(e.target.value)}
            className={selectClass}
          >
            {abilityValues.map((ab) => (
              <option key={ab} value={ab}>{ab}{entry?.abilities?.H === ab ? ' (HO)' : ''}</option>
            ))}
          </select>
        </div>
        {/* Objeto */}
        <div>
          <label className={labelClass}>Objeto:</label>
          <select
            value={chosenItem}
            onChange={e => setChosenItem(e.target.value)}
            className={selectClass}
          >
            {itemsList.map((it, idx) => (
              <option key={`${it.id}-${idx}`} value={it.id}>{it.name}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Columna derecha: Naturaleza, Tera Type */}
      <div className="flex flex-col gap-2 w-1/2">
        {/* Naturaleza */}
        <div>
          <label className={labelClass}>Naturaleza:</label>
          <select
            value={chosenNature}
            onChange={e => setChosenNature(e.target.value)}
            className={selectClass}
          >
            {natureEntries.map((n, idx) => {
              const hasEffect = n.plus && n.minus && (n.plus !== n.minus);
              const natureLabel = n.name;
              let badgeContent = "";
              if (hasEffect) {
                const plusLabel = statLabels[n.plus as StatKey];
                const minusLabel = statLabels[n.minus as StatKey];
                badgeContent = `+${plusLabel} -${minusLabel}`;
              } else {
                badgeContent = "Neutral";
              }
              return (
                <option
                  key={`${n.name}-${idx}`}
                  value={n.name}
                >
                  {natureLabel} [{badgeContent}]
                </option>
              );
            })}
          </select>
        </div>
        {/* Teratipo */}
        <div className="relative">
          <label className={labelClass}>Tera Type:</label>
          <select
            value={chosenTera}
            onChange={e => handleTeraChange(e.target.value)}
            className={selectClass + ' pr-7'}
          >
            {teraOptions.map((opt, idx) => (
              <option key={`${opt.key}-${idx}`} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          {teraSprites[chosenTera] && (
            <img
              src={teraSprites[chosenTera]}
              alt={`Teratipo ${chosenTera}`}
              className={cn(
                "w-5 h-5 absolute right-1 top-1 object-contain transition-all duration-300 pointer-events-none",
                teraAnimating && "animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]",
                chosenTera === 'Stellar' && "animate-slow-pulse filter drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]"
              )}
              style={{zIndex:2}}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailField;
