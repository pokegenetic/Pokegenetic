import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { eventPokemon } from '@/data/sv/eventPokemon.js';
import { motion } from 'framer-motion';
import { teraSprites } from '@/data/pokemonConstants';
import { items_sv } from '@/data/sv/items_sv';
import { cn } from '@/lib/utils';
import './shiny-pulse.css';
import './prismatic.css';
import MagnetizeButtonEdicionTarjeta from './magnetize-button-ediciontarjeta'; // Added import
import { DollarSign } from 'lucide-react';
import { preciosPokemon, descuentos } from './preciospokemon'; // Importar precios y descuentos
import packSetup from './packsetup'; // Import the pack setup configuration
import { parseShowdownText } from '@/lib/parseShowdown';
import { getPokemonTeam, setPokemonTeam, addHomePackToTeam } from '@/lib/equipoStorage';
import paldeaFullImg from '@/img/packhome/Paldeafull.png';
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
    const paradoxPokemon = [
        "great-tusk", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing", "sandy-shocks",
        "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns"
    ];
    let name = p.species.toLowerCase();
    if (paradoxPokemon.includes(name)) {
        // Para paradox, conservar los guiones
        return `https://img.pokemondb.net/sprites/scarlet-violet/normal/${name}.png`;
    }
    // Para el resto, eliminar caracteres especiales
    name = name.replace(/[^a-z0-9]/g, "");
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
// Helper para obtener el sprite del objeto
function getItemSprite(itemName) {
    if (!itemName || itemName.toLowerCase() === 'none') {
        // Always show generic Pokéball sprite if no item is set
        return 'https://serebii.net/itemdex/sprites/pokeball.png';
    }
    const itemData = items_sv.find(item => item.name.toLowerCase() === itemName.toLowerCase());
    return itemData ? itemData.sprite : 'https://serebii.net/itemdex/sprites/pokeball.png'; // Fallback si no se encuentra
}
// Helper para Tera Sprite
const getTeraSpriteKey = (tera) => {
    if (!tera)
        return '';
    const key = Object.keys(teraSprites).find(k => k.toLowerCase() === tera.toLowerCase());
    return key || '';
};
// Helper function para calcular el precio de un Pokémon
function calculatePokemonPrice({ isLegendary, isShiny }) {
    let price = preciosPokemon.normal;
    if (isLegendary) {
        price += preciosPokemon.legendarioSingular;
    }
    if (isShiny) {
        price += preciosPokemon.incrementoShiny;
    }
    return price;
}
// Helper function para aplicar descuentos
function applyDiscounts(totalPrice, teamSize) {
    if (teamSize >= descuentos.porEquipoGrande.cantidadMinimaPokemon) {
        const discount = (totalPrice * descuentos.porEquipoGrande.porcentajeDescuento) / 100;
        totalPrice -= discount;
    }
    return totalPrice;
}
// Helper para obtener la URL del cry de Showdown
function getShowdownCryUrl(species) {
    if (!species)
        return '';
    let name = species.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Paradox sin guion
    const paradox = [
        'greattusk', 'screamtail', 'brutebonnet', 'fluttermane', 'slitherwing', 'sandyshocks',
        'irontreads', 'ironbundle', 'ironhands', 'ironjugulis', 'ironmoth', 'ironthorns',
        'roaringmoon', 'ironvaliant', 'walkingwake', 'ironleaves', 'gougingfire', 'ragingbolt', 'ironboulder', 'ironcrown', 'pecharunt'
    ];
    if (paradox.includes(name)) {
        name = name.replace(/-/g, '');
    }
    // Nidoran
    if (species.toLowerCase() === 'nidoran♀' || species.toLowerCase() === 'nidoran-f')
        return 'https://play.pokemonshowdown.com/audio/cries/nidoranf.mp3';
    if (species.toLowerCase() === 'nidoran♂' || species.toLowerCase() === 'nidoran-m')
        return 'https://play.pokemonshowdown.com/audio/cries/nidoranm.mp3';
    // Oricorio formas
    if (species.toLowerCase().startsWith('oricorio')) {
        if (species.toLowerCase().includes('pau'))
            return 'https://play.pokemonshowdown.com/audio/cries/oricorio-pau.mp3';
        if (species.toLowerCase().includes('pom'))
            return 'https://play.pokemonshowdown.com/audio/cries/oricorio-pompom.mp3';
        if (species.toLowerCase().includes('sensu'))
            return 'https://play.pokemonshowdown.com/audio/cries/oricorio-sensu.mp3';
        return 'https://play.pokemonshowdown.com/audio/cries/oricorio.mp3';
    }
    // Kommo-o
    if (name === 'kommoo')
        return 'https://play.pokemonshowdown.com/audio/cries/kommoo.mp3';
    // Slowpoke Galar y similares
    if (species.toLowerCase().includes('galar')) {
        name = species.toLowerCase().replace(/ /g, '-');
        return `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`;
    }
    // Default
    return `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`;
}
export default function Paquetes() {
    const { selectedGame, addPokemonToTeam } = useGame(); // Import addPokemonToTeam
    const navigate = useNavigate();
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [hasInteracted, setHasInteracted] = useState(false); // New state to track interaction
    const cryAudioRef = useRef(null); // Ref for cry playback
    const [activeTab, setActiveTab] = useState('intercambio');
    const [isShiny, setIsShiny] = useState(false);
    const [trainerName, setTrainerName] = useState('');
    useEffect(() => {
        if (!selectedGame) {
            console.warn('No se ha seleccionado un juego. Redirigiendo a la página principal.');
            navigate('/');
        }
    }, [selectedGame, navigate]);
    useEffect(() => {
        if (cryAudioRef.current) {
            cryAudioRef.current.pause();
            cryAudioRef.current.currentTime = 0;
            cryAudioRef.current = null;
        }
        if (expandedIndex === null || !eventPokemon[expandedIndex]) {
            return;
        }
        const currentPokemon = eventPokemon[expandedIndex];
        const cryUrl = getShowdownCryUrl(currentPokemon.species);
        if (!cryUrl)
            return;
        const audio = new Audio(cryUrl);
        audio.volume = 0.3;
        cryAudioRef.current = audio;
        audio.play().catch((error) => {
            console.warn(`Cry playback: Failed to play ${cryUrl} for ${currentPokemon.species}. Error:`, error);
            if (cryAudioRef.current === audio) {
                cryAudioRef.current = null;
            }
        });
    }, [expandedIndex]); // Re-run when expanded card changes
    // Card animation variants for initial hint
    const cardHintVariants = {
        initial: { opacity: 0, y: 30 },
        animate: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                delay: i * 0.08,
            }
        }),
        hint: (i) => ({
            scale: [1, 1.03, 1],
            transition: {
                delay: i * 0.08 + 0.5, // Stagger hint after initial entrance
                duration: 0.7,
                repeat: 0, // Play once
            }
        })
    };
    // Agrega un pack HOME al equipo
    function handleAddHomePack(trainerName, isShiny) {
        // Puedes ajustar el nombre y el precio según lo que corresponda
        const homePack = {
            type: 'homepack',
            packName: 'Pokedex Paldea + DLC',
            trainerName,
            isShiny,
            price: 12000, // O el precio que corresponda
            gameIcon: '/img/packhome/Paldeafull.png',
        };
        addHomePackToTeam(homePack);
    }
    return (_jsxs("div", { className: "flex flex-col items-center px-4 pt-[1px] text-center", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "\u00A1Descubre Paquetes Exclusivos!" }), _jsxs("div", { className: "flex justify-center gap-2 mb-6", children: [_jsx("button", { className: `text-sm px-2 py-2 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === 'intercambio' ? 'bg-white dark:bg-gray-900 border-yellow-400 text-yellow-600' : 'bg-gray-200 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300'}`, onClick: () => { playSoundEffect('notification', 0.13); setActiveTab('intercambio'); }, children: "Pack de intercambio" }), _jsx("button", { className: `text-sm px-2 py-2 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === 'home' ? 'bg-white dark:bg-gray-900 border-blue-400 text-blue-600' : 'bg-gray-200 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300'}`, onClick: () => { playSoundEffect('notification', 0.13); setActiveTab('home'); }, children: "Packs de Home" })] }), activeTab === 'intercambio' && (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-sm text-gray-600 max-w-md mb-6", children: "Explora paquetes \u00FAnicos que incluyen Pok\u00E9mon especiales con caracter\u00EDsticas exclusivas. \u00A1Elige el que m\u00E1s te guste y agr\u00E9galo a tu colecci\u00F3n!" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto mt-8", children: packSetup.map((pack, idx) => (_jsx(PackCard, { pack: pack }, pack.name))) })] })), activeTab === 'home' && (_jsx("div", { className: "w-full max-w-xl mx-auto bg-white/60 dark:bg-gray-900/60 rounded-xl shadow-lg p-0 mt-4 flex flex-col items-center gap-6 transition-all", children: _jsxs("div", { className: "w-full", children: [_jsxs("button", { className: "w-full flex flex-col items-stretch px-0 pt-0 pb-0 bg-white/80 dark:bg-gray-900/80 rounded-t-xl cursor-pointer focus:outline-none border-b border-gray-200 dark:border-gray-700 transition-all", onClick: () => { playSoundEffect('notification', 0.13); setExpandedIndex(expandedIndex === 999 ? null : 999); }, "aria-expanded": expandedIndex === 999, children: [_jsx("img", { src: paldeaFullImg, alt: "Pack Pokedex Paldea + DLC", className: "w-full h-48 sm:h-60 object-contain rounded-t-xl shadow bg-white/70 dark:bg-gray-800/70", style: { objectPosition: 'center top', flexShrink: 0, background: 'transparent' } }), _jsxs("div", { className: "flex flex-row items-center justify-between w-full px-4 py-3", children: [_jsxs("div", { className: "flex flex-col items-start", children: [_jsx("span", { className: "text-base font-bold text-blue-700 dark:text-blue-300", children: "Pokedex Paldea + DLC" }), _jsxs("span", { className: "inline-block mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white text-sm font-bold shadow border border-yellow-300 tracking-wide", children: ["$ ", isShiny ? '16.990' : '14.990'] })] }), _jsx("span", { className: `ml-2 transition-transform ${expandedIndex === 999 ? 'rotate-180' : ''}`, children: _jsx("svg", { width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "feather feather-chevron-down text-gray-500", children: _jsx("polyline", { points: "6 9 12 15 18 9" }) }) })] })] }), expandedIndex === 999 && (_jsxs("div", { className: "px-6 pt-4 pb-6 bg-white/90 dark:bg-gray-900/90 rounded-b-xl flex flex-col items-center gap-4 animate-fade-in-up", children: [_jsxs("p", { className: "text-gray-700 dark:text-gray-200 mb-3 text-sm text-center", children: ["Incluye todos los Pok\u00E9mon disponibles en Scarlet/Violet. ", _jsx("b", { children: "706 Pok\u00E9mon" }), " con origen Paldea para conseguir la recompensa de ", _jsx("b", { children: "Meloetta shiny" }), " en Pok\u00E9mon HOME.", _jsx("br", {}), "El usuario puede elegir el nombre de entrenador y si los quiere shiny o no.", _jsx("br", {}), "Todos los Pok\u00E9mon tienen EVs en 0 y estad\u00EDsticas perfectas (6 IVs).", _jsx("br", {}), _jsx("span", { className: "text-xs text-gray-500", children: "* Para m\u00E1s informaci\u00F3n sobre la recompensa de Meloetta shiny, revisa la secci\u00F3n de noticias de Pok\u00E9mon HOME." })] }), _jsxs("div", { className: "flex flex-col gap-4 items-center w-full mb-2 justify-center", children: [_jsxs("div", { className: "flex items-center gap-2 justify-center", children: [_jsx("span", { className: "text-xs font-normal text-gray-700 dark:text-gray-200", children: "Normal" }), _jsx("button", { className: `relative w-12 h-7 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-200 focus:outline-none ${isShiny ? 'bg-yellow-400 dark:bg-yellow-500' : ''}`, onClick: () => { playSoundEffect('notification', 0.13); setIsShiny(!isShiny); }, type: "button", "aria-pressed": isShiny, tabIndex: 0, children: _jsx("span", { className: `absolute left-1 top-1 w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${isShiny ? 'translate-x-5 bg-yellow-500' : 'bg-white dark:bg-gray-400'}` }) }), _jsx("span", { className: "text-xs font-normal text-gray-700 dark:text-gray-200", children: "Shiny" })] }), _jsxs("div", { className: "flex items-center gap-2 justify-center", children: [_jsx("label", { className: "text-xs font-normal text-gray-700 dark:text-gray-200", children: "Entrenador:" }), _jsx("input", { type: "text", className: "px-1 py-0.5 w-24 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs", placeholder: "Nombre", value: trainerName, onChange: e => { playSoundEffect('notification', 0.13); setTrainerName(e.target.value); }, maxLength: 12 })] })] }), _jsx("div", { className: "flex justify-center mb-2", children: _jsxs("span", { className: "inline-block px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white text-lg font-bold shadow-lg border-2 border-yellow-300 drop-shadow-md tracking-wide animate-fade-in-up", children: ["$ ", isShiny ? '16.990' : '14.990'] }) }), _jsx(MagnetizeButtonEdicionTarjeta, { className: "mt-2 px-6 py-2", onClick: () => {
                                        playSoundEffect('notification', 0.13);
                                        handleAddHomePack(trainerName.trim(), isShiny);
                                    }, disabled: !trainerName.trim(), children: "Agregar al equipo" })] }))] }) }))] }));
}
// --- Nuevo subcomponente para el carrusel de sprites ---
function SpriteCarousel({ pack, currentSpriteIndex }) {
    const currentPokemon = pack.pokemon[currentSpriteIndex];
    const isParadox = [
        "great-tusk", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing", "sandy-shocks",
        "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns"
    ].includes(currentPokemon.species);
    const spriteUrl = getSprite(currentPokemon, isParadox ? false : true);
    return (_jsxs("div", { className: "relative flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 mx-auto", children: [_jsx(motion.img, { src: spriteUrl, alt: currentPokemon.species, className: "w-full h-full object-contain", initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.05 }, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }, onError: (e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png') }, currentPokemon.species), (isParadox ? false : true) && (_jsx("div", { className: "w-6 h-6 absolute right-0 top-1 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center text-yellow-400 font-bold text-xs z-20 bg-white/90 dark:bg-gray-800/90", title: "Shiny Pok\u00E9mon \u2728", children: "\u2728" })), currentPokemon.gender && currentPokemon.gender !== "N" && (_jsx("div", { className: cn("w-6 h-6 absolute right-0 transform -translate-y-1/2 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center text-white font-bold text-xs z-10", currentPokemon.gender === "M" ? "bg-blue-300" : "bg-pink-300", 
                // Adjust position based on whether shiny badge is present
                (isParadox ? false : true) ? "top-1/2" : "top-1/2"), title: currentPokemon.gender === "M" ? "Macho" : "Hembra", children: currentPokemon.gender === "M" ? "♂" : "♀" })), currentPokemon.item && (_jsx("div", { className: cn("w-6 h-6 absolute right-0 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center z-10 bg-white/90 dark:bg-gray-800/90", 
                // Adjust position based on other badges
                currentPokemon.gender && currentPokemon.gender !== "N" ? "bottom-1" :
                    (isParadox ? false : true) ? "bottom-1" : "bottom-1"), title: `Objeto: ${currentPokemon.item}`, children: (() => {
                    const itemObj = items_sv.find(i => i.name.toLowerCase() === currentPokemon.item.toLowerCase());
                    return itemObj?.sprite ? (_jsx("img", { src: itemObj.sprite, alt: itemObj.name, className: "w-4 h-4 object-contain" })) : (_jsx("span", { className: "text-[8px] font-bold text-gray-600 dark:text-gray-300", children: "\uD83D\uDCE6" }));
                })() }))] }));
}
function PackCard({ pack }) {
    const navigate = useNavigate();
    const [currentSpriteIndex, setCurrentSpriteIndex] = useState(0);
    const [buttonKey, setButtonKey] = useState(Date.now()); // Unique key for button
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSpriteIndex((prevIndex) => (prevIndex + 1) % pack.pokemon.length);
            setButtonKey(Date.now()); // Update button key to prevent animation reset
        }, 2000); // Change sprite every 2 seconds
        return () => clearInterval(interval);
    }, [pack.pokemon.length]);
    function addPokemonToTeamBatch(pokemonArray) {
        const packEntry = {
            type: 'pack', // Ensure type is explicitly "pack"
            packName: pack.name,
            pokemons: pokemonArray,
            price: pack.price
        };
        const currentTeam = getPokemonTeam();
        const updatedTeam = [...currentTeam, packEntry];
        setPokemonTeam(updatedTeam);
        navigate('/equipo');
    }
    const isStartersPack = pack.name.toLowerCase().includes('starter');
    return (_jsxs("div", { className: "relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl p-5 flex flex-col gap-4 items-center border border-gray-200/70 dark:border-gray-700/60 hover:shadow-2xl transition-all min-h-[220px]", children: [_jsx(SpriteCarousel, { pack: pack, currentSpriteIndex: currentSpriteIndex }), _jsx("h3", { className: "text-lg font-bold text-center", children: pack.name }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 text-center", children: pack.description }), _jsxs("div", { className: "flex items-center justify-center gap-2 mt-2 mb-1", children: [_jsx(DollarSign, { className: "w-5 h-5 text-yellow-500" }), _jsx("span", { className: "text-lg font-bold text-yellow-700 dark:text-yellow-300", children: pack.price.toLocaleString() })] }), _jsx(MagnetizeButtonEdicionTarjeta, { className: "mt-2 px-4 py-2", onClick: () => {
                    const nuevosPokemon = pack.pokemon.map(pokeObj => {
                        if (pokeObj.showdownText) {
                            const parsed = parseShowdownText(pokeObj.showdownText).pokemon;
                            let gender = parsed.gender || 'N';
                            if (typeof pokeObj.gender === 'string' && ['M', 'F', 'N'].includes(pokeObj.gender)) {
                                gender = pokeObj.gender;
                            }
                            return { ...parsed, gender };
                        }
                        else {
                            return pokeObj;
                        }
                    });
                    playSoundEffect('notification', 0.13);
                    addPokemonToTeamBatch(nuevosPokemon);
                }, children: "Agregar al equipo" }, buttonKey)] }));
}
