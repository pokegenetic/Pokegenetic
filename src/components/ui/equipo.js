import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, PlusSquare, DollarSign } from "lucide-react";
import { Pokedex } from "@/data/sv/pokedex_module";
// Corrected import path and ensure parseShowdownTextToArray is exported from the file
import { generateShowdownTextFromParsed } from "../../lib/parseShowdown";
import { Moves } from "@/data/sv/moves";
import { teraSprites, teraOptions } from "@/data/pokemonConstants";
import { getNatureEffectShortEn, getNatureEffectText } from '@/lib/natureEffects';
import { items_sv } from '@/data/sv/items_sv';
import { descuentos, getPokemonPrice, getPokemonOriginalPrice } from "./preciospokemon"; // Added import for pricing
import { getPokemonTeam, setPokemonTeam } from '../../lib/equipoStorage';
import { useGame } from '../../context/GameContext';
import { formatNameForPokedexLookup } from './equipoUtils'; // Import from equipoUtils
import { getShowdownCryUrl } from '../../lib/getShowdownCryUrl';
import MagnetizeButtonEdicionTarjeta from './magnetize-button-ediciontarjeta';
function capitalizeFirst(str) {
    if (!str)
        return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
// Base Type Colors
const typeColors = {
    Normal: "bg-gray-400",
    Fire: "bg-red-500",
    Water: "bg-blue-500",
    Grass: "bg-green-500",
    Electric: "bg-yellow-400", // Tailwind yellow-400 is a bit light, consider yellow-500 if contrast is an issue
    Ice: "bg-sky-400", // Using sky instead of blue-300 for better distinction
    Fighting: "bg-orange-600", // Adjusted from orange-700 for a bit more brightness
    Poison: "bg-purple-500",
    Ground: "bg-amber-600", // Using amber instead of yellow-600
    Flying: "bg-indigo-400", // Adjusted from indigo-300
    Psychic: "bg-pink-500",
    Bug: "bg-lime-500",
    Rock: "bg-stone-500", // Using stone instead of yellow-700
    Ghost: "bg-violet-600", // Using violet instead of purple-700
    Dragon: "bg-indigo-600", // Adjusted from indigo-700
    Dark: "bg-neutral-700", // Using neutral instead of gray-700 for dark mode friendliness
    Steel: "bg-slate-500", // Using slate instead of gray-500
    Fairy: "bg-pink-400", // Adjusted from pink-300
    Stellar: "bg-cyan-500", // Using cyan for Stellar
};
// Helper function to format Pokémon names for pokemondb.net URLs
function formatNameForPokemondb(name) {
    if (!name)
        return '';
    let formattedName = name.toLowerCase();
    // Normalize accents first
    formattedName = formattedName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Handle specific gendered names that are distinct entries on PDB
    if (formattedName.includes("nidoran") && formattedName.includes("♀"))
        return "nidoran-f";
    if (formattedName.includes("nidoran") && formattedName.includes("♂"))
        return "nidoran-m";
    if (formattedName === "indeedee-m")
        return "indeedee-male";
    if (formattedName === "indeedee-f")
        return "indeedee-female";
    if (formattedName === "meowstic-m")
        return "meowstic-male";
    if (formattedName === "meowstic-f")
        return "meowstic-female";
    if (formattedName === "basculegion-m")
        return "basculegion-male";
    if (formattedName === "basculegion-f")
        return "basculegion-female";
    // General replacements for symbols and spacing
    formattedName = formattedName
        .replace(/♀/g, '-f') // Generic female symbol
        .replace(/♂/g, '-m') // Generic male symbol
        .replace(/[.'’:]/g, '') // Remove apostrophes, periods, colons
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
    // Form name conversions (Showdown-like to PDB-like)
    // Order can be important for some of these replacements
    formattedName = formattedName
        .replace(/-alola$/, '-alolan')
        .replace(/-galar$/, '-galarian')
        .replace(/-hisui$/, '-hisuian')
        .replace(/-paldea$/, '-paldean')
        .replace(/-therian$/, '-therian') // e.g. Landorus-Therian
        .replace(/-incarnate$/, '') // Landorus-Incarnate -> landorus
        .replace(/-origin$/, '-origin') // Giratina-Origin
        .replace(/-sky$/, '-sky') // Shaymin-Sky
        .replace(/-land$/, '') // Shaymin-Land -> shaymin
        .replace(/-zen$/, '-zen') // Darmanitan-Zen
        .replace(/-standard$/, '') // Darmanitan-Standard -> darmanitan
        .replace(/-blade$/, '-blade') // Aegislash-Blade
        .replace(/-shield$/, '') // Aegislash-Shield -> aegislash
        .replace(/-sunshine$/, '-sunshine') // Cherrim-Sunshine
        .replace(/-overcast$/, '') // Cherrim-Overcast -> cherrim
        .replace(/-school$/, '-school') // Wishiwashi-School
        .replace(/-solo$/, '') // Wishiwashi-Solo -> wishiwashi
        .replace(/-aria$/, '-aria') // Meloetta-Aria
        .replace(/-pirouette$/, '-pirouette') // Meloetta-Pirouette
        .replace(/-resolute$/, '-resolute') // Keldeo-Resolute
        .replace(/-ordinary$/, '') // Keldeo-Ordinary -> keldeo
        .replace(/-strike$/, '') // Urshifu-Single-Strike -> urshifu
        .replace(/-rapid-strike$/, '-rapid-strike')
        .replace(/-crowned$/, '-crowned') // Zacian-Crowned, Zamazenta-Crowned
        .replace(/-hero$/, '') // Zacian-Hero -> zacian (base form)
        .replace(/-eternamax$/, '-eternamax')
        .replace(/-hangry$/, '-hangry') // Morpeko-Hangry
        .replace(/-full-belly$/, '') // Morpeko-Full-Belly -> morpeko
        .replace(/-amped$/, '-amped') // Toxtricity-Amped
        .replace(/-low-key$/, '-low-key') // Toxtricity-Low-Key
        .replace(/-10%?$/, '-10') // Zygarde-10% / Zygarde-10
        .replace(/-50%?$/, '') // Zygarde-50% / Zygarde-50 -> zygarde
        .replace(/-complete$/, '-complete') // Zygarde-Complete
        .replace(/-ash$/, '-ash') // Greninja-Ash
        // Cap Pikachus
        .replace(/-original-cap$/, '-original-cap')
        .replace(/-hoenn-cap$/, '-hoenn-cap')
        .replace(/-sinnoh-cap$/, '-sinnoh-cap')
        .replace(/-unova-cap$/, '-unova-cap')
        .replace(/-kalos-cap$/, '-kalos-cap')
        .replace(/-alola-cap$/, '-alola-cap')
        .replace(/-partner-cap$/, '-partner-cap')
        .replace(/-world-cap$/, '-world-cap')
        // Palafin
        .replace(/-zero$/, '-zero') // Palafin-Zero
        .replace(/-hero-form$/, '-hero') // Palafin-Hero (ensure this doesn't conflict with Zacian's -hero)
        // Tatsugiri
        .replace(/-curly$/, '-curly')
        .replace(/-droopy$/, '-droopy')
        .replace(/-stretchy$/, '-stretchy')
        // Squawkabilly
        .replace(/-green-plumage$/, '-green-plumage')
        .replace(/-blue-plumage$/, '-blue-plumage')
        .replace(/-yellow-plumage$/, '-yellow-plumage')
        .replace(/-white-plumage$/, '-white-plumage')
        // Maushold
        .replace(/-family-of-three$/, '-family-of-three')
        .replace(/-family-of-four$/, '') // Base for Maushold on PDB
        // Ogerpon (Showdown: Ogerpon-Teal, Ogerpon-Wellspring, etc.)
        // PDB: ogerpon, ogerpon-wellspring, etc.
        .replace(/^ogerpon-teal(-mask)?$/, 'ogerpon') // Ogerpon-Teal or Ogerpon-Teal-Mask -> ogerpon
        .replace(/^ogerpon-(wellspring|hearthflame|cornerstone)(-mask)?$/, 'ogerpon-$1-mask') // ogerpon-wellspring-mask etc.
    ;
    // Specific known names that need exact matching or differ significantly
    const specificNameMap = {
        'mr-mime': 'mr-mime',
        'mr-mime-galarian': 'mr-mime-galarian', // ensure -galarian is kept if already applied
        'mr-rime': 'mr-rime',
        'type-null': 'type-null',
        'farfetchd': 'farfetchd',
        'farfetchd-galarian': 'farfetchd-galarian',
        'sirfetchd': 'sirfetchd',
        'ho-oh': 'ho-oh',
        'porygon-z': 'porygon-z',
        'kommo-o': 'kommo-o',
        'jangmo-o': 'jangmo-o',
        'hakamo-o': 'hakamo-o',
        'shaymin-land': 'shaymin-land', // Overrides -land -> '' if it was 'shaymin-land'
        'shaymin-sky': 'shaymin-sky', // Overrides -sky -> '-sky'
        'giratina-origin': 'giratina-origin',
        'darmanitan-standard': 'darmanitan', // Explicitly map standard forms to base
        'darmanitan-galarian-standard': 'darmanitan-galarian',
        'aegislash-shield': 'aegislash',
        'wishiwashi-solo': 'wishiwashi',
        'meloetta-aria': 'meloetta-aria',
        'keldeo-ordinary': 'keldeo',
        'morpeko-full-belly': 'morpeko',
        'zygarde': 'zygarde', // Base Zygarde (50%)
        'zygarde-50': 'zygarde',
        'zacian': 'zacian', // Base Zacian (Hero of Many Battles)
        'zamazenta': 'zamazenta', // Base Zamazenta
        'palafin': 'palafin-zero', // Default Palafin to Zero form on PDB if no form specified
    };
    if (specificNameMap[formattedName]) {
        formattedName = specificNameMap[formattedName];
    }
    // Cleanup: remove double hyphens and trim hyphens from start/end
    formattedName = formattedName.replace(/--+/g, '-').replace(/^-+|-+$/g, '');
    return formattedName;
}
// Updated getSprite function to use pokemondb.net and handle regional forms
function getSprite(parsedPokemon, shiny) {
    if (!parsedPokemon || !parsedPokemon.species) {
        // console.warn("getSprite: parsedPokemon or parsedPokemon.name is undefined", parsedPokemon);
        return null;
    }
    const nameForUrl = formatNameForPokemondb(parsedPokemon.species);
    if (!nameForUrl) {
        // console.warn("getSprite: formatNameForPokemondb returned empty for", parsedPokemon.name);
        return null;
    }
    const shinyStr = shiny ? "shiny" : "normal";
    const spriteUrl = `https://img.pokemondb.net/sprites/home/${shinyStr}/${nameForUrl}.png`;
    // For debugging purposes, you can uncomment this:
    // console.log(`Constructed sprite URL for ${parsedPokemon.name} (Shiny: ${shiny}) -> ${nameForUrl}: ${spriteUrl}`);
    return spriteUrl;
}
// Helper: convert team array to showdown text
export function teamToShowdownText(team) {
    // Separar Pokémon y packs de HOME
    const pokemonEntries = [];
    const homePackEntries = [];
    team.forEach(entry => {
        if ('type' in entry && entry.type === 'pack') {
            // Exportar todos los pokémon del pack
            const packPokemons = entry.pokemons
                .filter(p => p && p.species && p.moves && p.moves.some(m => m && m !== "- -" && m !== "-" && m !== ""))
                .map(generateShowdownTextFromParsed);
            pokemonEntries.push(...packPokemons);
        }
        else if ('type' in entry && entry.type === 'homepack') {
            // Agregar información del pack de HOME
            const homeEntry = entry;
            homePackEntries.push(`PACK HOME: ${homeEntry.packName}\nEntrenador: ${homeEntry.trainerName} ${homeEntry.isShiny ? 'Shiny' : 'Normal'}`);
        }
        else {
            const p = entry;
            if (p && p.species && p.moves && p.moves.some(m => m && m !== "- -" && m !== "-" && m !== "")) {
                pokemonEntries.push(generateShowdownTextFromParsed(p));
            }
        }
    });
    // Combinar: primero todos los Pokémon, luego separador, luego packs de HOME
    let result = pokemonEntries.join('\n\n');
    if (homePackEntries.length > 0) {
        result += '\n\n' + '='.repeat(50) + '\n\n' + homePackEntries.join('\n\n');
    }
    return result;
}
// Helper: map English/Spanish Tera type keys to the correct teraSprites key
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
function Equipo() {
    const { pokemonTeam } = useGame();
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [currentTeam, setCurrentTeam] = useState(() => getPokemonTeam());
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const cryAudioRef = useRef(null);
    const [pokemonPrices, setPokemonPrices] = useState([]);
    const [totalPriceInfo, setTotalPriceInfo] = useState(null);
    const [isPriceSummaryExpanded, setIsPriceSummaryExpanded] = useState(false); // Added state for collapsibility
    // Estado global para los índices de sprites de packs
    const [packSpriteIndices, setPackSpriteIndices] = React.useState({});
    // Agrupar el equipo por packName (packs juntos, singles después)
    const groupedTeam = React.useMemo(() => {
        const grouped = new Map();
        const singles = [];
        const homePacks = [];
        currentTeam.forEach((entry) => {
            if ('type' in entry && entry.type === 'homepack') {
                homePacks.push(entry);
            }
            else {
                const p = entry;
                if ('packName' in p && typeof p.packName === 'string') {
                    if (!grouped.has(p.packName))
                        grouped.set(p.packName, []);
                    grouped.get(p.packName)?.push(p);
                }
                else {
                    singles.push(p);
                }
            }
        });
        const merged = [];
        grouped.forEach((pokemons, packName) => {
            // Buscar el precio del pack en el primer Pokémon del grupo (si existe)
            let price;
            if (pokemons.length > 0 && pokemons[0].price) {
                price = pokemons[0].price;
            }
            merged.push({ type: "pack", packName, pokemons, price });
        });
        return [...merged, ...homePacks, ...singles];
    }, [currentTeam]);
    // Sync currentTeam with pokemonTeam from context
    useEffect(() => {
        setCurrentTeam(pokemonTeam);
    }, [pokemonTeam]);
    // EFFECT: Calculate prices when team changes
    useEffect(() => {
        if (currentTeam.length > 0 && initialLoadComplete) {
            // Calcular el precio total considerando packs y HOME packs
            let subtotal = 0;
            let allPokemons = [];
            currentTeam.forEach(entry => {
                if ('type' in entry && entry.type === 'pack' && typeof entry.price === 'number') {
                    subtotal += entry.price;
                }
                else if ('type' in entry && entry.type === 'homepack' && typeof entry.price === 'number') {
                    subtotal += entry.price;
                }
                else if (!('type' in entry)) {
                    // Individual Pokemon
                    const price = getPokemonPrice(entry);
                    subtotal += price;
                }
            });
            // Para compatibilidad, mantener el array de precios individuales (solo para mostrar en detalles)
            // Solo incluir Pokemon reales, no HOME packs
            allPokemons = currentTeam.flatMap(entry => {
                if ('type' in entry && entry.type === 'pack') {
                    return entry.pokemons;
                }
                else if ('type' in entry && entry.type === 'homepack') {
                    return []; // HOME packs don't have Pokemon
                }
                else {
                    return [entry];
                }
            });
            const individualPrices = allPokemons.map(p => getPokemonPrice(p));
            setPokemonPrices(individualPrices);
            let discountAmount = 0;
            if (allPokemons.length >= descuentos.porEquipoGrande.cantidadMinimaPokemon) {
                discountAmount = subtotal * (descuentos.porEquipoGrande.porcentajeDescuento / 100);
            }
            const finalTotal = subtotal - discountAmount;
            setTotalPriceInfo({ subtotal, discount: discountAmount, final: finalTotal });
        }
        else {
            setPokemonPrices([]);
            setTotalPriceInfo(null);
        }
    }, [currentTeam, initialLoadComplete]); // Removed pokemonPrices from dependencies to prevent infinite loop
    // useEffect to play Pokémon cry or notification when a card is expanded
    useEffect(() => {
        if (cryAudioRef.current) {
            cryAudioRef.current.pause();
            cryAudioRef.current.currentTime = 0;
            cryAudioRef.current = null;
        }
        if (expandedIndex === null || !currentTeam[expandedIndex]) {
            return;
        }
        const entry = currentTeam[expandedIndex];
        if ('type' in entry && entry.type === 'pack') {
            // Play notification sound for packs
            import('../../lib/soundEffects').then(({ playSoundEffect }) => {
                playSoundEffect('notification', 0.18);
            });
            return;
        }
        // For singles, play the correct Pokémon cry (index matches only singles, not packs)
        // Compute the index among singles only
        let singleIdx = -1;
        for (let i = 0, count = 0; i < currentTeam.length; ++i) {
            const e = currentTeam[i];
            if (!('type' in e && (e.type === 'pack' || e.type === 'homepack'))) {
                count++;
            }
            if (i === expandedIndex) {
                if (!('type' in e && (e.type === 'pack' || e.type === 'homepack'))) {
                    singleIdx = count - 1;
                }
                break;
            }
        }
        if (singleIdx === -1)
            return;
        const singleEntries = currentTeam.filter(e => !('type' in e && (e.type === 'pack' || e.type === 'homepack')));
        const currentPokemon = singleEntries[singleIdx];
        if (!currentPokemon)
            return;
        const cryUrl = getShowdownCryUrl(currentPokemon.species);
        if (!cryUrl)
            return;
        const audio = new Audio(cryUrl);
        audio.volume = 0.3;
        cryAudioRef.current = audio;
        audio.play().catch((error) => {
            if (cryAudioRef.current === audio) {
                cryAudioRef.current = null;
            }
        });
    }, [expandedIndex, currentTeam]);
    // EFFECT 1: Load from localStorage and initialize currentTeam
    useEffect(() => {
        if (!initialLoadComplete) {
            setCurrentTeam(getPokemonTeam());
            setInitialLoadComplete(true); // Ensure this runs only once
        }
        // Escucha los cambios en localStorage
        const handleStorageChange = (e) => {
            if (e.key === 'pokemonTeam' || e.key === 'pokemonTeamShowdownText' || e.key === null) {
                // Si se borró el equipo o se modificó
                setCurrentTeam(getPokemonTeam());
            }
        };
        // Escuchar eventos de storage para cambios en otras pestañas
        window.addEventListener('storage', handleStorageChange);
        // Polling para detectar cambios en la misma pestaña
        const checkTeamChanges = () => {
            const storedTeam = getPokemonTeam();
            if (JSON.stringify(storedTeam) !== JSON.stringify(currentTeam)) {
                setCurrentTeam(storedTeam);
            }
        };
        const intervalId = setInterval(checkTeamChanges, 500);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(intervalId);
        };
    }, [currentTeam, initialLoadComplete]);
    // EFFECT 2: Persist currentTeam as showdown text in localStorage
    useEffect(() => {
        if (initialLoadComplete) {
            setPokemonTeam(currentTeam);
            if (currentTeam.length === 0) {
                localStorage.removeItem('pokemonTeamShowdownText');
            }
            else {
                localStorage.setItem('pokemonTeamShowdownText', teamToShowdownText(currentTeam));
            }
        }
    }, [currentTeam, initialLoadComplete]);
    useEffect(() => {
        setCurrentTeam(getPokemonTeam());
    }, [location]);
    const handleDeletePokemon = (pokemonIndex) => {
        // Eliminar por índice exacto en currentTeam, tanto packs como singles
        let updatedTeam = [...currentTeam];
        updatedTeam.splice(pokemonIndex, 1);
        setCurrentTeam(updatedTeam);
        setPokemonTeam(updatedTeam);
        if (updatedTeam.length === 0) {
            localStorage.removeItem('pokemonTeamShowdownText');
        }
        else {
            localStorage.setItem('pokemonTeamShowdownText', teamToShowdownText(updatedTeam));
        }
    };
    const handleEditPokemonInternal = (pokemonIndex) => {
        const entry = currentTeam[pokemonIndex];
        if (entry && !('type' in entry && entry.type === 'pack')) {
            const singlePokemon = entry;
            navigate('/ediciontarjeta', {
                state: {
                    pokemonShowdownText: generateShowdownTextFromParsed(singlePokemon),
                    editedPokemonIndex: pokemonIndex
                }
            });
        }
        else {
            console.error("Attempted to edit Pokemon with no data at index:", pokemonIndex);
        }
    };
    // Handler para expandir/cerrar el resumen de precios con sonido
    const handleTogglePriceSummary = () => {
        import('../../lib/soundEffects').then(({ playSoundEffect }) => {
            playSoundEffect('notification', 0.18);
        });
        setIsPriceSummaryExpanded((prev) => !prev);
    };
    // Handler para expandir/cerrar tarjetas de equipo con sonido
    const handleExpandCard = (idx) => {
        import('../../lib/soundEffects').then(({ playSoundEffect }) => {
            playSoundEffect('notification', 0.18);
        });
        setExpandedIndex(expandedIndex === idx ? null : idx);
    };
    if (error) {
        return (_jsxs("div", { className: "flex items-center justify-center h-screen text-red-600 dark:text-red-400", children: ["Error: ", error] }));
    }
    // Display loading or empty team message before the main content
    if (!initialLoadComplete) {
        return _jsx("div", { className: "flex items-center justify-center h-screen text-gray-500 dark:text-gray-400", children: "Cargando equipo..." });
    }
    if (currentTeam.length === 0 && initialLoadComplete) {
        return (_jsx("div", { className: "min-h-[60vh] flex flex-col justify-center items-center dark:bg-gray-900 p-4 pt-0 sm:p-6 sm:pt-0", children: _jsxs("div", { className: "flex flex-col items-center text-center text-gray-500 dark:text-gray-400 gap-2", children: [_jsx("h1", { className: "text-4xl sm:text-3xl font-bold mb-3 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "Tu equipo est\u00E1 actualmente vac\u00EDo" }), _jsxs("p", { className: "text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md", children: ["Crea un Pok\u00E9mon desde cero, importa uno ya creado pegando el texto desde Showdown, o explora los packs de intercambio y HOME para expandir tu colecci\u00F3n.", _jsx("br", {}), _jsx("br", {}), "Haz clic en \u201CA\u00F1adir Pok\u00E9mon\u201D para descubrir todas las opciones disponibles.", _jsx("br", {}), " ", _jsx("br", {}), "Adem\u00E1s, puedes conseguir Pok\u00E9mon gratis participando en los minijuegos de Pok\u00E9mon Catch o usando las Incubadoras."] }), _jsx(MagnetizeButtonEdicionTarjeta, { className: "mt-2 px-4 py-2", onClick: () => navigate('/crear'), children: "A\u00F1adir Pok\u00E9mon" })] }) }));
    }
    // --- Render principal ---
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "min-h-screen flex flex-col dark:bg-gray-900 p-4 pt-0 sm:p-6 sm:pt-0", children: [_jsxs("div", { className: "w-full max-w-3xl mx-auto text-center mb-4", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg animate-fade-in-down", style: { WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }, children: "Tu equipo Pok\u00E9mon" }), _jsx("p", { className: "mt-2 text-sm sm:text-base md:text-lg font-normal text-gray-500 dark:text-gray-300 animate-fade-in delay-100", children: "Crea, visualiza y gestiona tu equipo Pok\u00E9mon personalizado. A\u00F1ade, edita o elimina miembros y revisa sus detalles para prepararte para tus pr\u00F3ximas aventuras o combates." })] }), _jsxs("div", { className: "w-full max-w-3xl mx-auto mb-10 flex items-center justify-center", children: [_jsx("hr", { className: "w-full border-gray-300 dark:border-gray-700 opacity-50" }), _jsx("img", { src: "/pokeball.png", alt: "Pokeball separator", className: "w-8 h-8 mx-4" }), _jsx("hr", { className: "w-full border-gray-300 dark:border-gray-700 opacity-50" })] }), _jsx(TeamCountInfo, { team: currentTeam, totalPrice: totalPriceInfo?.final || 0 }), _jsx("div", { className: cn("w-full grid gap-6 place-items-center", currentTeam.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"), children: currentTeam.map((entry, idx) => {
                        if ('type' in entry && entry.type === 'pack') {
                            return (_jsx(PackCardEquipo, { pack: entry, idx: idx, expandedIndex: expandedIndex, setExpandedIndex: setExpandedIndex, handleDeletePokemon: handleDeletePokemon, currentTeam: currentTeam, pokemonPrices: pokemonPrices, handleExpandCard: handleExpandCard }, `pack-${entry.packName}-${idx}`));
                        }
                        if ('type' in entry && entry.type === 'homepack') {
                            return (_jsx(HomePackCardEquipo, { homePack: entry, idx: idx, handleDeletePokemon: handleDeletePokemon }, `homepack-${entry.packName}-${idx}`));
                        }
                        // Normal Pokémon entry
                        const p = entry;
                        const spriteUrl = getSprite(p, p.isShiny);
                        const displayNickname = p.name;
                        const displaySpecies = p.species;
                        const itemObj = p.item ? items_sv.find(i => i.name.toLowerCase() === p.item.toLowerCase()) : null;
                        const teraTypeSpriteKey = getTeraSpriteKey(p.teraType || "");
                        const teraTypeSprite = teraTypeSpriteKey ? teraSprites[teraTypeSpriteKey] : undefined;
                        const pokedexEntry = Pokedex[formatNameForPokedexLookup(p.species)];
                        const baseTypes = pokedexEntry?.types || ["Normal"];
                        // Compute price index (flattened)
                        let priceIdx = 0;
                        for (let i = 0; i < idx; ++i) {
                            const e = currentTeam[i];
                            if ('type' in e && e.type === 'pack')
                                priceIdx += e.pokemons.length;
                            else if (!('type' in e && e.type === 'homepack'))
                                priceIdx += 1;
                            // HOME packs don't contribute to priceIdx since they don't have Pokemon
                        }
                        const individualPrice = pokemonPrices[priceIdx];
                        return (_jsxs(motion.div, { className: cn("w-full max-w-3xl bg-white bg-opacity-75 dark:bg-gray-50 dark:bg-opacity-95 rounded-xl shadow-xl p-0 overflow-hidden relative transition-all duration-300 border border-gray-300 dark:border-gray-600", expandedIndex === idx ? "ring-2 ring-blue-400" : "cursor-pointer hover:shadow-2xl"), initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: idx * 0.05 }, onClick: () => handleExpandCard(idx), children: [_jsxs("div", { className: "absolute top-2 right-2 flex gap-1 z-20", children: [_jsxs("button", { onClick: e => {
                                                if (p.caught || p.hatched) {
                                                    e.stopPropagation();
                                                    alert('Los Pokémon atrapados o eclosionados no se pueden editar.');
                                                }
                                                else {
                                                    e.stopPropagation();
                                                    handleEditPokemonInternal(idx);
                                                }
                                            }, className: cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium shadow-sm hover:shadow transition-all focus:outline-none focus:ring-1", (p.caught || p.hatched)
                                                ? "bg-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:ring-gray-400 dark:focus:ring-gray-500"), title: p.caught || p.hatched ? 'No puedes editar un Pokémon atrapado o eclosionado' : 'Editar', children: [_jsx(Pencil, { size: 12 }), !(p.caught || p.hatched) && _jsx("span", { className: "ml-0.5", children: "Editar" })] }), _jsxs("button", { onClick: e => { e.stopPropagation(); handleDeletePokemon(idx); }, className: "flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-red-600 hover:text-red-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-red-400 dark:hover:text-red-500 text-[10px] font-medium shadow-sm hover:shadow transition-all focus:outline-none focus:ring-1 focus:ring-red-400 dark:focus:ring-red-500", title: "Liberar", children: [_jsx(Trash2, { size: 12 }), _jsx("span", { className: "ml-0.5", children: "Liberar" })] })] }), _jsxs("div", { className: "flex flex-row items-center gap-3 px-4 py-3 select-none", children: [_jsxs("div", { className: "relative flex-shrink-0 flex items-center justify-center w-24 h-24", children: [spriteUrl && (_jsx("img", { src: spriteUrl, alt: displayNickname || displaySpecies, className: cn("w-full h-full object-contain filter", p.isShiny ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" : ""), title: p.isShiny ? "Shiny Pokémon ✨" : "", onError: (e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png') })), p.gender && p.gender !== "N" && (_jsx("div", { className: cn("w-6 h-6 absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center text-white font-bold text-xs z-10", p.gender === "M" ? "bg-blue-300" : "bg-pink-300"), title: p.gender === "M" ? "Macho" : "Hembra", children: p.gender === "M" ? "♂" : "♀" })), itemObj && (_jsx("img", { src: itemObj.sprite, alt: itemObj.name, className: "w-6 h-6 absolute bottom-1 right-0 bg-white rounded-full border border-gray-300 dark:border-gray-700 shadow z-10", title: itemObj.name })), p.isShiny && (_jsx("span", { className: "absolute top-1 right-0 z-20 text-yellow-400 text-base animate-bounce pointer-events-none select-none drop-shadow-lg flex items-center justify-center w-6 h-6", children: "\u2728" }))] }), _jsxs("div", { className: "flex flex-col flex-1 min-w-0", children: [(p.hatched || p.caught) && (_jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [p.hatched && (_jsx("span", { className: "inline-flex items-center gap-1 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold ml-0", children: "ECLOSIONADO" })), p.caught && !p.hatched && (_jsx("span", { className: "inline-flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold ml-0", children: "ATRAPADO" }))] })), _jsxs("div", { className: "mt-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate", children: p.name && p.name.toLowerCase() !== p.species.toLowerCase() ? p.name : p.species }), (() => {
                                                                    // Buscar si este Pokémon está en algún pack del currentTeam
                                                                    const packEntry = currentTeam.find(entry => 'type' in entry && entry.type === 'pack' && entry.pokemons.includes(p));
                                                                    return packEntry ? (_jsxs("span", { className: "inline-flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold ml-1", children: ["PACK: ", packEntry.packName] })) : null;
                                                                })()] }), _jsxs("div", { className: "flex flex-wrap gap-1 items-center mt-1", children: [_jsxs("span", { className: "badge bg-gray-700 text-white text-[10px] px-1 py-px rounded", children: ["Lvl ", p.level || 100] }), p.caught ? (_jsx("span", { className: "text-xs bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100 px-2 py-0.5 rounded-full font-semibold shadow-sm", children: "Gratis" })) : individualPrice !== undefined && (_jsxs("span", { className: "text-xs bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100 px-2 py-0.5 rounded-full font-semibold shadow-sm", children: ["$", individualPrice] }))] }), _jsxs("div", { className: "flex flex-wrap gap-1 items-center mt-1", children: [baseTypes.map((type) => (_jsx("span", { className: cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-normal shadow-sm transition-colors', typeColors[type] || 'bg-gray-400 text-white', 'border-gray-300 dark:border-gray-600', 'text-white'), children: type }, type))), p.teraType && getTeraSpriteKey(p.teraType) && teraSprites[getTeraSpriteKey(p.teraType)] && (_jsxs("span", { className: cn('inline-flex items-center rounded-full border px-1 py-[1px] text-[8.5px] font-normal shadow-sm transition-colors ml-1', typeColors[capitalizeFirst(p.teraType)] || 'bg-gray-400 text-white', 'border-gray-300 dark:border-gray-600', 'text-white'), children: [_jsx("img", { src: teraSprites[getTeraSpriteKey(p.teraType)], alt: `Teratipo ${p.teraType}`, className: "w-4 h-4 object-contain mr-1", onError: e => { e.currentTarget.style.display = 'none'; } }), capitalizeFirst(p.teraType)] }))] })] })] }), _jsx("div", { className: "ml-2 flex items-center", children: _jsx("span", { className: cn("w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-200 transition-transform hover:bg-gray-200 dark:hover:bg-gray-500 hover:text-gray-600 dark:hover:text-gray-100", expandedIndex === idx ? "rotate-180" : "rotate-0"), style: { fontSize: '0.75rem' }, children: "\u25BC" }) })] }), expandedIndex === idx && (_jsxs("div", { className: "px-4 pb-4 pt-1 animate-fade-in", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-2 mb-2 w-full", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("span", { className: "block text-xs font-semibold text-gray-700 dark:text-gray-200", children: "Habilidad:" }), _jsxs("span", { className: "block text-sm text-gray-900 dark:text-white truncate", children: [p.ability && p.ability.trim() !== '' ? capitalizeFirst(p.ability) : 'N/A', p.isHO && (_jsx("span", { className: "ml-2 inline-block align-middle px-1.5 py-[1px] bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold rounded-full shadow", children: "HO" }))] })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("span", { className: "block text-xs font-semibold text-gray-700 dark:text-gray-200", children: "Naturaleza:" }), _jsxs("span", { className: "block text-sm text-gray-900 dark:text-white truncate flex items-center", children: [capitalizeFirst(p.nature), _jsx("span", { className: cn('inline-flex items-center rounded px-1 py-[1px] text-[8.5px] font-normal shadow-sm transition-colors ml-1', 'border border-gray-300 dark:border-gray-600', 'text-gray-400 dark:text-gray-300', 'bg-transparent'), title: getNatureEffectText(p.nature), children: getNatureEffectShortEn(p.nature) })] })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("span", { className: "block text-xs font-semibold text-gray-700 dark:text-gray-200", children: "Objeto:" }), _jsxs("span", { className: "block text-sm text-gray-900 dark:text-white truncate flex items-center", children: [p.item ? capitalizeFirst(p.item) : '—', itemObj && (_jsx("img", { src: itemObj.sprite, alt: itemObj.name, className: "w-5 h-5 ml-1 inline-block align-middle", title: itemObj.name }))] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2", children: [_jsxs("div", { className: "z-10", children: [_jsx("h3", { className: "text-md font-semibold text-gray-800 dark:text-gray-100 mb-1.5", children: "Movimientos" }), _jsx("ul", { className: "space-y-1", children: (p.moves || []).filter(mv => mv && mv !== '-').length > 0 ?
                                                                (p.moves || []).map((move, i) => {
                                                                    // Prefer direct lookup if move is a valid ID
                                                                    let moveId = move;
                                                                    let moveData = Moves[moveId];
                                                                    // If not found, try to clean and search by name
                                                                    if (!moveData) {
                                                                        const cleanedMoveName = move.startsWith('- ') ? move.substring(2) : move;
                                                                        const moveKey = cleanedMoveName.toLowerCase().replace(/[^a-z0-9]/g, '');
                                                                        moveId = moveKey;
                                                                        moveData = Moves[moveKey] || Object.values(Moves).find(m => m.name?.toLowerCase() === cleanedMoveName.toLowerCase());
                                                                    }
                                                                    if (!moveData)
                                                                        return null;
                                                                    return (_jsxs("li", { className: "flex items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-300 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md truncate", children: [_jsx("span", { className: "truncate", children: moveData.name || move }), moveData.type && (_jsx("span", { className: cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] shadow-sm transition-colors', typeColors[moveData.type] || 'bg-gray-400 text-white', 'border border-gray-300 dark:border-gray-600 ml-2', 'text-white font-normal'), children: moveData.type }))] }, i));
                                                                }) : _jsx("li", { className: "text-sm text-gray-500 dark:text-gray-400 italic", children: "Sin movimientos" }) })] }), _jsxs("div", { className: "flex flex-row gap-5 sm:gap-4 justify-between w-full", children: [_jsxs("div", { className: "w-full", children: [_jsx("strong", { className: "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 bg-zinc-100 dark:bg-zinc-800 py-1 px-2 rounded-lg text-center", children: "IVs" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map(stat => (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("span", { className: "text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5", children: stat.toUpperCase() }), _jsx("span", { className: "text-xs text-gray-600 dark:text-gray-400 font-semibold", children: (p.IVs && typeof p.IVs[stat] === 'number') ? p.IVs[stat] : 31 })] }, stat))) })] }), _jsxs("div", { className: "w-full", children: [_jsx("strong", { className: "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 bg-zinc-100 dark:bg-zinc-800 py-1 px-2 rounded-lg text-center", children: "EVs" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map(stat => (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("span", { className: "text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5", children: stat.toUpperCase() }), _jsx("span", { className: "text-xs text-gray-600 dark:text-gray-400 font-semibold", children: (p.EVs && typeof p.EVs[stat] === 'number') ? p.EVs[stat] : 0 })] }, stat))) })] })] })] })] }))] }, `${displayNickname}-${displaySpecies}-${idx}`));
                    }) }), currentTeam.length > 0 && initialLoadComplete && (_jsxs("div", { className: "w-full max-w-3xl mx-auto mt-10 mb-6", children: [_jsxs("button", { onClick: handleTogglePriceSummary, className: "w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-t-xl border border-gray-200 dark:border-gray-700 focus:outline-none transition-colors", "aria-expanded": isPriceSummaryExpanded, "aria-controls": "price-summary-content", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 dark:text-gray-100", children: "Resumen de Precios del Equipo" }), _jsx("span", { className: cn("transform transition-transform duration-200", isPriceSummaryExpanded ? "rotate-180" : "rotate-0"), children: "\u25BC" })] }), isPriceSummaryExpanded && totalPriceInfo && (_jsxs(motion.div, { id: "price-summary-content", initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3, ease: "easeInOut" }, className: "p-6 bg-white dark:bg-gray-800 rounded-b-xl shadow-xl border-x border-b border-gray-200 dark:border-gray-700 overflow-hidden", children: [_jsx("div", { className: "space-y-2.5 text-sm", children: (() => {
                                        let priceIdx = 0;
                                        return currentTeam.map((entry, idx) => {
                                            if ('type' in entry && entry.type === 'pack') {
                                                // Solo mostrar el pack, no los Pokémon individuales
                                                // Incrementar priceIdx por todos los Pokémon del pack para mantener sincronización
                                                priceIdx += entry.pokemons.length;
                                                return (_jsxs("div", { className: "flex justify-between items-center py-1.5 px-3 bg-blue-50 dark:bg-blue-900 rounded-md font-semibold", children: [_jsxs("span", { className: "text-blue-800 dark:text-blue-200", children: ["Pack: ", entry.packName] }), _jsx("span", { className: "font-bold text-blue-900 dark:text-blue-100", children: typeof entry.price === 'number' ? `$${entry.price.toLocaleString()}` : '-' })] }, `pack-${entry.packName}-${idx}`));
                                            }
                                            else if ('type' in entry && entry.type === 'homepack') {
                                                // HOME Pack entry
                                                return (_jsxs("div", { className: "flex justify-between items-center py-1.5 px-3 bg-purple-50 dark:bg-purple-900 rounded-md font-semibold", children: [_jsxs("span", { className: "text-purple-800 dark:text-purple-200", children: ["HOME Pack: ", entry.packName] }), _jsx("span", { className: "font-bold text-purple-900 dark:text-purple-100", children: typeof entry.price === 'number' ? `$${entry.price.toLocaleString()}` : '-' })] }, `homepack-${entry.packName}-${idx}`));
                                            }
                                            else {
                                                // Pokémon individual
                                                const p = entry;
                                                const price = pokemonPrices[priceIdx];
                                                priceIdx++;
                                                return (_jsxs("div", { className: "flex justify-between items-center py-1.5 px-3 bg-gray-50 dark:bg-gray-700 rounded-md", children: [_jsxs("span", { className: "text-gray-700 dark:text-gray-300", children: [p.name && p.name.toLowerCase() !== p.species.toLowerCase() ? p.name : p.species, p.isShiny ? _jsx("span", { className: "text-yellow-500 dark:text-yellow-400 ml-1", children: "(Shiny \u2728)" }) : ''] }), _jsx("span", { className: "font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2", children: p.caught ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "line-through text-gray-400", children: ["$", getPokemonOriginalPrice(p).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] }), _jsx("span", { className: "ml-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold", children: "Gratis" })] })) : (price !== undefined ? `$${price.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '-') })] }, `poke-${p.species}-${idx}`));
                                            }
                                        });
                                    })() }), _jsx("hr", { className: "my-4 border-gray-300 dark:border-gray-600" }), _jsxs("div", { className: "space-y-2 text-gray-700 dark:text-gray-300", children: [_jsxs("div", { className: "flex justify-between text-base font-semibold", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { className: "text-gray-900 dark:text-white", children: ["$", totalPriceInfo.subtotal.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] }), totalPriceInfo.discount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-red-600 dark:text-red-400", children: [_jsxs("span", { children: ["Descuento (", descuentos.porEquipoGrande.porcentajeDescuento, "% por equipo grande):"] }), _jsxs("span", { children: ["- $", totalPriceInfo.discount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] })), _jsx("hr", { className: "my-3 border-gray-300 dark:border-gray-600" }), _jsxs("div", { className: "flex justify-between text-xl font-bold text-gray-900 dark:text-white", children: [_jsx("span", { children: "Total Final:" }), _jsxs("span", { children: ["$", totalPriceInfo.final.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] })] })] }), _jsx("button", { className: "mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-150 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800", onClick: () => alert('Esta acción es solo demostrativa. ¡Gracias por revisar tu equipo!'), children: "Confirmar Equipo y Proceder" })] }))] }))] }) }));
}
// Componente tipo badge compacto para mostrar la cantidad de Pokémon y el precio total, en dos líneas
function TeamCountInfo({ team, totalPrice }) {
    // Contar solo Pokémon individuales (no los que están en packs)
    const individualPokemonCount = Array.isArray(team)
        ? team.filter(entry => !('type' in entry && (entry.type === 'pack' || entry.type === 'homepack'))).length
        : 0;
    // Contar solo packs (regular y HOME)
    const packCount = Array.isArray(team)
        ? team.filter(entry => 'type' in entry && entry.type === 'pack').length
        : 0;
    // Contar solo HOME packs
    const homePackCount = Array.isArray(team)
        ? team.filter(entry => 'type' in entry && entry.type === 'homepack').length
        : 0;
    // Total de elementos en el equipo (para mostrar botones)
    const totalTeamCount = individualPokemonCount + packCount + homePackCount;
    const navigate = useNavigate();
    const { clearPokemonTeam } = useGame(); // Importar clearPokemonTeam del contexto
    // Format price with thousands separator and no decimals
    const formatPrice = (value) => value.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    // Helper to format CLP currency consistently
    const formatCLP = (value) => value?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    // Handler for clearing the team (sin refrescar la página)
    const handleClearTeam = () => {
        if (window.confirm('¿Estás seguro de que quieres liberar a todos los Pokémon de tu equipo? Esta acción no se puede deshacer.')) {
            // Usar las funciones existentes para limpiar el estado del equipo
            clearPokemonTeam(); // Función del contexto que borra el array de Pokémon
            // Limpiar localStorage directamente
            localStorage.removeItem('pokemonTeamShowdownText');
            localStorage.removeItem('pokemonTeam');
            // No refrescar la página para mantener la música
            setTimeout(() => {
                // Opcional: mostrar un mensaje de confirmación
                import('../../lib/soundEffects').then(({ playSoundEffect }) => {
                    playSoundEffect('notification', 0.18);
                });
            }, 100);
        }
    };
    // Handler for adding more
    const handleAddMore = () => {
        navigate('/crear');
    };
    return (_jsxs("div", { className: "flex flex-col items-center mb-6 gap-2", children: [_jsxs("div", { className: "grid grid-cols-3 gap-2 w-full max-w-md", children: [_jsxs("span", { className: "inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium shadow-sm", children: [_jsx("span", { className: "text-[10px] opacity-75", children: "Pok\u00E9mon" }), _jsx("span", { className: "font-bold", children: individualPokemonCount })] }), _jsxs("span", { className: "inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium shadow-sm", children: [_jsx("span", { className: "text-[10px] opacity-75", children: "Packs" }), _jsx("span", { className: "font-bold", children: packCount })] }), _jsxs("span", { className: "inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium shadow-sm", children: [_jsx("span", { className: "text-[10px] opacity-75", children: "HOME" }), _jsx("span", { className: "font-bold", children: homePackCount })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 w-full max-w-md", children: [_jsxs("span", { className: "inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 text-xs font-medium shadow-sm", children: [_jsx("span", { className: "text-[10px] opacity-75", children: "Total" }), _jsxs("span", { className: "font-bold", children: ["$", formatPrice(totalPrice)] })] }), totalTeamCount > 0 ? (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleClearTeam, className: "inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 text-xs font-medium shadow-sm hover:bg-red-200 dark:hover:bg-red-800 transition-all focus:outline-none focus:ring-2 focus:ring-red-400", title: "Liberar todos los Pok\u00E9mon del equipo", children: [_jsx(Trash2, { size: 12 }), _jsx("span", { className: "text-[10px]", children: "Liberar" })] }), _jsxs("button", { onClick: handleAddMore, className: "inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 text-xs font-medium shadow-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400", title: "Agregar m\u00E1s Pok\u00E9mon al equipo", children: [_jsx(PlusSquare, { size: 12 }), _jsx("span", { className: "text-[10px]", children: "Agregar" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-xs font-medium shadow-sm opacity-50", children: [_jsx(Trash2, { size: 12 }), _jsx("span", { className: "text-[10px]", children: "Liberar" })] }), _jsxs("button", { onClick: handleAddMore, className: "inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 text-xs font-medium shadow-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400", title: "Agregar m\u00E1s Pok\u00E9mon al equipo", children: [_jsx(PlusSquare, { size: 12 }), _jsx("span", { className: "text-[10px]", children: "Agregar" })] })] }))] })] }));
}
// --- HomePackCardEquipo: Component for rendering a HOME pack card ---
function HomePackCardEquipo({ homePack, idx, handleDeletePokemon, }) {
    return (_jsxs(motion.div, { className: "w-full max-w-3xl bg-white bg-opacity-95 dark:bg-gray-100 dark:bg-opacity-95 rounded-xl shadow-xl p-0 overflow-hidden relative transition-all duration-300 border-4 border-blue-300 dark:border-blue-400 hover:shadow-2xl", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: idx * 0.05 }, children: [_jsx("div", { className: "absolute top-2 right-2 flex gap-1 z-20", children: _jsxs("button", { onClick: e => { e.stopPropagation(); handleDeletePokemon(idx); }, className: "flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-red-600 hover:text-red-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-red-400 dark:hover:text-red-500 text-[10px] font-medium shadow-sm hover:shadow transition-all focus:outline-none focus:ring-1 focus:ring-red-400 dark:focus:ring-red-500", title: "Eliminar HOME Pack", children: [_jsx(Trash2, { size: 12 }), _jsx("span", { className: "ml-0.5", children: "Eliminar" })] }) }), _jsxs("div", { className: "flex flex-row items-center gap-3 px-4 py-3 select-none", children: [_jsx("div", { className: "relative flex-shrink-0 flex items-center justify-center w-24 h-24", children: _jsx("div", { className: "w-full h-full bg-gradient-to-br from-yellow-4100 to-indigo-200 dark:from-purple-700 dark:to-indigo-800 rounded-lg flex items-center justify-center shadow-lg", children: _jsx("img", { src: 'src/img/logohome.png', alt: "Scarlet/Violet", className: "w-25 h-25 object-contain" }) }) }), _jsxs("div", { className: "flex flex-col flex-1 min-w-0", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "inline-flex items-center gap-1 text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate", children: _jsx("span", { className: "bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold mr-2", children: "HOME" }) }), _jsx("span", { className: "text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate mt-1", children: homePack.packName })] }), typeof homePack.price === 'number' && (_jsxs("span", { className: "inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold mt-2 px-2 py-0.5 min-w-0 w-fit", children: [_jsx(DollarSign, { size: 13, className: "mr-1 opacity-80" }), homePack.price.toLocaleString()] })), _jsx("div", { className: "mt-2 flex flex-col gap-1", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Entrenador:" }), _jsx("span", { className: "text-sm font-semibold text-gray-800 dark:text-gray-200", children: homePack.trainerName }), homePack.isShiny && (_jsx("span", { className: "inline-flex items-center px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium", children: "\u2728 Shiny" }))] }) })] })] })] }, `homepack-${homePack.packName}-${idx}`));
}
// --- PackCardEquipo: Child component for rendering a pack card with carousel logic ---
function PackCardEquipo({ pack, idx, expandedIndex, setExpandedIndex, handleDeletePokemon, currentTeam, pokemonPrices, handleExpandCard }) {
    const [packSpriteIndex, setPackSpriteIndex] = React.useState(0);
    const navigate = useNavigate();
    React.useEffect(() => {
        if (!pack.pokemons || pack.pokemons.length <= 1)
            return;
        const interval = setInterval(() => {
            setPackSpriteIndex(prev => (prev + 1) % pack.pokemons.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [pack.pokemons.length]);
    const packCurrentPoke = pack.pokemons[packSpriteIndex] || pack.pokemons[0];
    const packSpriteUrl = packCurrentPoke ? getSprite(packCurrentPoke, packCurrentPoke.isShiny) : undefined;
    const pokedexEntry = pack.pokemons[0] ? Pokedex[formatNameForPokedexLookup(pack.pokemons[0].species)] : undefined;
    const baseTypes = pokedexEntry?.types || ["Normal"];
    // Count all pokes so far for price index offset
    let priceOffset = 0;
    for (let i = 0; i < idx; ++i) {
        const e = currentTeam[i];
        if ('type' in e && e.type === 'pack')
            priceOffset += e.pokemons.length;
        else
            priceOffset += 1;
    }
    // Handler for editing a Pokémon inside a pack
    const handleEditPackPokemon = (packIdx, pokeIdx) => {
        const poke = pack.pokemons[pokeIdx];
        navigate('/ediciontarjeta', {
            state: {
                pokemonShowdownText: generateShowdownTextFromParsed(poke),
                editedPackIndex: idx, // index of the pack in currentTeam
                editedPackPokemonIndex: pokeIdx
            }
        });
    };
    return (_jsxs(motion.div, { className: cn("w-full max-w-3xl bg-white bg-opacity-95 dark:bg-gray-100 dark:bg-opacity-95 rounded-xl shadow-xl p-0 overflow-hidden relative transition-all duration-300 border-4 border-yellow-300 dark:border-yellow-400 hover:shadow-2xl", expandedIndex === idx ? "ring-2 ring-blue-400" : "cursor-pointer hover:shadow-2xl"), initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: idx * 0.05 }, onClick: () => handleExpandCard(idx), children: [_jsx("div", { className: "absolute top-2 right-2 flex gap-1 z-20", children: _jsxs("button", { onClick: e => { e.stopPropagation(); handleDeletePokemon(idx); }, className: "flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-red-600 hover:text-red-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-red-400 dark:hover:text-red-500 text-[10px] font-medium shadow-sm hover:shadow transition-all focus:outline-none focus:ring-1 focus:ring-red-400 dark:focus:ring-red-500", title: "Liberar Pack", children: [_jsx(Trash2, { size: 12 }), _jsx("span", { className: "ml-0.5", children: "Liberar" })] }) }), _jsxs("div", { className: "flex flex-row items-center gap-3 px-4 py-3 select-none", children: [_jsx("div", { className: "relative flex-shrink-0 flex items-center justify-center w-24 h-24", children: packSpriteUrl && (_jsxs(_Fragment, { children: [_jsx("img", { src: packSpriteUrl, alt: packCurrentPoke?.name || packCurrentPoke?.species || pack.packName, className: cn("w-full h-full object-contain filter", packCurrentPoke?.isShiny ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" : ""), title: packCurrentPoke?.isShiny ? "Shiny Pokémon ✨" : "", onError: (e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png') }), packCurrentPoke?.isShiny && (_jsx("div", { className: "w-6 h-6 absolute right-0 top-1 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center text-yellow-400 font-bold text-xs z-20 bg-white/90 dark:bg-gray-800/90", title: "Shiny Pok\u00E9mon \u2728", children: "\u2728" })), packCurrentPoke?.gender && packCurrentPoke.gender !== "N" && (_jsx("div", { className: cn("w-6 h-6 absolute right-0 transform -translate-y-1/2 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center text-white font-bold text-xs z-10", packCurrentPoke.gender === "M" ? "bg-blue-300" : "bg-pink-300", 
                                    // Adjust position based on whether shiny badge is present
                                    packCurrentPoke.isShiny ? "top-1/2" : "top-1/2"), title: packCurrentPoke.gender === "M" ? "Macho" : "Hembra", children: packCurrentPoke.gender === "M" ? "♂" : "♀" })), packCurrentPoke?.item && (_jsx("div", { className: cn("w-6 h-6 absolute right-0 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center z-10 bg-white/90 dark:bg-gray-800/90", 
                                    // Adjust position based on other badges
                                    packCurrentPoke.gender && packCurrentPoke.gender !== "N" ? "bottom-1" :
                                        packCurrentPoke.isShiny ? "bottom-1" : "bottom-1"), title: `Objeto: ${packCurrentPoke.item}`, children: (() => {
                                        const itemObj = items_sv.find(i => i.name.toLowerCase() === packCurrentPoke.item.toLowerCase());
                                        return itemObj?.sprite ? (_jsx("img", { src: itemObj.sprite, alt: itemObj.name, className: "w-4 h-4 object-contain" })) : (_jsx("span", { className: "text-[8px] font-bold text-gray-600 dark:text-gray-300", children: "\uD83D\uDCE6" }));
                                    })() }))] })) }), _jsxs("div", { className: "flex flex-col flex-1 min-w-0", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "inline-flex items-center gap-1 text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate", children: _jsx("span", { className: "bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold mr-2", children: "PACK" }) }), _jsx("span", { className: "text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate mt-1", children: pack.packName })] }), typeof pack.price === 'number' && (_jsxs("span", { className: "inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold mt-2 px-2 py-0.5 min-w-0 w-fit", children: [_jsx(DollarSign, { size: 13, className: "mr-1 opacity-80" }), pack.price.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })] }))] }), _jsx("div", { className: "ml-2 flex items-center", children: _jsx("span", { className: cn("w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-200 transition-transform hover:bg-gray-200 dark:hover:bg-gray-500 hover:text-gray-600 dark:hover:text-gray-100", expandedIndex === idx ? "rotate-180" : "rotate-0"), style: { fontSize: '0.75rem' }, children: "\u25BC" }) })] }), expandedIndex === idx && (_jsxs("div", { className: "px-4 pb-4 pt-1 animate-fade-in", children: [_jsx("div", { className: "mb-2 font-semibold text-gray-700 dark:text-gray-300", children: "Pok\u00E9mon en este pack:" }), _jsx("div", { className: "grid grid-cols-1 gap-3", children: pack.pokemons.map((poke, i) => {
                            const spriteUrl = getSprite(poke, poke.isShiny);
                            const pokedexEntry = Pokedex[formatNameForPokedexLookup(poke.species)];
                            const baseTypes = pokedexEntry?.types || ["Normal"];
                            // Price index for this poke
                            const priceIdx = priceOffset + i;
                            const itemObj = poke.item ? items_sv.find(item => item.name.toLowerCase() === poke.item.toLowerCase()) : null;
                            return (_jsxs("div", { className: "flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm", children: [_jsx("div", { className: "flex-shrink-0 w-12 h-12 flex items-center justify-center", children: spriteUrl && (_jsx("img", { src: spriteUrl, alt: poke.name || poke.species, className: cn("w-full h-full object-contain filter", poke.isShiny ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" : ""), title: poke.isShiny ? "Shiny Pokémon ✨" : "", onError: (e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png') })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-1 flex-wrap", children: [_jsx("span", { className: "font-bold text-gray-900 dark:text-white text-sm truncate", children: poke.name && poke.name.toLowerCase() !== poke.species.toLowerCase() ? poke.name : poke.species }), poke.isShiny && (_jsx("span", { className: "ml-1 text-yellow-400 text-lg pointer-events-none select-none drop-shadow-lg", children: "\u2728" })), itemObj && (_jsx("img", { src: itemObj.sprite, alt: itemObj.name, className: "w-5 h-5 ml-1 inline-block align-middle", title: itemObj.name, style: { verticalAlign: 'middle' } })), poke.hatched ? (_jsx("span", { className: "inline-flex items-center gap-1 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold ml-1", children: "ECLOSIONADO" })) : poke.caught ? (_jsx("span", { className: "inline-flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold ml-1", children: "ATRAPADO" })) : null] }), _jsx("div", { className: "flex flex-wrap gap-1 items-center mt-1", children: baseTypes.map((type) => (_jsx("span", { className: cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-normal shadow-sm transition-colors', typeColors[type] || 'bg-gray-400 text-white', 'border-gray-300 dark:border-gray-600', 'text-white'), children: type }, type))) })] }), _jsx("div", { className: "flex flex-col gap-1 ml-2", children: _jsxs("button", { onClick: e => {
                                                e.stopPropagation();
                                                if (poke.caught) {
                                                    alert('Los Pokémon atrapados no se pueden editar.');
                                                }
                                                else {
                                                    handleEditPackPokemon(idx, i);
                                                }
                                            }, className: cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium shadow-sm hover:shadow transition-all focus:outline-none focus:ring-1", poke.caught
                                                ? "bg-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:ring-gray-400 dark:focus:ring-gray-500"), title: poke.caught ? 'No puedes editar un Pokémon atrapado' : 'Editar', disabled: poke.caught, children: [_jsx(Pencil, { size: 12 }), !(poke.caught) && _jsx("span", { className: "ml-0.5", children: "Editar" })] }) })] }, i));
                        }) })] }))] }, `pack-${pack.packName}-${idx}`));
}
export default Equipo;
