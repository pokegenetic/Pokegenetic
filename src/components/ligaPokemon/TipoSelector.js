import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { playSoundEffect } from '@/lib/soundEffects';
import { TIPOS_JUGADOR } from '../../data/ligaPokemon/tipos';
// Componente selector de tipos simplificado
export const TipoSelector = ({ tipoSeleccionado, setTipoSeleccionado }) => {
    const [indiceActual, setIndiceActual] = useState(() => {
        const index = TIPOS_JUGADOR.findIndex(tipo => tipo.nombre === tipoSeleccionado);
        return index !== -1 ? index : 0;
    });
    useEffect(() => {
        const index = TIPOS_JUGADOR.findIndex(tipo => tipo.nombre === tipoSeleccionado);
        if (index !== -1 && index !== indiceActual) {
            setIndiceActual(index);
        }
    }, [tipoSeleccionado, indiceActual]);
    const navegarAnterior = () => {
        playSoundEffect('notification', 0.3);
        const nuevoIndice = indiceActual === 0 ? TIPOS_JUGADOR.length - 1 : indiceActual - 1;
        setIndiceActual(nuevoIndice);
        setTipoSeleccionado(TIPOS_JUGADOR[nuevoIndice].nombre);
    };
    const navegarSiguiente = () => {
        playSoundEffect('notification', 0.3);
        const nuevoIndice = indiceActual === TIPOS_JUGADOR.length - 1 ? 0 : indiceActual + 1;
        setIndiceActual(nuevoIndice);
        setTipoSeleccionado(TIPOS_JUGADOR[nuevoIndice].nombre);
    };
    const tipoActual = TIPOS_JUGADOR[indiceActual];
    return (_jsxs("div", { className: "bg-white/60 backdrop-blur-md rounded-xl p-4 md:p-8 pb-6 md:pb-10 border border-slate-200/40 shadow-xl", children: [_jsx("h3", { className: "text-lg md:text-xl font-bold text-center mb-6 md:mb-8 text-gray-800", children: "Selecciona tu tipo Pok\u00E9mon" }), _jsxs("div", { className: "relative flex items-center justify-center space-x-2 md:space-x-4", children: [_jsx("button", { onClick: navegarAnterior, className: `w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br ${tipoActual.color} 
                     border-2 border-white flex items-center justify-center 
                     hover:scale-110 active:scale-95 transition-all duration-200 
                     shadow-lg hover:shadow-xl group`, children: _jsx("span", { className: "text-white font-bold text-lg md:text-xl lg:text-2xl drop-shadow-md group-hover:scale-110 transition-transform", children: "\u2039" }) }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: `absolute inset-0 rounded-2xl bg-gradient-to-br ${tipoActual.color} 
                          animate-pulse opacity-75 blur-sm scale-105` }), _jsxs("div", { className: `relative w-40 h-28 md:w-48 md:h-32 lg:w-56 lg:h-36 rounded-2xl bg-gradient-to-br ${tipoActual.color} 
                          border-4 border-white flex flex-col items-center justify-center 
                          shadow-2xl transform transition-all duration-300 hover:scale-105 
                          hover:shadow-3xl group`, children: [_jsx("img", { src: tipoActual.sprite, alt: tipoActual.nombre, className: "w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 mb-2 drop-shadow-xl \n                         group-hover:scale-110 transition-transform duration-300 \n                         filter drop-shadow-2xl", onError: (e) => {
                                            e.currentTarget.style.display = 'none';
                                        } }), _jsx("div", { className: "text-white font-bold text-base md:text-lg lg:text-xl drop-shadow-md text-center group-hover:scale-105 transition-transform", children: tipoActual.nombre })] })] }), _jsx("button", { onClick: navegarSiguiente, className: `w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br ${tipoActual.color} 
                     border-2 border-white flex items-center justify-center 
                     hover:scale-110 active:scale-95 transition-all duration-200 
                     shadow-lg hover:shadow-xl group`, children: _jsx("span", { className: "text-white font-bold text-lg md:text-xl lg:text-2xl drop-shadow-md group-hover:scale-110 transition-transform", children: "\u203A" }) })] })] }));
};
