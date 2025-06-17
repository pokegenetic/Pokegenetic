import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { playSoundEffect } from '@/lib/soundEffects';
import { useUser } from '../../context/UserContext';
import LoginRequired from './LoginRequired';
import './minigames-animations.css';
// Definir los juegos con descripciones
const games = [
    {
        id: 'pokemoncatch',
        title: '¡Atrapa un Pokémon!',
        description: 'Captura Pokémon salvajes',
        route: '/pokemoncatch'
    },
    {
        id: 'whosthat',
        title: '¿Quién es ese Pokémon?',
        description: 'Adivina por la silueta',
        route: '/whosthat'
    },
    {
        id: 'memorice',
        title: 'Memorice',
        description: 'Encuentra los pares',
        route: '/memorice'
    },
    {
        id: 'coinmachine',
        title: 'Atrapamonedas',
        description: 'Máquina de premios',
        route: '/coinmachine'
    },
    {
        id: 'incubators',
        title: 'Incubadoras',
        description: 'Eclosiona huevos',
        route: '/incubators'
    },
    {
        id: 'ligapokemon',
        title: 'Liga Pokémon',
        description: 'Desafía a los líderes',
        route: '/ligapokemon'
    }
];
export default function MiniGames() {
    const navigate = useNavigate();
    const { user, loginWithGoogle } = useUser();
    // Si el usuario no está logueado, mostrar componente de login requerido
    if (!user) {
        return (_jsx(LoginRequired, { feature: "los MiniJuegos", onLogin: loginWithGoogle }));
    }
    const handleGameClick = (route) => {
        playSoundEffect('notification', 0.1);
        navigate(route, { state: { from: '/minigames' } });
    };
    return (_jsxs("div", { className: "flex flex-col items-center px-4 py-6", children: [_jsx("h1", { className: "text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "MiniGames" }), _jsx("p", { className: "mt-4 max-w-xl text-sm md:text-base text-slate-600 font-medium text-center mx-auto mb-8", children: "\u00A1Bienvenido a la secci\u00F3n de MiniGames! Aqu\u00ED encontrar\u00E1s peque\u00F1os juegos interactivos donde puedes ganar premios y Pok\u00E9mon exclusivos. \u00A1Participa y pon a prueba tu suerte y habilidad!" }), _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full", children: games.map((game, index) => {
                    return (_jsxs("div", { className: "star-border", style: {
                            animation: 'float 4s ease-in-out infinite',
                            animationDelay: `${index * 0.3}s`
                        }, children: [_jsx("div", { className: "absolute w-12 h-3 top-[-1px] left-0 z-0", style: {
                                    background: 'linear-gradient(90deg, transparent, #fbbf24, #facc15, #fbbf24, transparent)',
                                    borderRadius: '50%',
                                    filter: 'blur(1px)',
                                    boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
                                    animation: 'star-movement-top 4s linear infinite',
                                } }), _jsx("div", { className: "absolute w-12 h-3 bottom-[-1px] right-0 z-0", style: {
                                    background: 'linear-gradient(90deg, transparent, #ec4899, #f472b6, #ec4899, transparent)',
                                    borderRadius: '50%',
                                    filter: 'blur(1px)',
                                    boxShadow: '0 0 8px rgba(236, 72, 153, 0.6)',
                                    animation: 'star-movement-bottom 4s linear infinite',
                                    animationDelay: '2s'
                                } }), _jsx("div", { className: "absolute w-3 h-12 left-[-1px] top-0 z-0", style: {
                                    background: 'linear-gradient(180deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent)',
                                    borderRadius: '50%',
                                    filter: 'blur(1px)',
                                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
                                    animation: 'star-movement-left 4s linear infinite',
                                    animationDelay: '1s'
                                } }), _jsx("div", { className: "absolute w-3 h-12 right-[-1px] bottom-0 z-0", style: {
                                    background: 'linear-gradient(180deg, transparent, #8b5cf6, #a78bfa, #8b5cf6, transparent)',
                                    borderRadius: '50%',
                                    filter: 'blur(1px)',
                                    boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
                                    animation: 'star-movement-right 4s linear infinite',
                                    animationDelay: '3s'
                                } }), _jsxs("button", { onClick: () => handleGameClick(game.route), className: "\n                  star-border-content group relative overflow-hidden subtle-shine-effect\n                  p-5 rounded-xl shadow-lg hover:shadow-2xl\n                  transform transition-all duration-500 ease-out\n                  hover:scale-110 hover:-translate-y-3\n                  focus:outline-none focus:ring-4 focus:ring-blue-400/40\n                  w-full h-32 flex flex-col items-center justify-center\n                  border border-slate-200/60 hover:border-slate-300/80\n                  bg-white/70 hover:bg-white/85\n                  backdrop-blur-md\n                ", children: [_jsxs("div", { className: "relative z-20 flex flex-col items-center justify-center h-full gap-2", children: [_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("h3", { className: "text-xs font-bold text-center leading-tight text-slate-800 group-hover:text-white transition-all duration-300 drop-shadow-sm max-w-full px-1", children: game.title }), _jsx("div", { className: "opacity-30 group-hover:opacity-80 transition-all duration-500 group-hover:animate-spin group-hover:scale-125", children: _jsx("img", { src: "/pokeball.png", alt: "Pokeball", className: "w-10 h-10 drop-shadow-md group-hover:filter group-hover:brightness-0 group-hover:invert" }) })] }), _jsx("p", { className: "text-xs text-center leading-tight font-medium text-slate-700 group-hover:text-white/95 transition-all duration-300 drop-shadow-sm max-w-full px-1", children: game.description })] }), _jsxs("div", { className: "absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10", children: [_jsx("div", { className: "absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-ping shadow-lg" }), _jsx("div", { className: "absolute bottom-4 right-4 w-2 h-2 bg-white rounded-full animate-ping shadow-lg", style: { animationDelay: '0.3s' } }), _jsx("div", { className: "absolute top-1/2 left-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-md", style: { animationDelay: '0.6s' } }), _jsx("div", { className: "absolute bottom-6 left-6 w-1.5 h-1.5 bg-white rounded-full animate-ping shadow-md", style: { animationDelay: '0.9s' } })] }), _jsx("div", { className: "absolute inset-0 rounded-xl border-4 border-white/60 opacity-0 group-active:opacity-40 z-10 transition-opacity duration-200" })] })] }, game.id));
                }) }), _jsx("div", { className: "mt-8 text-center", children: _jsx("p", { className: "text-sm text-slate-600 font-semibold", children: "\uD83C\uDFAE \u00A1Completa los juegos para ganar Pok\u00E9balls y premios exclusivos!" }) })] }));
}
