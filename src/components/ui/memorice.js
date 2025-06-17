import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import pokemonList from '@/data/sv/pokemon-sv.json';
import { getUserPokeballs, setUserPokeballs } from './pokeballs';
import levelUpSoundFile from '../../sounds/sfx/levelup.mp3';
import nothingSoundFile from '../../sounds/sfx/nothing.mp3';
import memoriceSoundFile from '../../sounds/sfx/memorice.mp3';
import './memorice-animations.css';
// Filtered list of Pokémon without hyphens in their names
const simplePokemonList = pokemonList.filter(pokemon => !pokemon.name.includes('-'));
const getRandomElements = (arr, n) => {
    const copy = [...arr];
    const result = [];
    while (result.length < n && copy.length) {
        const idx = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
};
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
const getCardData = () => {
    // Solo Pokémon (10 pares) - usar solo Pokémon sin guiones
    const pokemons = getRandomElements(simplePokemonList, 10).map(p => ({
        type: 'pokemon',
        name: p.name,
        img: `https://img.pokemondb.net/sprites/home/normal/${p.name.toLowerCase().replace(/♀/g, '-f').replace(/♂/g, '-m').replace(/[.'':]/g, '').replace(/\s+/g, '-')}.png`
    }));
    // Duplicar y mezclar para crear pares
    return shuffle([...pokemons, ...pokemons].map((card, i) => ({ ...card, id: i })));
};
export default function Memorice() {
    const { user, triggerFichasUpdate } = useUser();
    const [cards, setCards] = useState(getCardData());
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [errors, setErrors] = useState(0);
    const [pokeballs, setPokeballs] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    // Reproducir música de fondo al 3%
    useEffect(() => {
        const memoriceAudio = new Audio(memoriceSoundFile);
        memoriceAudio.volume = 0.03; // 3% de volumen
        memoriceAudio.loop = true;
        // Intentar reproducir después de una interacción del usuario
        const playAudio = () => {
            memoriceAudio.play().catch(error => console.log("Autoplay blocked, music will start after user interaction"));
        };
        // Intentar reproducir inmediatamente
        playAudio();
        // Si falla, intentar después del primer click
        const handleFirstInteraction = () => {
            playAudio();
            document.removeEventListener('click', handleFirstInteraction);
        };
        document.addEventListener('click', handleFirstInteraction);
        return () => {
            memoriceAudio.pause();
            memoriceAudio.src = '';
            document.removeEventListener('click', handleFirstInteraction);
        };
    }, []);
    const addPokeballsToUser = async (amount) => {
        try {
            const currentPokeballs = await getUserPokeballs();
            const newPokeballs = { ...currentPokeballs };
            newPokeballs.pokeball = (newPokeballs.pokeball || 0) + amount;
            await setUserPokeballs(newPokeballs);
        }
        catch (error) {
            console.error('Error adding pokeballs:', error);
        }
    };
    const addMasterBallToUser = async () => {
        try {
            const currentPokeballs = await getUserPokeballs();
            const newPokeballs = { ...currentPokeballs };
            newPokeballs.masterball = (newPokeballs.masterball || 0) + 1;
            await setUserPokeballs(newPokeballs);
        }
        catch (error) {
            console.error('Error adding master ball:', error);
        }
    };
    useEffect(() => {
        if (matched.length === 20) {
            setWin(true);
            addMasterBallToUser();
        }
        if (errors >= 3)
            setGameOver(true);
    }, [matched, errors]);
    const handleFlip = idx => {
        if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx) || gameOver || win)
            return;
        setFlipped(f => [...f, idx]);
    };
    useEffect(() => {
        if (flipped.length === 2) {
            const [i1, i2] = flipped;
            if (cards[i1].name === cards[i2].name && i1 !== i2) {
                // Par correcto - sonido de acierto
                const levelUpAudio = new Audio(levelUpSoundFile);
                levelUpAudio.volume = 0.4;
                levelUpAudio.play().catch(error => console.log("Error playing level up sound:", error));
                setTimeout(() => {
                    setMatched(m => [...m, i1, i2]);
                    setFlipped([]);
                    setPokeballs(p => {
                        const newTotal = p + 3;
                        addPokeballsToUser(3);
                        return newTotal;
                    });
                }, 700);
            }
            else {
                // Par incorrecto - sonido de error
                const nothingAudio = new Audio(nothingSoundFile);
                nothingAudio.volume = 0.4;
                nothingAudio.play().catch(error => console.log("Error playing nothing sound:", error));
                setTimeout(() => {
                    setFlipped([]);
                    setErrors(e => e + 1);
                }, 900);
            }
        }
    }, [flipped, cards]);
    const handleRestart = () => {
        setCards(getCardData());
        setFlipped([]);
        setMatched([]);
        setErrors(0);
        setPokeballs(0);
        setGameOver(false);
        setWin(false);
    };
    return (_jsxs("div", { className: "min-h-screen relative overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 opacity-10", children: [_jsx("div", { className: "absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" }), _jsx("div", { className: "absolute top-3/4 right-1/4 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000" }), _jsx("div", { className: "absolute bottom-1/4 left-1/2 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000" })] }), _jsxs("div", { className: "relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent", children: "\uD83E\uDDE0 MEMORICE \uD83C\uDFAF" }), _jsxs("div", { className: "text-center mb-6", children: [_jsxs("p", { className: "text-sm text-gray-600 max-w-md", children: ["Encuentra los ", _jsx("span", { className: "text-yellow-600 font-bold", children: "10 pares de Pok\u00E9mon" }), " \uD83C\uDFAE"] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [_jsx("span", { className: "text-pink-600 font-bold", children: "3 Pok\u00E9balls" }), " por par \u2022", _jsx("span", { className: "text-cyan-600 font-bold", children: " Master Ball" }), " si completas sin errores \uD83C\uDFC6"] }), _jsxs("div", { className: "mt-2 text-xs text-red-600", children: ["\u26A0\uFE0F M\u00E1ximo ", _jsx("span", { className: "font-bold", children: "3 errores" })] })] }), _jsxs("div", { className: "flex justify-center space-x-4 mb-6", children: [_jsxs("div", { className: "bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-pink-200/50", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-pink-600", children: "\u26AA" }), _jsx("span", { className: "font-semibold text-gray-700", children: pokeballs })] }), _jsx("div", { className: "text-center text-gray-500 text-xs mt-1", children: "Pok\u00E9balls" })] }), _jsxs("div", { className: "bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-red-200/50", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-red-600", children: "\u274C" }), _jsxs("span", { className: "font-semibold text-gray-700", children: [errors, " / 3"] })] }), _jsx("div", { className: "text-center text-gray-500 text-xs mt-1", children: "Errores" })] }), _jsxs("div", { className: "bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-green-200/50", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { className: "text-green-600", children: "\u2705" }), _jsxs("span", { className: "font-semibold text-gray-700", children: [matched.length / 2, " / 10"] })] }), _jsx("div", { className: "text-center text-gray-500 text-xs mt-1", children: "Pares" })] })] }), _jsx("div", { className: "grid grid-cols-4 gap-2 sm:gap-3 sm:grid-cols-5 lg:gap-4 max-w-5xl mx-auto mb-6", children: cards.map((card, idx) => {
                            const isFlipped = flipped.includes(idx) || matched.includes(idx) || gameOver || win;
                            const isMatched = matched.includes(idx);
                            const isCurrentlyFlipped = flipped.includes(idx) && !isMatched;
                            return (_jsxs("button", { className: `
                  group relative overflow-hidden
                  w-20 h-28 sm:w-24 sm:h-32 lg:w-28 lg:h-36
                  rounded-xl shadow-lg border-2
                  transform transition-all duration-300 ease-out
                  hover:scale-105 hover:shadow-lg hover:-translate-y-1
                  focus:outline-none focus:ring-2 focus:ring-blue-400/50
                  ${isFlipped
                                    ? isMatched
                                        ? 'border-green-400 bg-green-50 scale-95'
                                        : 'border-blue-400 bg-blue-50 scale-105'
                                    : 'border-gray-300 bg-white hover:border-blue-300'}
                  ${isMatched ? 'cursor-default' : 'cursor-pointer'}
                  disabled:cursor-not-allowed
                `, onClick: () => handleFlip(idx), disabled: isFlipped || gameOver || win, children: [_jsx("div", { className: "relative z-10 flex flex-col items-center justify-center p-2 h-full", children: isFlipped ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-1 w-full", children: _jsx("img", { src: card.img, alt: card.name, className: "w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 object-contain", draggable: false }) }), _jsx("div", { className: "mt-0.5 px-0.5 py-0.5 bg-gray-100 rounded text-center w-full", children: _jsx("span", { className: "text-[10px] sm:text-xs font-medium text-gray-700 leading-none block", children: card.name }) })] })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-full", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-md border-2 border-white flex items-center justify-center group-hover:animate-pulse", children: _jsx("div", { className: "w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 rounded-full bg-white" }) }), _jsx("div", { className: "absolute inset-x-0 top-1/2 h-0.5 bg-white rounded-full transform -translate-y-0.5" })] }), _jsxs("div", { className: "mt-2 flex space-x-1", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" }), _jsx("div", { className: "w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse animation-delay-200" }), _jsx("div", { className: "w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse animation-delay-400" })] })] })) }), isCurrentlyFlipped && (_jsx("div", { className: "absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border border-white flex items-center justify-center", children: _jsx("span", { className: "text-white text-xs", children: "\u2713" }) })), isMatched && (_jsx("div", { className: "absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border border-white flex items-center justify-center animate-pulse", children: _jsx("span", { className: "text-white text-xs", children: "\u2713" }) }))] }, idx));
                        }) }), _jsxs("div", { className: "text-center", children: [win && (_jsxs("div", { className: "mb-6 p-6 bg-green-50 rounded-2xl border border-green-200 shadow-md max-w-md mx-auto", children: [_jsx("div", { className: "text-4xl mb-3 animate-bounce", children: "\uD83C\uDF89" }), _jsx("h3", { className: "text-2xl font-bold text-green-600 mb-2", children: "\u00A1VICTORIA \u00C9PICA!" }), _jsxs("p", { className: "text-sm text-green-700", children: ["Master Ball desbloqueada + ", pokeballs, " Pok\u00E9balls ganadas"] })] })), gameOver && !win && (_jsxs("div", { className: "mb-6 p-6 bg-red-50 rounded-2xl border border-red-200 shadow-md max-w-md mx-auto", children: [_jsx("div", { className: "text-4xl mb-3", children: "\uD83D\uDCA5" }), _jsx("h3", { className: "text-2xl font-bold text-red-600 mb-2", children: "GAME OVER" }), _jsxs("p", { className: "text-sm text-red-700", children: [pokeballs, " Pok\u00E9balls ganadas \u2022 \u00A1Int\u00E9ntalo de nuevo!"] })] })), (gameOver || win) && (_jsx("button", { className: "group relative px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-400/20", onClick: handleRestart, children: _jsx("span", { className: "relative z-10 flex items-center gap-2", children: "\uD83D\uDD04 NUEVA PARTIDA" }) })), !gameOver && !win && matched.length > 0 && (_jsx("div", { className: "text-blue-600 font-medium animate-pulse", children: "\uD83D\uDD25 \u00A1Vas genial! Sigue encontrando los pares" }))] })] })] }));
}
