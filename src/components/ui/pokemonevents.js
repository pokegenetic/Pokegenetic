import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { eventPokemon } from '@/data/sv/eventPokemon.js';
import { motion } from 'framer-motion';
import { getNatureEffectShortEn, getNatureEffectText } from '@/lib/natureEffects';
import { Moves } from '@/data/sv/moves';
import { teraSprites, typeColors } from '@/data/pokemonConstants';
import { preciosPokemon } from './preciospokemon';
import { addPokemonToTeam } from '@/lib/equipoStorage';
import { PlusSquare, DollarSign } from 'lucide-react';
import { Pokedex } from '@/data/sv/pokedex_module';
import { getGenderForSpecies } from '@/lib/pokedexHelper';
import { formatNameForPokedexLookup } from './equipoUtils'; // Import from equipoUtils
import { getShowdownCryUrl } from '@/lib/getShowdownCryUrl'; // Importa la función para obtener el cry
import { playSoundEffect } from '@/lib/soundEffects';
function capitalizeFirst(str) {
    if (!str)
        return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
// Helper para obtener el sprite de Pokemondb
function getSprite(p, shiny) {
    if (!p || !p.species)
        return null;
    let name = p.species.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (name === "zarude")
        name = "zarude";
    if (name === "meloetta")
        name = "meloetta";
    if (name === "rayquaza")
        name = "rayquaza";
    if (name === "mew")
        name = "mew";
    if (name === "walkingwake")
        name = "walking-wake";
    if (name === "ironleaves")
        name = "iron-leaves";
    // Add specific cases for missing sprites in getSprite function
    if (name === "ferromole")
        name = "iron-boulder";
    if (name === "ferrotesta")
        name = "iron-crown";
    if (name === "ragingbolt")
        name = "raging-bolt";
    if (name === "ironboulder")
        name = "iron-boulder";
    if (name === "ironcrown")
        name = "iron-crown";
    const shinyStr = shiny ? "shiny" : "normal";
    return `https://img.pokemondb.net/sprites/home/${shinyStr}/${name}.png`;
}
// Helper para Tera Sprite
const getTeraSpriteKey = (tera) => {
    if (!tera)
        return '';
    const key = Object.keys(teraSprites).find(k => k.toLowerCase() === tera.toLowerCase());
    return key || '';
};
export default function Laboratorio() {
    const { selectedGame } = useGame();
    const navigate = useNavigate();
    const [expandedIndex, setExpandedIndex] = useState(null);
    const cryAudioRef = useRef(null); // Ref para el audio
    useEffect(() => {
        if (!selectedGame)
            navigate('/');
    }, [selectedGame, navigate]);
    // Handler para expandir tarjeta y reproducir cry
    const handleExpand = (idx, species) => {
        const isExpanding = idx !== expandedIndex;
        setExpandedIndex(isExpanding ? idx : null);
        if (isExpanding) {
            // Solo reproducir el cry al expandir
            const cryUrl = getShowdownCryUrl(species);
            if (cryUrl) {
                if (cryAudioRef.current) {
                    cryAudioRef.current.pause();
                    cryAudioRef.current.currentTime = 0;
                }
                const audio = new window.Audio(cryUrl);
                cryAudioRef.current = audio;
                audio.volume = 0.1; // volumen bajo
                audio.addEventListener('loadedmetadata', () => {
                    if (audio.duration && !isNaN(audio.duration)) {
                        audio.currentTime = audio.duration * 0.2; // reproducir desde el 20%
                    }
                    audio.play();
                });
                setTimeout(() => {
                    if (audio.paused)
                        audio.play();
                }, 500);
            }
        }
        else {
            // Solo reproducir el efecto de sonido al contraer
            playSoundEffect('notification', 0.1);
        }
    };
    return (_jsxs("div", { className: "flex flex-col items-center px-4 pt-8 text-center min-h-screen bg-gradient-to-b from-transparent via-fuchsia-50 to-purple-50", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "Pok\u00E9mon de Eventos" }), _jsx("p", { className: "text-sm text-gray-600 max-w-md mb-6", children: "Estos Pok\u00E9mon se obtienen mediante intercambios especiales y son 100% compatibles con Pok\u00E9mon HOME. \u00A1Explora sus detalles \u00FAnicos y agr\u00E9galos a tu colecci\u00F3n!" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto mt-8", children: eventPokemon.map((p, idx) => {
                    // Lookup Pokedex entry for legendary detection and gender
                    const pokedexEntry = Pokedex[formatNameForPokedexLookup(p.species)];
                    // Calculate price (same logic as equipo.tsx)
                    let price = preciosPokemon.normal;
                    if (pokedexEntry && pokedexEntry.tags?.some(tag => ["Legendary", "Mythical", "Sub-Legendary", "Restricted Legendary"].includes(tag))) {
                        price = preciosPokemon.legendarioSingular;
                    }
                    if (p.isShiny)
                        price += preciosPokemon.incrementoShiny;
                    // Normalize gender to GenderName
                    let gender = 'N';
                    if (typeof p.gender === 'string' && ['M', 'F', 'N'].includes(p.gender)) {
                        gender = p.gender;
                    }
                    else {
                        const g = getGenderForSpecies(p.species);
                        if (g)
                            gender = g;
                    }
                    // Handler for adding to team (ensures ParsedPokemon structure)
                    const handleAddToTeam = (e) => {
                        e.stopPropagation();
                        addPokemonToTeam({
                            ...p,
                            gender,
                        });
                        alert(`${p.species} añadido al equipo!`);
                    };
                    const spriteUrl = getSprite(p, p.isShiny);
                    const teraTypeSpriteKey = getTeraSpriteKey(p.teraType || "");
                    const teraTypeSprite = teraTypeSpriteKey ? teraSprites[teraTypeSpriteKey] : undefined;
                    return (_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: idx * 0.08 }, whileHover: { scale: 1.03, boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)" }, className: "relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row gap-4 items-center border border-gray-200/70 dark:border-gray-700/60 hover:shadow-2xl transition-all min-h-[220px]", children: [_jsxs("div", { onClick: () => handleExpand(idx, p.species), className: "cursor-pointer w-full", children: [_jsxs("div", { className: "relative flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 mx-auto", children: [_jsx("img", { src: spriteUrl, alt: p.name, className: p.isShiny ? "w-full h-full object-contain drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" : "w-full h-full object-contain", onError: e => (e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png') }), p.isShiny && (_jsx("span", { className: "absolute top-1 right-1 z-10 text-yellow-400 text-2xl animate-bounce pointer-events-none select-none drop-shadow-lg", children: "\u2728" }))] }), _jsxs("div", { className: "flex-1 flex flex-col items-start gap-1 min-w-0 w-full", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("h2", { className: "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate", children: p.species === "ferromole" ? "Iron Boulder" : p.species === "ferrotesta" ? "Iron Crown" : capitalizeFirst(p.species) }), _jsxs("span", { className: "badge bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded", children: ["Lvl ", p.level] }), p.gender && p.gender !== "N" && (_jsx("span", { className: p.gender === "M" ? "bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold", children: p.gender })), p.event && (_jsx("span", { className: "ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 text-gray-900 text-[10px] font-semibold shadow-sm", children: p.event })), _jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-green-400 to-green-600 border border-green-500 text-white text-xs font-semibold shadow min-w-[60px] h-6 ml-1", children: [_jsx(DollarSign, { size: 13, className: "mr-1 opacity-80" }), _jsxs("span", { children: ["$", price.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] })] }), p.eventDetails && (_jsxs("div", { className: "mt-1 mb-1 text-xs text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2 w-full shadow-sm", children: [_jsx("div", { className: "font-semibold text-yellow-800 dark:text-yellow-200 mb-0.5", children: p.eventDetails.title }), _jsx("div", { className: "mb-0.5", children: p.eventDetails.description })] }))] })] }), expandedIndex === idx && (_jsxs("div", { className: "mt-4 w-full", children: [_jsx("div", { className: "flex flex-wrap gap-1 items-center mt-1", children: p.teraType && teraTypeSprite && (_jsxs("span", { className: `inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-normal shadow-sm transition-colors border-gray-300 dark:border-gray-600 ${typeColors[capitalizeFirst(p.teraType)] || 'bg-gray-400 text-white'} text-white`, children: [_jsx("img", { src: teraTypeSprite, alt: `Teratipo ${p.teraType}`, className: "w-4 h-4 object-contain mr-1" }), capitalizeFirst(p.teraType)] })) }), _jsxs("p", { className: "text-sm text-gray-700 dark:text-gray-300 truncate mt-0.5 flex items-center", children: [_jsx("span", { className: "font-semibold", children: "Habilidad:" }), _jsx("span", { className: "ml-1", children: capitalizeFirst(p.ability) })] }), _jsxs("div", { className: "flex items-center mt-0.5", children: [_jsxs("p", { className: "text-sm text-gray-700 dark:text-gray-300 truncate", children: [_jsx("span", { className: "font-semibold", children: "Naturaleza:" }), _jsx("span", { className: "ml-1", children: capitalizeFirst(p.nature) })] }), _jsx("span", { className: "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-normal shadow-sm transition-colors ml-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-300 bg-transparent", title: getNatureEffectText(p.nature), children: getNatureEffectShortEn(p.nature) })] }), p.item && (_jsxs("p", { className: "text-sm text-gray-700 dark:text-gray-300 mt-0.5 truncate flex items-center", children: [_jsx("span", { className: "font-semibold", children: "Objeto:" }), _jsx("span", { className: "ml-1", children: capitalizeFirst(p.item) })] })), _jsxs("div", { className: "mt-2 w-full", children: [_jsx("h3", { className: "text-xs font-semibold text-gray-800 dark:text-gray-100 mb-1", children: "Movimientos" }), _jsx("ul", { className: "flex flex-wrap gap-2", children: (p.moves || []).map((move, i) => {
                                                    const cleanedMoveName = move.startsWith('- ') ? move.substring(2) : move;
                                                    let moveKey = cleanedMoveName.toLowerCase().replace(/[^a-z0-9]/g, '');
                                                    let moveType = Moves[moveKey]?.type || Moves[Object.keys(Moves).find(k => Moves[k].name.toLowerCase() === cleanedMoveName.toLowerCase()) || '']?.type;
                                                    return (_jsxs("li", { className: "flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md", children: [_jsx("span", { className: "truncate", children: cleanedMoveName }), moveType && (_jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] shadow-sm border border-gray-300 dark:border-gray-600 ml-1 text-white font-normal ${typeColors[moveType] || 'bg-gray-400'}`, children: moveType }))] }, i));
                                                }) })] }), _jsxs("div", { className: "flex flex-row gap-4 mt-2 w-full", children: [_jsxs("div", { className: "w-1/2", children: [_jsx("strong", { className: "block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1 bg-zinc-100 dark:bg-zinc-800 py-0.5 px-2 rounded-lg text-center", children: "IVs" }), _jsx("div", { className: "grid grid-cols-3 gap-1", children: ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map(stat => (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("span", { className: "text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5", children: stat.toUpperCase() }), _jsx("span", { className: "text-xs text-gray-600 dark:text-gray-400 font-semibold", children: (p.IVs && typeof p.IVs[stat] === 'number') ? p.IVs[stat] : 31 })] }, stat))) })] }), _jsxs("div", { className: "w-1/2", children: [_jsx("strong", { className: "block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1 bg-zinc-100 dark:bg-zinc-800 py-0.5 px-2 rounded-lg text-center", children: "EVs" }), _jsx("div", { className: "grid grid-cols-3 gap-1", children: ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map(stat => (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("span", { className: "text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5", children: stat.toUpperCase() }), _jsx("span", { className: "text-xs text-gray-600 dark:text-gray-400 font-semibold", children: (p.EVs && typeof p.EVs[stat] === 'number') ? p.EVs[stat] : 0 })] }, stat))) })] })] })] })), _jsxs("button", { onClick: handleAddToTeam, className: "mt-2 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 border border-blue-500 text-white text-xs font-semibold shadow hover:from-blue-500 hover:to-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400", title: "A\u00F1adir este Pok\u00E9mon al equipo", children: [_jsx(PlusSquare, { size: 15, className: "mr-1 opacity-80" }), "A\u00F1adir al equipo"] })] }, p.name + idx));
                }) })] }));
}
