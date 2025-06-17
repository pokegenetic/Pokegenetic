import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { teraSprites, typeColors, teraOptions } from '@/data/pokemonConstants';
import '@/components/ui/bounce-animation.css';
const PokemonDisplayCard = ({ entry, currentPokemonName, isShiny, chosenTera, teraAnimating, getSprite, spriteClassName, // Destructure the new prop
itemSpriteUrl, // Destructure the new prop
 }) => {
    // Helper: map English Tera type keys to the correct teraSprites key
    const getTeraSpriteKey = (tera) => {
        if (!tera)
            return '';
        // Try direct match (case-insensitive)
        const directKey = Object.keys(teraSprites).find(k => k.toLowerCase() === tera.toLowerCase());
        if (directKey)
            return directKey;
        // Try teraOptions English key
        const option = teraOptions.find(opt => opt.key.toLowerCase() === tera.toLowerCase());
        if (option && teraSprites[option.key])
            return option.key;
        // Try teraOptions Spanish label
        const optionByLabel = teraOptions.find(opt => opt.label.toLowerCase() === tera.toLowerCase());
        if (optionByLabel && teraSprites[optionByLabel.key])
            return optionByLabel.key;
        // Try mapping 'Stellar' <-> 'Astral' (for Showdown/Spanish mismatch)
        if (tera.toLowerCase() === 'stellar' && teraSprites['Astral'])
            return 'Astral';
        if (tera.toLowerCase() === 'astral' && teraSprites['Stellar'])
            return 'Stellar';
        return '';
    };
    return (_jsxs("div", { className: "flex flex-row items-center gap-3 sm:gap-6 w-full mt-6", children: [_jsxs("div", { className: "relative flex-shrink-0", children: [_jsx("img", { src: getSprite(currentPokemonName, isShiny) || '', alt: entry?.name || currentPokemonName, className: cn("w-40 h-40 sm:w-44 sm:h-44 object-contain drop-shadow-lg", spriteClassName // Apply custom sprite class if provided
                        ) }), isShiny && (_jsx("span", { className: "absolute top-0 right-0 z-10 text-yellow-400 text-xl animate-bounce pointer-events-none select-none drop-shadow-lg", children: "\u2728" }))] }), _jsxs("div", { className: "flex flex-col flex-1 items-start justify-center gap-1 w-full", children: [_jsxs("div", { className: "flex items-center w-full", children: [_jsx("span", { className: "text-xl font-bold text-gray-900 dark:text-white leading-tight drop-shadow-sm text-left", children: entry.name }), _jsxs("span", { className: "inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-colors ml-2", children: ["#", entry.num] })] }), _jsxs("div", { className: "flex flex-wrap gap-1 w-full justify-start items-center mt-1", children: [entry.types && entry.types.map((type) => (_jsx("span", { className: cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium shadow-sm transition-colors', typeColors[type.toLowerCase()] || 'bg-gray-400 text-white', 'border-gray-300 dark:border-gray-600'), children: type }, type))), chosenTera && teraSprites[getTeraSpriteKey(chosenTera)] && (_jsx("span", { className: "inline-flex items-center ml-1", children: _jsx("img", { src: teraSprites[getTeraSpriteKey(chosenTera)], alt: chosenTera, className: "w-5 h-5 drop-shadow", style: { filter: 'drop-shadow(0 0 4px #fff)' } }) }))] }), itemSpriteUrl && (_jsx("div", { className: "w-full flex items-start mt-1", children: _jsx("img", { src: itemSpriteUrl, alt: "Item", className: "w-8 h-8 drop-shadow", style: { animation: 'none' } }) }))] })] }));
};
export default PokemonDisplayCard;
