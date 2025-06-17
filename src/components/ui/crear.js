import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/ui/search-bar';
import ShowdownTextarea from '@/components/ui/showdown-textarea';
import pokemonList from '@/data/sv/pokemon-sv.json';
import { generateShowdownTextFromParsed } from "../../lib/parseShowdown";
import './pokeball-anim.css';
import { addPokemonToTeam } from '@/lib/equipoStorage';
import { getPokemonTeam } from '@/lib/equipoStorage';
import { playSoundEffect } from '@/lib/soundEffects';
import { getShowdownCryUrl } from '@/lib/getShowdownCryUrl';
import { basepokemonData } from '../../data/sv/basepokemon';
import { isTransferOnly } from '../../data/sv/transfer-only';
// Función para determinar generación a partir del número de Pokédex
function getGeneration(numInput) {
    const num = typeof numInput === 'string' ? parseInt(numInput, 10) : numInput;
    if (num <= 151)
        return 1;
    if (num <= 251)
        return 2;
    if (num <= 386)
        return 3;
    if (num <= 493)
        return 4;
    if (num <= 649)
        return 5;
    if (num <= 721)
        return 6;
    if (num <= 809)
        return 7;
    if (num <= 898)
        return 8;
    return 9;
}
export default function Crear() {
    const navigate = useNavigate();
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [isSearchBarFocused, setIsSearchBarFocused] = useState(false);
    const [isShowdownTextareaFocused, setIsShowdownTextareaFocused] = useState(false);
    const [pokeAnimKey, setPokeAnimKey] = useState(0);
    const [isSpriteBouncing, setIsSpriteBouncing] = useState(false);
    const [showImportSuccess, setShowImportSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('crear');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLegal, setIsLegal] = useState(true);
    // Ref to manage the current cry audio
    const cryAudioRef = useRef(null);
    // Play Pokémon cry when selectedPokemon changes
    useEffect(() => {
        if (cryAudioRef.current) {
            cryAudioRef.current.pause();
            cryAudioRef.current.currentTime = 0;
            cryAudioRef.current = null;
        }
        if (selectedPokemon && selectedPokemon.name) {
            const cryUrl = getShowdownCryUrl(selectedPokemon.name);
            if (cryUrl) {
                const audio = new window.Audio(cryUrl);
                cryAudioRef.current = audio;
                audio.volume = 0.1;
                audio.addEventListener('loadedmetadata', () => {
                    if (audio.duration && !isNaN(audio.duration)) {
                        audio.currentTime = audio.duration * 0.2;
                    }
                    audio.play();
                });
                setTimeout(() => {
                    if (audio.paused)
                        audio.play();
                }, 500);
            }
        }
        setPokeAnimKey(k => k + 1);
    }, [selectedPokemon]);
    const showdownEntries = basepokemonData.split(/\n(?=[A-Z][^\n]*\nAbility:)/g).filter(Boolean);
    const renderTransferOnlyWarning = () => {
        if (!isLegal) {
            return _jsx("div", { className: "warning", children: "Este Pok\u00E9mon es transfer-only y no puede ser creado." });
        }
    };
    const handleSelect = (name) => {
        if (!name) {
            setSelectedPokemon(null);
            setIsLegal(true);
        }
        else {
            const p = pokemonList.find(p => p.name.toLowerCase() === name.toLowerCase() || p.id === name) || null;
            setSelectedPokemon(p);
            // Solo permitir selección si está en la lista de disponibles
            setIsLegal(!!p);
        }
    };
    // Nueva función: validar legalidad solo al intentar crear/editar
    const validatePokemonLegality = (pokemon, shiny) => {
        // Solo bloquear si la combinación está en transfer-only
        if (isTransferOnly(pokemon.name, shiny)) {
            alert(`La combinación ${pokemon.name} ${shiny ? 'shiny' : 'normal'} no es legal para crear/importar en este formato.`);
            return false;
        }
        return true;
    };
    const handleCreate = () => {
        if (!selectedPokemon)
            return;
        // Validar legalidad aquí antes de navegar
        // Puedes agregar más lógica si el usuario elige shiny desde la UI
        const shiny = false; // O el valor real según la UI
        if (!validatePokemonLegality(selectedPokemon, shiny))
            return;
        navigate('/edicion', { state: { pokemon: selectedPokemon } });
    };
    const handleSearchBarFocus = () => {
        playSoundEffect('notification', 0.1); // Sonido al enfocar el search bar
        setIsSearchBarFocused(true);
        setIsShowdownTextareaFocused(false); // Explicitly set other to false
    };
    const handleSearchBarBlur = () => {
        // When SearchBar blurs, it's no longer focused.
        // If ShowdownTextarea gets focus next, its onFocus handler will manage the state.
        setIsSearchBarFocused(false);
    };
    const handleShowdownTextareaFocus = () => {
        playSoundEffect('notification', 0.1); // Sonido al enfocar la caja de showdown
        setIsShowdownTextareaFocused(true);
        setIsSearchBarFocused(false); // Explicitly set other to false
    };
    const handleShowdownTextareaBlur = () => {
        // When ShowdownTextarea blurs, it's no longer focused.
        // If SearchBar gets focus next, its onFocus handler will manage the state.
        setIsShowdownTextareaFocused(false);
    };
    // Handler para crear desde showdown
    function handleCreateShowdown(parsedEntries) {
        if (!parsedEntries || parsedEntries.length === 0) {
            console.warn("Crear.tsx: handleCreateShowdown called with no parsed entries.");
            return;
        }
        // Play levelup sound
        const audio = new window.Audio('/src/sounds/sfx/levelup.mp3');
        audio.volume = 0.18;
        audio.play();
        // Show import success animation
        setShowImportSuccess(true);
        setTimeout(() => setShowImportSuccess(false), 1500);
        const teamPokemons = parsedEntries.map(entry => entry.pokemon);
        const importMessages = parsedEntries.flatMap(entry => entry.messages);
        // For debugging:
        if (importMessages.length > 0) {
            console.log("Crear.tsx: Import messages from parseShowdown:", importMessages);
            // Here you could also use a toast notification system to display messages to the user immediately
            // For example: importMessages.forEach(msg => toast.info(msg));
        }
        // Ensure imported Pokémon items are preserved
        teamPokemons.forEach(pokemon => {
            if (!pokemon.item) {
                // Removed logic that assigns "Ability Patch" as a default item
            }
        });
        if (teamPokemons.length === 1) {
            // Un solo Pokémon: agregar al equipo existente usando el contexto
            if (typeof addPokemonToTeam === 'function') {
                addPokemonToTeam(teamPokemons[0]);
            }
            else {
                console.error("addPokemonToTeam is not a function");
            }
            // Guardar el texto Showdown del equipo completo (solo para exportar)
            // Get the updated team after adding the new Pokémon
            const updatedTeam = getPokemonTeam();
            localStorage.setItem('pokemonTeamShowdownText', teamToShowdownText(updatedTeam));
            // Navigate to /equipo
            navigate('/equipo', { state: { importMessages: importMessages } });
        }
        else if (teamPokemons.length > 1) {
            // Varios Pokémon: agregar todos al equipo existente usando el contexto
            if (typeof addPokemonToTeam === 'function') {
                for (const pokemon of teamPokemons) {
                    addPokemonToTeam(pokemon);
                }
            }
            else {
                console.error("addPokemonToTeam is not a function");
            }
            // Guardar el texto Showdown del equipo completo (solo para exportar)
            const updatedTeam = getPokemonTeam();
            localStorage.setItem('pokemonTeamShowdownText', teamToShowdownText(updatedTeam));
            navigate('/equipo', { state: { importMessages: importMessages } });
        }
    }
    // Handler para ir a la sección de packs
    const goToPacks = () => navigate('/packs');
    // Derived state for visibility
    const actualShowWelcomeAndSearch = !isShowdownTextareaFocused;
    const actualShowShowdown = isShowdownTextareaFocused || (!isSearchBarFocused && !selectedPokemon);
    // Function to play sound on saving/importing a Pokémon
    const playSaveSound = () => {
        const audio = new Audio('/src/sounds/sfx/pokeballcatch.mp3');
        audio.play().catch(error => console.error("Error playing pokeballcatch.mp3:", error));
    };
    return (_jsxs("div", { className: `flex flex-col items-center px-4 pt-2 text-center${isSearchBarFocused ? ' pb-72' : ''}`, children: [showImportSuccess && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/30 pointer-events-none", children: _jsxs("div", { className: "flex flex-col items-center animate-fade-in-down", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: "/pokeball.png", alt: "Pokeball", className: "w-24 h-24 animate-bounce" }), _jsx("span", { className: "absolute right-0 bottom-0 bg-green-500 text-white rounded-full p-2 shadow-lg text-3xl border-4 border-white", children: "\u2714" })] }), _jsx("span", { className: "mt-2 text-lg font-bold text-green-600 drop-shadow-lg", children: "\u00A1Importado con \u00E9xito!" })] }) })), _jsxs("div", { className: "flex justify-center gap-2 mb-6", children: [_jsxs("button", { className: `w-28 text-sm px-2 py-2 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === 'crear' ? 'bg-white/80 dark:bg-gray-900/80 border-yellow-400 text-yellow-600' : 'bg-gray-200/70 dark:bg-gray-700/70 border-transparent text-gray-700 dark:text-gray-300'}`, onClick: () => { playSoundEffect('notification', 0.13); setActiveTab('crear'); }, children: [_jsx("span", { children: "Crear" }), _jsx("span", { className: "block text-[11px] font-normal", children: "Pok\u00E9mon" })] }), _jsxs("button", { className: `w-28 text-sm px-2 py-2 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === 'showdown' ? 'bg-white/80 dark:bg-gray-900/80 border-blue-400 text-blue-600' : 'bg-gray-200/70 dark:bg-gray-700/70 border-transparent text-gray-700 dark:text-gray-300'}`, onClick: () => { playSoundEffect('notification', 0.13); setActiveTab('showdown'); }, children: [_jsx("span", { children: "Importar" }), _jsx("span", { className: "block text-[11px] font-normal", children: "Showdown" })] }), _jsxs("button", { className: `w-28 text-sm px-2 py-2 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === 'packs' ? 'bg-white/80 dark:bg-gray-900/80 border-pink-400 text-pink-600' : 'bg-gray-200/70 dark:bg-gray-700/70 border-transparent text-gray-700 dark:text-gray-300'}`, onClick: () => { playSoundEffect('notification', 0.13); setActiveTab('packs'); }, children: [_jsx("span", { children: "Packs" }), _jsx("span", { className: "block text-[11px] font-normal", children: "y Eventos" })] })] }), activeTab === 'crear' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-center w-full my-2", children: [_jsx("hr", { className: "flex-grow border-t border-gray-300" }), _jsx("img", { src: "/pokeball.png", alt: "Pokeball", className: "mx-2 w-6 h-6" }), _jsx("hr", { className: "flex-grow border-t border-gray-300" })] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "Crear Pok\u00E9mon" }), _jsx("p", { className: "text-xs sm:text-sm text-gray-500 mb-2", children: "Ingresa el nombre del Pok\u00E9mon que quieres crear en la barra de b\u00FAsqueda" }), _jsxs("div", { className: `w-full max-w-xs sm:max-w-md flex flex-col justify-start mt-2 ${selectedPokemon ? 'min-h-[220px]' : 'min-h-[60px]'}`, children: [selectedPokemon && (_jsxs("div", { className: "flex flex-col items-center justify-center mb-2 min-h-[160px]", children: [_jsxs("div", { className: "pokeball-flash-anim-container", style: { width: 140, height: 140 }, children: [_jsx("img", { src: "/pokeball.png", alt: "Pokeball", className: "pokeball-flash", draggable: false, style: { width: 70, height: 70 } }), _jsx("img", { src: getSpriteForSelectedPokemon(selectedPokemon), alt: selectedPokemon.name, className: "pokemon-sprite-pop", draggable: false, style: { width: '220px', height: '220px' }, onClick: () => {
                                                    if (cryAudioRef.current) {
                                                        cryAudioRef.current.pause();
                                                        cryAudioRef.current.currentTime = 0;
                                                        cryAudioRef.current.play().catch(() => { });
                                                    }
                                                    else if (selectedPokemon && selectedPokemon.name) {
                                                        const cryUrl = getShowdownCryUrl(selectedPokemon.name);
                                                        if (cryUrl) {
                                                            const audio = new window.Audio(cryUrl);
                                                            cryAudioRef.current = audio;
                                                            audio.volume = 0.1;
                                                            audio.addEventListener('loadedmetadata', () => {
                                                                if (audio.duration && !isNaN(audio.duration)) {
                                                                    audio.currentTime = audio.duration * 0.2;
                                                                }
                                                                audio.play();
                                                            });
                                                            setTimeout(() => {
                                                                if (audio.paused)
                                                                    audio.play();
                                                            }, 500);
                                                        }
                                                    }
                                                } })] }, pokeAnimKey), _jsxs("div", { className: "flex flex-col items-center mt-1", children: [_jsx("h3", { className: "text-gray-800 font-bold capitalize text-lg sm:text-2xl mb-0.5", children: selectedPokemon.name }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full", children: ["#", selectedPokemon.num] }), _jsxs("span", { className: "px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full", children: ["Gen ", getGeneration(selectedPokemon.num)] })] })] })] })), _jsx(SearchBar, { placeholder: "Busca un Pok\u00E9mon", onSelect: handleSelect, onCreate: handleCreate, onFocus: () => { handleSearchBarFocus(); setIsDropdownOpen(true); }, onBlur: () => { handleSearchBarBlur(); setIsDropdownOpen(false); }, autoFocus: isSearchBarFocused })] })] })), activeTab === 'showdown' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-center w-full my-2", children: [_jsx("hr", { className: "flex-grow border-t border-gray-300" }), _jsx("img", { src: "/pokeball.png", alt: "Pokeball", className: "mx-2 w-6 h-6" }), _jsx("hr", { className: "flex-grow border-t border-gray-300" })] }), _jsx("h2", { className: "text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "Importar desde Showdown" }), _jsx("p", { className: "text-xs sm:text-sm text-gray-500 mb-2", children: "Pega aqu\u00ED el texto de tu equipo exportado desde Pok\u00E9mon Showdown" }), _jsx(ShowdownTextarea, { placeholder: "Pega aqu\u00ED el texto de tus Pok\u00E9mon", className: "w-full max-w-xs sm:max-w-md mb-0", onFocus: handleShowdownTextareaFocus, onBlur: handleShowdownTextareaBlur, onCreateShowdown: handleCreateShowdown })] })), activeTab === 'packs' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-center w-full my-2", children: [_jsx("hr", { className: "flex-grow border-t border-gray-300" }), _jsx("img", { src: "/pokeball.png", alt: "Pokeball", className: "mx-2 w-6 h-6" }), _jsx("hr", { className: "flex-grow border-t border-gray-300" })] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "Packs y Colecciones" }), _jsx("p", { className: "text-xs sm:text-sm text-gray-500 mb-2", children: "\u00A1Explora paquetes completos de Pok\u00E9mon para completar tu colecci\u00F3n o tu Pok\u00E9dex en el juego o en HOME! Tambi\u00E9n descubre los Pok\u00E9mon de eventos m\u00E1s buscados y raros." }), _jsx("div", { className: "mb-6" }), _jsxs("div", { className: "flex flex-row gap-4 max-w-2xl mx-auto mb-10 justify-center items-center", children: [_jsx("button", { onClick: () => {
                                    playSoundEffect('notification', 0.1);
                                    navigate('/paquetes');
                                }, className: "flex items-center justify-center px-4 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 w-[170px] h-[60px]", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("span", { className: "font-bold text-sm", children: "Packs" }), _jsx("span", { className: "text-xs text-white/80", children: "Colecciones" })] }) }), _jsx("button", { onClick: () => {
                                    playSoundEffect('notification', 0.1);
                                    navigate('/pokemonevents');
                                }, className: "flex items-center justify-center px-4 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 w-[175px] h-[60px]", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx("span", { className: "font-bold text-sm", children: "Eventos" }), _jsx("span", { className: "text-xs text-white/80", children: "Los m\u00E1s buscados" })] }) })] })] }))] }));
}
// Helpers para showdown text
// We're using the imported generateShowdownTextFromParsed function from parseShowdown.ts
function teamToShowdownText(team) {
    return team.map(generateShowdownTextFromParsed).join("\n\n");
}
// Copia local de la función getSpriteForSearchBar para sprites correctos en la pantalla de creación
function getSpriteForSelectedPokemon(pokemon) {
    const name = pokemon.name.toLowerCase();
    // 1. Oricorio y formas (baile, pom-pom, pau, sensu) y Jangmo-o, Hakamo-o, Kommo-o usan artwork/avif
    // Casos especiales para Oricorio formas: Pokemondb usa pau en vez de pa'u
    if (name.startsWith('oricorio')) {
        let artworkName = name;
        if (artworkName === 'oricorio-pa\'u' || artworkName === 'oricorio-pa’u' || artworkName === 'oricorio-pa’u') {
            artworkName = 'oricorio-pau';
        }
        return `https://img.pokemondb.net/artwork/avif/${artworkName}.avif`;
    }
    if (name === 'jangmo-o' || name === 'hakamo-o' || name === 'kommo-o') {
        return `https://img.pokemondb.net/artwork/avif/${name}.avif`;
    }
    // 2. Formas regionales artwork grande
    if (/-galar(ian)?$/.test(name)) {
        return `https://img.pokemondb.net/artwork/large/${name.replace(/-galar(ian)?$/, '-galarian')}.jpg`;
    }
    if (/-alola(n)?$/.test(name)) {
        return `https://img.pokemondb.net/artwork/large/${name.replace(/-alola(n)?$/, '-alolan')}.jpg`;
    }
    if (/-hisui(an)?$/.test(name)) {
        return `https://img.pokemondb.net/artwork/large/${name.replace(/-hisui(an)?$/, '-hisuian')}.jpg`;
    }
    if (/-paldea(n)?$/.test(name)) {
        return `https://img.pokemondb.net/artwork/large/${name.replace(/-paldea(n)?$/, '-paldean')}.jpg`;
    }
    // 3. Sprite del JSON SIEMPRE que exista (prioridad máxima)
    if (pokemon.sprite)
        return pokemon.sprite;
    // 4. Fallback: sprite home/normal
    let fallback = name
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/[.'’:]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-cap$/g, '-cap')
        .replace(/-original$/g, '-original')
        .replace(/-partner$/g, '-partner')
        .replace(/-world$/g, '-world');
    return `https://img.pokemondb.net/sprites/home/normal/${fallback}.png`;
}
// Helper para obtener el sprite correcto, usando el campo sprite del JSON si existe, o generando la URL robustamente
export function getSpriteForPokemon(pokemon) {
    const name = pokemon.name.toLowerCase();
    // 1. Oricorio y formas (baile, pom-pom, pau, sensu) y Jangmo-o, Hakamo-o, Kommo-o usan artwork/avif
    if (name.startsWith('oricorio')) {
        let artworkName = name;
        if (artworkName === 'oricorio-pa\'u' || artworkName === 'oricorio-pa’u' || artworkName === 'oricorio-pa’u') {
            artworkName = 'oricorio-pau';
        }
        return `https://img.pokemondb.net/artwork/avif/${artworkName}.avif`;
    }
    if (name === 'jangmo-o' || name === 'hakamo-o' || name === 'kommo-o') {
        return `https://img.pokemondb.net/artwork/avif/${name}.avif`;
    }
    // 2. Formas regionales artwork grande
    if (/-galar(ian)?$/.test(name)) {
        return `https://img.pokemondb.net/artwork/large/${name.replace(/-galar(ian)?$/, '-galarian')}.jpg`;
    }
    if (/-alola(n)?$/.test(name)) {
        return `https://img.pokemondb.net/artwork/large/${name.replace(/-alola(n)?$/, '-alolan')}.jpg`;
    }
    if (/-hisui(an)?$/.test(name)) {
        return `https://img.pokemondb.net/artwork/large/${name.replace(/-hisui(an)?$/, '-hisuian')}.jpg`;
    }
    if (/-paldea(n)?$/.test(name)) {
        return `https://img.pokemondb.net/artwork/large/${name.replace(/-paldea(n)?$/, '-paldean')}.jpg`;
    }
    // 3. Sprite del JSON SIEMPRE que exista (prioridad máxima)
    if (pokemon.sprite)
        return pokemon.sprite;
    // 4. Fallback: sprite home/normal
    let fallback = name
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/[.'’:]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-cap$/g, '-cap')
        .replace(/-original$/g, '-original')
        .replace(/-partner$/g, '-partner')
        .replace(/-world$/g, '-world');
    return `https://img.pokemondb.net/sprites/home/normal/${fallback}.png`;
}
