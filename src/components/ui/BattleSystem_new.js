import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { playSoundEffect } from '@/lib/soundEffects';
import { getPokemonIconUrl } from '../../utils/pokemonSprites';
import { calcularTapsObjetivo, calcularTiempoBase, obtenerPokemonActual, obtenerNombreOponente, esUltimoPokemon } from './battleUtils';

// Función para obtener URL de audio desde soundEffects
const getAudioUrl = (key) => {
  const soundEffectUrls = {
    gymbattle: 'https://www.dropbox.com/scl/fi/qmr61ipkl3pqhxb88ojul/gymbattle.mp3?rlkey=z64xxr230pdwyc6hw04g0g476&st=su3gd1e5&dl=1',
    trainerbattle: 'https://www.dropbox.com/scl/fi/xy9ghyc0mcrpbn2aft4z7/trainerbattle.mp3?rlkey=pfqy1b99mzvl3rk7oespt8hp6&st=dzde7u7s&dl=1',
  };
  return soundEffectUrls[key];
};

// Componente principal del sistema de combate
const BattleSystem = ({ gimnasioActual, entrenadorActual, pokemonActual, combatienteActual, tipoSeleccionado, gimnasios, onVictoria, onDerrota, onVolverAlGimnasio, estado }) => {
    // Estados del combate
    const [tapsAcumulados, setTapsAcumulados] = useState(0);
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [combateEnCurso, setCombateEnCurso] = useState(false);
    const [ataqueInminente, setAtaqueInminente] = useState(false);
    // Estados para las animaciones de batalla
    const [faseAnimacion, setFaseAnimacion] = useState('intro'); // 'intro', 'pokeball', 'pokemon', 'countdown', 'battle', 'victory', 'transition'
    const [cuentaRegresiva, setCuentaRegresiva] = useState(3);
    const [pokemonFainted, setPokemonFainted] = useState(false);
    const [trainerData, setTrainerData] = useState(null);
    const [isLeaderBattle, setIsLeaderBattle] = useState(false);
    // Referencias
    const tapsAcumuladosRef = useRef(tapsAcumulados);
    const combateEnCursoRef = useRef(combateEnCurso);
    // Actualizar referencias
    useEffect(() => {
        tapsAcumuladosRef.current = tapsAcumulados;
        combateEnCursoRef.current = combateEnCurso;
    });
    // Función para limpiar timers
    const limpiarTimers = () => {
        if (window.currentIntervals) {
            const { ataqueInterval, timerInterval } = window.currentIntervals;
            if (ataqueInterval)
                clearInterval(ataqueInterval);
            if (timerInterval)
                clearInterval(timerInterval);
            window.currentIntervals = null;
        }
    };
    // Frases aleatorias del entrenador
    const getTrainerPhrase = (isLeader) => {
        const frases = isLeader ? [
            "¡No podrás contra mis Pokémon!",
            "¡Me he preparado mucho para convertirme en líder!",
            "¡Veamos si tienes lo necesario para vencerme!"
        ] : [
            "¡No creas que será fácil!",
            "¡Mis Pokémon no se rendirán sin pelear!",
            "¡Veamos de qué estás hecho!"
        ];
        return frases[Math.floor(Math.random() * frases.length)];
    };
    // Función de efectividad de tipos
    const calcularEfectividad = (tipoAtacante, tipoDefensor) => {
        const efectividades = {
            'Normal': { fuerte: [], debil: ['Roca', 'Acero'], inmune: ['Fantasma'] },
            'Fuego': { fuerte: ['Planta', 'Hielo', 'Bicho', 'Acero'], debil: ['Fuego', 'Agua', 'Roca', 'Dragón'], inmune: [] },
            'Agua': { fuerte: ['Fuego', 'Tierra', 'Roca'], debil: ['Agua', 'Planta', 'Dragón'], inmune: [] },
            'Eléctrico': { fuerte: ['Agua', 'Volador'], debil: ['Eléctrico', 'Planta', 'Dragón'], inmune: ['Tierra'] },
            'Planta': { fuerte: ['Agua', 'Tierra', 'Roca'], debil: ['Fuego', 'Planta', 'Veneno', 'Volador', 'Bicho', 'Dragón', 'Acero'], inmune: [] },
            'Roca': { fuerte: ['Fuego', 'Hielo', 'Volador', 'Bicho'], debil: ['Lucha', 'Tierra', 'Acero'], inmune: [] }
        };
        const tipoData = efectividades[tipoAtacante];
        if (!tipoData)
            return 'normal';
        if (tipoData.inmune.includes(tipoDefensor))
            return 'inmune';
        if (tipoData.fuerte.includes(tipoDefensor))
            return 'fuerte';
        if (tipoData.debil.includes(tipoDefensor))
            return 'debil';
        return 'normal';
    };
    // Inicializar batalla cuando se monta el componente
    useEffect(() => {
        console.log('🎮 BattleSystem montado - Iniciando secuencia de batalla');
        // Determinar si es líder o entrenador
        const isLeader = combatienteActual === 'lider';
        setIsLeaderBattle(isLeader);
        // Obtener datos del entrenador
        const gimnasio = gimnasios[gimnasioActual];
        const currentTrainer = isLeader ?
            { nombre: gimnasio.nombre, sprite: gimnasio.sprite } :
            gimnasio.entrenadores[entrenadorActual];
        setTrainerData(currentTrainer);
        // Iniciar secuencia de batalla
        iniciarSecuenciaBatalla();
    }, []);
    // Función principal para iniciar la secuencia de batalla
    const iniciarSecuenciaBatalla = () => {
        console.log('🚀 Iniciando secuencia de batalla completa');
        // Reproducir música de batalla
        const musicKey = isLeaderBattle ? 'gymbattle' : 'trainerbattle';
        const musicFile = getAudioUrl(musicKey) || (isLeaderBattle ? '/src/sounds/gymbattle.mp3' : '/src/sounds/trainerbattle.mp3');
        const audio = new Audio(musicFile);
        audio.volume = 0.1;
        audio.loop = true;
        audio.play().catch(console.error);
        // Fase 1: Mostrar entrenador y diálogo (3 segundos)
        setFaseAnimacion('intro');
        setTimeout(() => {
            // Fase 2: Animación de pokeball (2 segundos)
            setFaseAnimacion('pokeball');
            setTimeout(() => {
                // Fase 3: Aparición del pokemon (1.5 segundos)
                setFaseAnimacion('pokemon');
                setTimeout(() => {
                    // Fase 4: Cuenta regresiva (4 segundos)
                    setFaseAnimacion('countdown');
                    iniciarCuentaRegresiva();
                }, 1500);
            }, 2000);
        }, 3000);
    };
    // Función de cuenta regresiva
    const iniciarCuentaRegresiva = () => {
        setCuentaRegresiva(3);
        const interval = setInterval(() => {
            setCuentaRegresiva(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // ¡AQUÍ ES DONDE DEBE INICIAR EL COMBATE!
                    console.log('⚔️ ¡INICIANDO COMBATE AHORA!');
                    setFaseAnimacion('battle');
                    iniciarCombateReal();
                    return 0;
                }
                playSoundEffect('notification', 0.15);
                return prev - 1;
            });
        }, 1000);
    };
    // Función para iniciar el combate real
    const iniciarCombateReal = () => {
        console.log('🔥 COMBATE REAL INICIADO');
        const gimnasio = gimnasios[gimnasioActual];
        const tiempoBase = calcularTiempoBase(combatienteActual, gimnasioActual);
        setTapsAcumulados(0);
        setTiempoRestante(tiempoBase);
        setCombateEnCurso(true);
        setAtaqueInminente(false);
        playSoundEffect('notification', 0.2);
        // Ataques del oponente
        const intervaloBase = combatienteActual === 'entrenador' ? 2000 : 1200;
        const intervaloAtaque = Math.max(intervaloBase - (gimnasioActual * 100), 800);
        const ataqueInterval = setInterval(() => {
            setAtaqueInminente(true);
            setTimeout(() => {
                setTapsAcumulados(prev => {
                    const efectividad = calcularEfectividad(tipoSeleccionado, gimnasio.tipo);
                    let tapsPerdidos = combatienteActual === 'entrenador' ? 3 : 5;
                    if (efectividad === 'fuerte')
                        tapsPerdidos = Math.ceil(tapsPerdidos * 0.7);
                    else if (efectividad === 'debil')
                        tapsPerdidos = Math.ceil(tapsPerdidos * 1.3);
                    else if (efectividad === 'inmune')
                        tapsPerdidos = Math.ceil(tapsPerdidos * 1.5);
                    return Math.max(0, prev - tapsPerdidos);
                });
                setAtaqueInminente(false);
            }, 1500);
        }, intervaloAtaque);
        // Timer del combate
        const timerInterval = setInterval(() => {
            setTiempoRestante(prev => {
                if (prev <= 1) {
                    clearInterval(ataqueInterval);
                    clearInterval(timerInterval);
                    const tapsObjetivoFinal = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);
                    if (tapsAcumuladosRef.current >= tapsObjetivoFinal) {
                        victoria();
                    }
                    else {
                        derrota();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        // Guardar intervalos
        window.currentIntervals = { ataqueInterval, timerInterval };
    };
    // Victoria contra un Pokémon
    const victoria = () => {
        limpiarTimers();
        const gimnasio = gimnasios[gimnasioActual];
        const pokemonActualNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
        // Mostrar animación de "fainted"
        setPokemonFainted(true);
        playSoundEffect('wintrainer', 0.3);
        setTimeout(() => {
            setPokemonFainted(false);
            const esUltimoDelOponente = esUltimoPokemon(gimnasios[gimnasioActual], combatienteActual, entrenadorActual, pokemonActual);
            if (esUltimoDelOponente) {
                // Es el último Pokémon, terminar combate completamente
                onVictoria();
            }
            else {
                // Hay más Pokémon, continuar con el siguiente
                setTimeout(() => {
                    onVolverAlGimnasio();
                }, 1000);
            }
        }, 2000);
    };
    // Derrota
    const derrota = () => {
        limpiarTimers();
        playSoundEffect('error', 0.2);
        onDerrota();
    };
    // Manejar clics para sumar taps
    const handleTap = () => {
        if (!combateEnCurso)
            return;
        playSoundEffect('pop', 0.1);
        setTapsAcumulados(prev => prev + 1);
    };
    // Verificar victoria automáticamente
    useEffect(() => {
        if (!combateEnCurso)
            return;
        const tapsObjetivo = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);
        if (tapsAcumulados >= tapsObjetivo) {
            limpiarTimers();
            setCombateEnCurso(false);
            victoria();
        }
    }, [tapsAcumulados, combateEnCurso]);
    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            limpiarTimers();
        };
    }, []);
    // Variables para el render
    const gimnasio = gimnasios[gimnasioActual];
    const pokemonNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
    const oponenteNombre = obtenerNombreOponente(gimnasio, combatienteActual, entrenadorActual);
    const tapsObjetivo = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);
    // Estados de batalla especiales
    if (estado === 'victoria') {
        return (_jsx("div", { className: "fixed inset-0 bg-black/90 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-8 text-center max-w-md", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83C\uDFC6" }), _jsx("h2", { className: "text-2xl font-bold text-green-600 mb-4", children: "\u00A1Victoria!" }), _jsxs("p", { className: "text-gray-600 mb-6", children: ["Has derrotado a ", pokemonNombre, " de ", oponenteNombre] }), _jsx("button", { onClick: onVolverAlGimnasio, className: "bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg", children: "Continuar" })] }) }));
    }
    if (estado === 'derrota') {
        return (_jsx("div", { className: "fixed inset-0 bg-black/90 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-8 text-center max-w-md", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDC80" }), _jsx("h2", { className: "text-2xl font-bold text-red-600 mb-4", children: "Derrota" }), _jsxs("p", { className: "text-gray-600 mb-6", children: ["No has podido contra ", pokemonNombre] }), _jsx("button", { onClick: onVolverAlGimnasio, className: "bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg", children: "Volver al Gimnasio" })] }) }));
    }
    // Animación de pokémon derrotado
    if (pokemonFainted) {
        return (_jsx("div", { className: "fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "mb-6 relative", children: [_jsx("img", { src: getPokemonIconUrl(pokemonNombre), alt: pokemonNombre, className: "w-32 h-32 mx-auto grayscale opacity-50 transform rotate-90 transition-all duration-1000", style: { imageRendering: 'pixelated' } }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "text-6xl animate-bounce", children: "\uD83D\uDCA5" }) })] }), _jsxs("h2", { className: "text-4xl font-bold text-red-400 mb-4 animate-pulse", children: [pokemonNombre, " se ha debilitado!"] })] }) }));
    }
    // Fase de introducción - Entrenador hablando
    if (faseAnimacion === 'intro' && trainerData) {
        return (_jsx("div", { className: "fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]", children: _jsxs("div", { className: "text-center animate-in fade-in duration-500", children: [_jsx("div", { className: "mb-8", children: _jsx("img", { src: trainerData.sprite, alt: trainerData.nombre, className: "w-48 h-48 mx-auto rounded-lg border-4 border-white/30 shadow-2xl", style: { imageRendering: 'pixelated' } }) }), _jsx("h2", { className: "text-4xl font-bold text-white mb-4 drop-shadow-2xl", children: isLeaderBattle ? `Líder ${trainerData.nombre}` : trainerData.nombre }), _jsx("div", { className: "bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto border border-white/20 shadow-2xl", children: _jsx("p", { className: "text-xl text-white text-center leading-relaxed drop-shadow-lg", children: getTrainerPhrase(isLeaderBattle) }) })] }) }));
    }
    // Fase de pokeball
    if (faseAnimacion === 'pokeball') {
        return (_jsxs("div", { className: "fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]", children: [_jsx("style", { dangerouslySetInnerHTML: {
                        __html: `
            @keyframes throwBall {
              0% { transform: translate(-200px, 100px) scale(0.3) rotate(0deg); }
              50% { transform: translate(0px, -50px) scale(0.8) rotate(360deg); }
              100% { transform: translate(200px, 0px) scale(1.2) rotate(720deg); }
            }
          `
                    } }), _jsxs("div", { className: "relative w-full h-full flex items-center justify-center", children: [_jsx("div", { className: "absolute left-10 bottom-10 opacity-30", children: _jsx("img", { src: trainerData?.sprite, alt: "Entrenador", className: "w-24 h-24", style: { imageRendering: 'pixelated' } }) }), _jsxs("div", { className: "w-16 h-16", style: { animation: 'throwBall 2s ease-out infinite' }, children: [_jsx("img", { src: "/pokeball.png", alt: "Pokeball", className: "w-full h-full object-contain drop-shadow-lg", style: { imageRendering: 'pixelated' }, onError: (e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling;
                                        if (fallback) {
                                            fallback.style.display = 'flex';
                                            fallback.classList.add('w-16', 'h-16', 'bg-red-500', 'rounded-full', 'border-4', 'border-white', 'items-center', 'justify-center');
                                            fallback.textContent = '⚫';
                                        }
                                    } }), _jsx("div", { className: "hidden" })] })] })] }));
    }
    // Fase de aparición del pokémon
    if (faseAnimacion === 'pokemon') {
        return (_jsxs("div", { className: "fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]", children: [_jsx("style", { dangerouslySetInnerHTML: {
                        __html: `
            @keyframes appearPokemon {
              0% { transform: scale(0) rotate(-180deg); opacity: 0; }
              50% { transform: scale(1.3) rotate(-90deg); opacity: 0.7; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
          `
                    } }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mb-4", style: { animation: 'appearPokemon 1.5s ease-out' }, children: _jsx("img", { src: getPokemonIconUrl(pokemonNombre), alt: pokemonNombre, className: "w-48 h-48 mx-auto drop-shadow-2xl", style: { imageRendering: 'pixelated' } }) }), _jsx("div", { className: "bg-black/60 backdrop-blur-sm rounded-lg p-4 max-w-sm mx-auto", children: _jsxs("p", { className: "text-white text-lg font-bold", children: ["\u00A1", pokemonNombre, " apareci\u00F3!"] }) })] })] }));
    }
    // Fase de cuenta regresiva
    if (faseAnimacion === 'countdown') {
        return (_jsx("div", { className: "fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]", children: _jsxs("div", { className: "text-white text-center", children: [_jsx("div", { className: "text-9xl font-bold animate-pulse drop-shadow-2xl", children: cuentaRegresiva === 0 ? '¡COMBATE!' : cuentaRegresiva }), _jsx("p", { className: "text-xl mt-4 drop-shadow-lg", children: cuentaRegresiva === 0 ? '¡Comienza la batalla!' : 'Preparándose para batalla...' })] }) }));
    }
    // Pantalla principal de combate (faseAnimacion === 'battle')
    return (_jsxs("div", { className: "fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center z-[60] text-white", children: [_jsx("div", { className: "absolute inset-0 bg-black/30" }), _jsxs("div", { className: "relative z-10 flex flex-col items-center justify-center w-full h-full px-4", children: [_jsx("div", { className: "flex items-center gap-4 mb-8 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/20", children: _jsxs("div", { className: "text-shadow-lg", children: [_jsx("h2", { className: "text-2xl font-bold text-white drop-shadow-lg", children: oponenteNombre }), _jsx("p", { className: "text-lg text-gray-100 drop-shadow-md", children: pokemonNombre }), _jsxs("p", { className: "text-sm text-gray-200 drop-shadow-md", children: ["Tipo: ", gimnasio.tipo] })] }) }), _jsx("div", { className: "mb-6", children: _jsx("div", { className: "relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20", children: _jsx("img", { src: getPokemonIconUrl(pokemonNombre), alt: pokemonNombre, className: "w-32 h-32 mx-auto", style: { imageRendering: 'pixelated' } }) }) }), _jsx("div", { className: "mb-6 w-full max-w-md space-y-4", children: _jsxs("div", { className: "bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/20", children: [_jsxs("div", { className: "flex justify-between text-sm text-gray-200 mb-2", children: [_jsxs("span", { children: ["Progreso: ", tapsAcumulados, "/", tapsObjetivo] }), _jsxs("span", { children: ["Tiempo: ", tiempoRestante, "s"] })] }), _jsx("div", { className: "w-full bg-gray-600 rounded-full h-3 mb-2 overflow-hidden", children: _jsx("div", { className: "bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300 shadow-lg", style: { width: `${Math.min((tapsAcumulados / tapsObjetivo) * 100, 100)}%` } }) }), _jsx("div", { className: "w-full bg-gray-600 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: "bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full transition-all duration-1000", style: { width: `${(tiempoRestante / calcularTiempoBase(combatienteActual, gimnasioActual)) * 100}%` } }) })] }) }), _jsx("div", { className: "mb-8", children: _jsx("button", { onClick: handleTap, disabled: !combateEnCurso, className: `w-32 h-32 rounded-full text-4xl font-bold transition-all duration-200 border-4 shadow-2xl ${combateEnCurso
                                ? ataqueInminente
                                    ? 'bg-red-500 hover:bg-red-400 animate-pulse border-red-300 shadow-red-500/50'
                                    : 'bg-blue-500 hover:bg-blue-400 border-blue-300 shadow-blue-500/50'
                                : 'bg-gray-500 cursor-not-allowed border-gray-400 shadow-gray-500/30'}`, children: combateEnCurso ? '👊' : '🔄' }) }), combateEnCurso && (_jsxs("div", { className: "mt-4 text-center bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/20", children: [_jsxs("p", { className: "text-sm text-white drop-shadow-md", children: [tipoSeleccionado, " vs ", gimnasio.tipo] }), _jsx("p", { className: `text-xs font-bold drop-shadow-md ${calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'fuerte' ? 'text-green-400' :
                                    calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'debil' ? 'text-red-400' :
                                        'text-white'}`, children: calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'fuerte' ? 'Súper efectivo' :
                                    calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'debil' ? 'No muy efectivo' :
                                        'Efectividad normal' })] }))] })] }));
};
export default BattleSystem;
