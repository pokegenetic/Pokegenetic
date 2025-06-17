import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { statLabels, teraOptions, teraSprites } from '@/data/pokemonConstants';
import { cn } from '@/lib/utils';
const selectClass = 'flex-1 w-full min-w-0 max-w-full rounded-md py-0.5 px-1 text-xs bg-white/90 dark:bg-gray-800/90 border border-gray-300 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 h-[32px]';
const selectWrapperClass = 'w-full flex items-center';
const labelClass = 'text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5';
const DetailField = ({ chosenAbility, setChosenAbility, abilityValues, entry, chosenNature, setChosenNature, natureEntries, chosenItem, setChosenItem, itemsList, chosenTera, handleTeraChange, teraAnimating, }) => {
    return (_jsxs("div", { className: "bg-gray-100 rounded-xl p-4 flex flex-row gap-4 w-full", children: [_jsxs("div", { className: "flex flex-col gap-2 w-1/2", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Habilidad:" }), _jsx("select", { value: chosenAbility, onChange: e => setChosenAbility(e.target.value), className: selectClass, children: abilityValues.map((ab) => (_jsxs("option", { value: ab, children: [ab, entry?.abilities?.H === ab ? ' (HO)' : ''] }, ab))) })] }), _jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Objeto:" }), _jsx("select", { value: chosenItem, onChange: e => setChosenItem(e.target.value), className: selectClass, children: itemsList.map((it, idx) => (_jsx("option", { value: it.id, children: it.name }, `${it.id}-${idx}`))) })] })] }), _jsxs("div", { className: "flex flex-col gap-2 w-1/2", children: [_jsxs("div", { children: [_jsx("label", { className: labelClass, children: "Naturaleza:" }), _jsx("select", { value: chosenNature, onChange: e => setChosenNature(e.target.value), className: selectClass, children: natureEntries.map((n, idx) => {
                                    const hasEffect = n.plus && n.minus && (n.plus !== n.minus);
                                    const natureLabel = n.name;
                                    let badgeContent = "";
                                    if (hasEffect) {
                                        const plusLabel = statLabels[n.plus];
                                        const minusLabel = statLabels[n.minus];
                                        badgeContent = `+${plusLabel} -${minusLabel}`;
                                    }
                                    else {
                                        badgeContent = "Neutral";
                                    }
                                    return (_jsxs("option", { value: n.name, children: [natureLabel, " [", badgeContent, "]"] }, `${n.name}-${idx}`));
                                }) })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { className: labelClass, children: "Tera Type:" }), _jsx("select", { value: chosenTera, onChange: e => handleTeraChange(e.target.value), className: selectClass + ' pr-7', children: teraOptions.map((opt, idx) => (_jsx("option", { value: opt.key, children: opt.label }, `${opt.key}-${idx}`))) }), teraSprites[chosenTera] && (_jsx("img", { src: teraSprites[chosenTera], alt: `Teratipo ${chosenTera}`, className: cn("w-5 h-5 absolute right-1 top-1 object-contain transition-all duration-300 pointer-events-none", teraAnimating && "animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]", chosenTera === 'Stellar' && "animate-slow-pulse filter drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]"), style: { zIndex: 2 } }))] })] })] }));
};
export default DetailField;
