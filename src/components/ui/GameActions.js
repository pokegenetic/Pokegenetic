import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
export default function GameActions() {
    const { selectedGame } = useGame();
    const navigate = useNavigate();
    const goToCrear = () => navigate('/crear');
    const goToMisPokemon = () => navigate('/mis-pokemon');
    const goToPacks = () => navigate('/packs');
    useEffect(() => {
        if (!selectedGame)
            navigate('/');
    }, [selectedGame, navigate]);
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold mb-6 text-gray-800", children: "\u00BFQu\u00E9 quieres hacer en el laboratorio?" }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("button", { onClick: goToCrear, className: "px-6 py-3 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition", children: "Crear Pok\u00E9mon/Equipo" }), _jsx("button", { onClick: goToMisPokemon, className: "px-6 py-3 bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition", children: "Mis Pok\u00E9mon" }), _jsx("button", { onClick: goToPacks, className: "px-6 py-3 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 transition", children: "Packs Pok\u00E9dex" })] })] }));
}
