import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from '@/img/logopokegenetic.png';
// Import audio files with error handling
const tryImportAudio = (path) => {
  try {
    return { valid: true, audio: path };
  } catch (error) {
    console.warn(`Could not import audio: ${path}`, error);
    return { valid: false };
  }
};
// Safe import with fallback
const pokechillmusic = tryImportAudio('@/sounds/pokechillmusic.mp3');
import { Volume2, VolumeX } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { useUser } from '@/context/UserContext';
import UserMenu from './UserMenu';
import sv from '@/img/scarlet-violet.png';
import swsh from '@/img/sword-shield.png';
import arceus from '@/img/legends-arceus.png';
import bdsp from '@/img/diamond-pearl.png';
import letsgo from '@/img/lets-go.png';
import { playSoundEffect } from '@/lib/soundEffects';
import { teamToShowdownText } from './equipo';
import { getPokemonTeam } from '@/lib/equipoStorage';
const AnimatedNavLink = ({ href, children }) => {
    const location = useLocation();
    const isActive = location.pathname === href ||
        (href !== '/' && location.pathname.startsWith(href));
    const defaultTextColor = 'text-gray-800';
    const hoverTextColor = 'text-gray-900';
    const textSizeClass = 'text-xs sm:text-sm';
    return (_jsxs(Link, { to: href, className: `group relative inline-block h-7 flex items-center justify-center px-1 overflow-hidden ${textSizeClass} hover:text-gray-900 transition-colors duration-200`, onClick: () => playSoundEffect('notification', 0.1), children: [_jsx("span", { className: `${isActive ? 'font-bold' : ''} ${defaultTextColor}`, children: children }), isActive && (_jsx("span", { className: "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 rounded-full" }))] }));
};
export function MiniNavbar() {
    const [musicOn, setMusicOn] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('musicOn');
            if (stored === null) {
                localStorage.setItem('musicOn', 'true');
                return true;
            }
            return stored === 'true';
        }
        return true;
    });
    const audioRef = useRef(null);
    const navigate = useNavigate();
    const { selectedGame, setSelectedGame, pokemonTeam, clearPokemonTeam } = useGame();
    const { user, loginWithGoogle } = useUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    // Estado local para el recuento de Pokémon
    const [teamCount, setTeamCount] = useState(0);
    // Estado para controlar la visibilidad temporal del aviso
    const [showAudioNotice, setShowAudioNotice] = useState(false);
    const [hideAudioNotice, setHideAudioNotice] = useState(false);
    // CSS para animación de ondas en el toggle y parpadeo suave del aviso
    const waveStyle = `
    @keyframes music-wave {
      0% { box-shadow: 0 0 0 0 rgba(236,72,153,0.4), 0 0 0 0 rgba(168,85,247,0.3); }
      70% { box-shadow: 0 0 0 10px rgba(236,72,153,0), 0 0 0 20px rgba(168,85,247,0); }
      100% { box-shadow: 0 0 0 0 rgba(236,72,153,0), 0 0 0 0 rgba(168,85,247,0); }
    }
    .music-wave-anim {
      animation: music-wave 1.6s infinite cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes audio-notice-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .audio-notice-blink {
      animation: audio-notice-blink 1.6s ease-in-out infinite;
      transition: opacity 0.6s cubic-bezier(0.4,0,0.2,1);
    }
    .audio-notice-blink.hide {
      opacity: 0;
      pointer-events: none;
    }
  `;
    useEffect(() => {
        // Inyectar el CSS solo una vez
        if (!document.getElementById('music-wave-style')) {
            const style = document.createElement('style');
            style.id = 'music-wave-style';
            style.innerHTML = waveStyle;
            document.head.appendChild(style);
        }
    }, []);
    // Estado de audio, SIEMPRE desactivado al recargar (ignora localStorage)
    const [audioEnabled, setAudioEnabled] = useState(false);
    // Sincroniza localStorage cuando cambia audioEnabled
    useEffect(() => {
        localStorage.setItem('audioEnabled', audioEnabled.toString());
    }, [audioEnabled]);
    // Controla reproducción y pausa según visibilidad y toggle
    useEffect(() => {
        if (!audioRef.current || !pokechillmusic?.valid)
            return;
        audioRef.current.volume = 0.04;
        audioRef.current.loop = true;
        if (audioEnabled) {
            audioRef.current.play().catch(() => {
                // Si el navegador bloquea, no hacemos nada extra
            });
        }
        else {
            audioRef.current.pause();
        }
        const handleVisibilityChange = () => {
            if (document.hidden && audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
            }
            else if (!document.hidden && audioEnabled) {
                audioRef.current?.play();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [audioEnabled]);
    const navLinksData = [
        { label: 'Inicio', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Equipo', href: '/equipo' },
        { label: 'Creación', href: '/crear' },
        { label: 'MiniGames', href: '/minigames' },
        { label: 'FAQ', href: '/faq' },
    ];
    // Selector de juego (dropdown)
    const gameOptions = [
        { id: 'scarlet-violet', name: 'Pokémon Scarlet/Violet' },
        { id: 'sword-shield', name: 'Pokémon Sword/Shield' },
        { id: 'legends-arceus', name: 'Pokémon Legends Arceus' },
        { id: 'diamond-pearl', name: 'Pokémon Diamond/Pearl' },
        { id: 'lets-go', name: "Pokémon Let's Go" },
    ];
    const gameImages = {
        'scarlet-violet': sv,
        'sword-shield': swsh,
        'legends-arceus': arceus,
        'diamond-pearl': bdsp,
        'lets-go': letsgo,
    };
    const selectedGameDisplay = (_jsxs("div", { className: "relative ml-3", children: [_jsx("div", { onClick: () => setDropdownOpen(!dropdownOpen), className: "flex items-center gap-2 bg-white/70 hover:bg-white transition rounded-xl p-2 pr-4 shadow-sm cursor-pointer min-w-[250px] max-w-[250px]", children: selectedGame && selectedGame.id && gameImages[selectedGame.id] ? (_jsxs(_Fragment, { children: [_jsx("img", { src: gameImages[selectedGame.id], alt: selectedGame.name, className: "w-10 h-10 object-contain" }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "text-[10px] text-gray-500 leading-tight", children: "Juego seleccionado:" }), _jsx("p", { className: "text-xs sm:text-sm font-semibold text-gray-700 leading-tight", children: selectedGame.name })] })] })) : (_jsx("p", { className: "text-xs sm:text-sm font-semibold text-gray-700 px-2", children: "\uD83C\uDFAE Sin juego seleccionado \u25BC" })) }), dropdownOpen && (_jsxs("div", { className: "absolute top-full mt-2 left-0 bg-white border rounded-md shadow-md z-50 w-max text-left", children: [gameOptions.map((game) => {
                        const isEnabled = game.id === 'scarlet-violet';
                        return (_jsx("button", { onClick: () => {
                                if (!isEnabled)
                                    return;
                                setSelectedGame({
                                    id: game.id,
                                    name: game.name,
                                    region: '',
                                    generation: '',
                                });
                                setDropdownOpen(false);
                                navigate('/laboratorio');
                            }, className: 'block w-full px-4 py-2 text-sm text-gray-700 text-left ' +
                                (isEnabled
                                    ? 'hover:bg-gray-100 cursor-pointer'
                                    : 'opacity-60 grayscale pointer-events-none select-none'), "aria-disabled": !isEnabled, tabIndex: isEnabled ? 0 : -1, children: game.name }, game.id));
                    }), _jsx("button", { onClick: () => {
                            setSelectedGame(null);
                            setDropdownOpen(false);
                        }, className: "block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 text-left border-t", children: "\u2716 Eliminar juego seleccionado" })] }))] }));
    // Mostrar aviso SIEMPRE que la música está desactivada
    useEffect(() => {
        if (!audioEnabled) {
            setShowAudioNotice(true);
        }
        else {
            setShowAudioNotice(false);
        }
    }, [audioEnabled]);
    // Animación y visibilidad del aviso de audio bloqueado
    useEffect(() => {
        if (showAudioNotice) {
            setHideAudioNotice(false);
            const timeout = setTimeout(() => setHideAudioNotice(true), 2700);
            const timeout2 = setTimeout(() => setShowAudioNotice(false), 3300);
            return () => { clearTimeout(timeout); clearTimeout(timeout2); };
        }
        else {
            setHideAudioNotice(false);
        }
    }, [showAudioNotice]);
    // Efecto para verificar periódicamente si hay cambios en el equipo
    useEffect(() => {
        // Función para verificar y actualizar el estado del equipo
        const checkTeamUpdates = () => {
            const currentTeam = getPokemonTeam();
            setTeamCount(currentTeam.length);
        };
        // Verificar inmediatamente al montar
        checkTeamUpdates();
        // Establecer un intervalo para verificar regularmente
        const intervalId = setInterval(checkTeamUpdates, 500);
        // Limpiar el intervalo al desmontar
        return () => {
            clearInterval(intervalId);
        };
    }, []);
    // Handler for exporting team
    const handleExportTeam = async () => {
        // Verificar si el usuario está logueado
        if (!user) {
            const shouldLogin = window.confirm('Para enviar tu equipo al laboratorio necesitas iniciar sesión.\n\n' +
                'Esto nos permite:\n' +
                '• Registrar tu email y teléfono para contactarte\n' +
                '• Guardar tu pedido de forma segura\n' +
                '• Llevar un historial de tus pedidos\n\n' +
                '¿Quieres iniciar sesión ahora?');
            if (shouldLogin) {
                try {
                    await loginWithGoogle();
                    // Después del login exitoso, volver a llamar la función
                    setTimeout(() => handleExportTeam(), 1000);
                }
                catch (error) {
                    console.error('Error during login:', error);
                    window.alert('Error al iniciar sesión. Por favor, intenta de nuevo.');
                }
            }
            return;
        }
        // Obtenemos el equipo directamente de localStorage para asegurar
        // que tenemos los datos más actualizados
        const currentTeam = getPokemonTeam();
        if (!currentTeam || currentTeam.length === 0) {
            window.alert('No tienes ningún Pokémon en tu equipo para exportar.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres enviar tu equipo al laboratorio? Se descargará un archivo de texto con tu equipo en formato Showdown y se vaciarán tus Pokémon.')) {
            // Reproducir sonido de curación (heal) al confirmar
            playSoundEffect('heal', 0.1);
            // Guardamos el showdown text antes de limpiar el equipo
            const showdownText = teamToShowdownText(currentTeam);
            // Si el usuario está logueado, guardamos el pedido en Firebase
            if (user?.uid && user?.email) {
                try {
                    const { addUserPedido } = await import('../../lib/userData');
                    await addUserPedido(user.uid, user.email, {
                        equipo: currentTeam,
                        showdownText: showdownText,
                        timestamp: new Date(),
                        status: 'enviado'
                    });
                    console.log('Pedido guardado en Firebase exitosamente');
                }
                catch (error) {
                    console.error('Error al guardar pedido en Firebase:', error);
                    // Continuamos con la descarga aunque falle Firebase
                }
            }
            // Descargamos el archivo
            const blob = new Blob([showdownText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pokemon_team_${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            // Limpiamos el equipo sin refrescar la página
            clearPokemonTeam(); // Utiliza la función del contexto
            // También limpiamos localStorage directamente
            localStorage.removeItem('pokemonTeamShowdownText');
            localStorage.removeItem('pokemonTeam');
            // Actualizamos el contador local inmediatamente
            setTeamCount(0);
            // Mostramos confirmación
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                const message = user
                    ? '¡Tu equipo ha sido enviado al laboratorio y guardado en tu perfil!'
                    : '¡Tu equipo ha sido enviado al laboratorio! Inicia sesión para guardar tu historial de pedidos.';
                window.alert(message);
            }, 100);
        }
    };
    const signupButtonElement = (_jsxs("div", { className: "relative group w-fit sm:w-auto max-w-full", children: [_jsx("div", { className: "absolute inset-0 -m-2 rounded-full bg-gray-100 opacity-30 filter blur-lg pointer-events-none transition-all duration-300 ease-out group-hover:opacity-50 group-hover:blur-xl group-hover:-m-3" }), _jsx("button", { className: `relative z-10 px-3 py-2 text-xs sm:text-sm font-semibold text-white rounded-full transition-all duration-200 ${teamCount > 0
                    ? "bg-gradient-to-br from-purple-500 to-red-500 hover:from-purple-600 hover:to-red-600"
                    : "bg-gray-400 cursor-not-allowed"}`, onClick: teamCount > 0 ? handleExportTeam : () => {
                    if (!user) {
                        const shouldLogin = window.confirm('Para enviar equipos al laboratorio necesitas iniciar sesión.\n\n' +
                            'Además, necesitas tener al menos un Pokémon en tu equipo.\n\n' +
                            '¿Quieres iniciar sesión ahora?');
                        if (shouldLogin) {
                            loginWithGoogle();
                        }
                    }
                    else {
                        window.alert('No tienes ningún Pokémon en tu equipo para exportar.');
                    }
                }, type: "button", disabled: teamCount === 0 && !!user, children: teamCount > 0 ? `Enviar al Laboratorio (${teamCount})` : "Enviar al Laboratorio" })] }));
    return (_jsx("header", { className: "fixed top-0 left-0 right-0 z-20 w-full px-4 sm:px-6 py-3 backdrop-blur-md bg-white/20 shadow-md transition-all duration-200 ease-in-out", children: _jsxs("div", { className: "max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6", children: [_jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto relative", children: [_jsx("img", { src: logo, alt: "Pok\u00E9Genetic Logo", className: "w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md cursor-pointer transition-all duration-200", onClick: () => navigate('/') }), _jsxs("div", { className: "relative flex flex-col items-center", children: [_jsx("button", { "aria-label": audioEnabled ? 'Apagar música' : 'Encender música', className: `ml-1 p-0.5 rounded-full bg-gradient-to-br from-pink-400 via-fuchsia-500 to-purple-500 shadow-lg transition relative ${audioEnabled ? 'music-wave-anim' : ''}`, onClick: () => {
                                        setAudioEnabled((v) => !v);
                                    }, style: { lineHeight: 0 }, children: audioEnabled ? (_jsx(Volume2, { className: "w-4 h-4 text-white" })) : (_jsx(VolumeX, { className: "w-4 h-4 text-gray-200" })) }), _jsx("audio", { ref: audioRef, src: pokechillmusic?.valid ? pokechillmusic.audio : '', loop: true, preload: "auto", style: { display: 'none' } }), showAudioNotice && (_jsxs("div", { className: `audio-notice-blink${hideAudioNotice ? ' hide' : ''}`, style: {
                                        position: 'absolute',
                                        left: '60%', // Mueve un poco a la derecha
                                        top: 'calc(100% + 8px)',
                                        transform: 'translateX(-50%)',
                                        zIndex: 50,
                                        borderRadius: '9999px',
                                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.16)',
                                        background: 'linear-gradient(90deg, #2d0a3a 0%, #a21caf 40%, #ec4899 100%)',
                                        color: '#fffbe9',
                                        fontWeight: 700,
                                        fontSize: '10px',
                                        padding: '6px 12px 6px 12px',
                                        minWidth: '180px', // antes 120px
                                        maxWidth: '320px', // antes 200px
                                        textAlign: 'center',
                                        pointerEvents: 'none',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                                        lineHeight: '1.2',
                                        whiteSpace: 'pre-line',
                                    }, children: [_jsx("span", { style: {
                                                position: 'absolute',
                                                left: '50%',
                                                top: '-3px',
                                                transform: 'translateX(-50%)',
                                                width: 0,
                                                height: 0,
                                                borderLeft: '7px solid transparent',
                                                borderRight: '7px solid transparent',
                                                borderBottom: '7px solid #a21caf',
                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.16))',
                                                zIndex: 51,
                                                pointerEvents: 'none',
                                                display: 'block',
                                            } }), "Toca el \u00EDcono de m\u00FAsica para activar el audio de fondo \uD83C\uDFB5"] }))] }), selectedGameDisplay] }), _jsx("nav", { className: "flex flex-wrap justify-center sm:justify-start gap-x-1 gap-y-2 text-xs sm:text-sm mt-2 sm:mt-0", children: navLinksData.map((link, index) => (_jsx(AnimatedNavLink, { href: link.href, children: link.label }, `${link.href}-${index}`))) }), _jsxs("div", { className: "flex items-center gap-3 justify-end sm:w-auto mt-2 sm:mt-0", children: [signupButtonElement, _jsx(UserMenu, {})] })] }) }));
}
