import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Moves } from '@/data/sv/moves';
import { typeColors } from '@/data/pokemonConstants';
import { cn } from '@/lib/utils';
const MoveSelectorSlot = ({ value, index, availableMoves, onChange, movesSeleccionados = [] }) => {
    const mvData = Moves[value];
    const moveTypeDisplay = mvData?.type;
    const typeClassKey = moveTypeDisplay?.toLowerCase() || '';
    const bgClass = typeColors[typeClassKey] || 'bg-gray-600 text-white';
    return (_jsxs("div", { className: "flex flex-row items-center gap-1 w-full py-0.5", children: [_jsx("div", { className: "flex-grow", children: _jsxs("select", { value: value, onChange: e => onChange(index, e.target.value), className: "w-full rounded-md py-0.5 px-1 text-xs bg-white/90 dark:bg-gray-800/90 border border-gray-300 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400", children: [_jsx("option", { value: "-", disabled: value !== '-', children: "- (Ninguno) -" }), availableMoves.map((mId) => {
                            const optionMoveData = Moves[mId];
                            const optionMoveName = optionMoveData?.name || mId;
                            // Bloquear si ya está seleccionado en otra casilla
                            const isSelectedElsewhere = movesSeleccionados.includes(mId) && value !== mId;
                            return _jsx("option", { value: mId, disabled: isSelectedElsewhere, children: optionMoveName }, mId);
                        })] }) }), moveTypeDisplay && value !== '-' && (_jsx("span", { className: cn("inline-flex items-center justify-center rounded-full min-w-[35px] w-[35px] h-[16px] text-[8px] font-semibold", bgClass), children: moveTypeDisplay }))] }));
};
export default MoveSelectorSlot;
