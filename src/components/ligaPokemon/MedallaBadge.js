import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
// Componente para manejar medallas
export const MedallaBadge = ({ medalla, isObtenida }) => {
    const [imagenError, setImagenError] = useState(false);
    const handleImageError = () => {
        setImagenError(true);
    };
    if (imagenError) {
        return (_jsx("div", { className: `w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all ${isObtenida
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-400 shadow-lg scale-110'
                : 'bg-gray-200 border-gray-300 grayscale opacity-50'}`, children: medalla.emoji }));
    }
    return (_jsx("div", { className: `w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all overflow-hidden ${isObtenida
            ? 'border-yellow-400 shadow-lg scale-110 bg-gradient-to-br from-yellow-100 to-orange-100'
            : 'bg-gray-200 border-gray-300 grayscale opacity-50'}`, children: _jsx("img", { src: medalla.sprite, alt: medalla.nombre, className: `w-8 h-8 object-contain ${!isObtenida ? 'grayscale' : ''}`, onError: handleImageError }) }));
};
