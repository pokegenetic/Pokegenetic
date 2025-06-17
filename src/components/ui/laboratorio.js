import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { playSoundEffect } from '@/lib/soundEffects';
export default function Laboratorio() {
    const { selectedGame } = useGame();
    const navigate = useNavigate();
    const goToCrear = () => {
        playSoundEffect('notification', 0.1);
        navigate('/crear');
    };
    const goToMisPokemon = () => {
        playSoundEffect('notification', 0.1);
        navigate('/mis-pokemon');
    };
    const goToPacks = () => {
        playSoundEffect('notification', 0.1);
        navigate('/packs');
    };
    useEffect(() => {
        if (!selectedGame)
            navigate('/');
    }, [selectedGame, navigate]);
    return (_jsxs("div", { className: "flex flex-col items-center px-4 pt-[1 px] text-center", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "\u00BFQu\u00E9 quieres hacer en el laboratorio?" }), _jsxs("div", { className: "flex flex-col gap-4 w-full max-w-md mt-2", children: [_jsxs("button", { onClick: goToCrear, className: "flex items-center gap-3 w-full bg-white/80 hover:bg-white border border-gray-200/70 backdrop-blur-md shadow-md rounded-xl px-4 py-3 text-left transition group", children: [_jsx("span", { className: "inline-block bg-blue-100 text-blue-600 rounded-full p-2", children: _jsx("svg", { xmlns: 'http://www.w3.org/2000/svg', className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', children: _jsx("path", { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 4v16m8-8H4' }) }) }), _jsx("span", { className: "font-semibold text-gray-800", children: "Crear Pok\u00E9mon/Equipo" })] }), _jsxs("button", { onClick: goToMisPokemon, className: "flex items-center gap-3 w-full bg-white/80 hover:bg-white border border-gray-200/70 backdrop-blur-md shadow-md rounded-xl px-4 py-3 text-left transition group", children: [_jsx("span", { className: "inline-block bg-green-100 text-green-600 rounded-full p-2", children: _jsx("svg", { xmlns: 'http://www.w3.org/2000/svg', className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', children: _jsx("path", { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M5 13l4 4L19 7' }) }) }), _jsx("span", { className: "font-semibold text-gray-800", children: "Mis Pok\u00E9mon" })] }), _jsxs("button", { onClick: goToPacks, className: "flex items-center gap-3 w-full bg-white/80 hover:bg-white border border-gray-200/70 backdrop-blur-md shadow-md rounded-xl px-4 py-3 text-left transition group", children: [_jsx("span", { className: "inline-block bg-yellow-100 text-yellow-700 rounded-full p-2", children: _jsx("svg", { xmlns: 'http://www.w3.org/2000/svg', className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', children: _jsx("path", { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 7h18M3 12h18M3 17h18' }) }) }), _jsx("span", { className: "font-semibold text-gray-800", children: "Packs Pok\u00E9dex" })] })] })] }));
}
