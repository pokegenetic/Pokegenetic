import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import pokeballImg from '@/img/pokeballs/pokeball.png';
import superballImg from '@/img/pokeballs/superball.png';
import ultraballImg from '@/img/pokeballs/ultraball.png';
import masterballImg from '@/img/pokeballs/masterball.png';
const BALL_TYPES = [
    { key: 'pokeball', label: 'Pokéball', color: '#e53e3e', sprite: pokeballImg },
    { key: 'superball', label: 'Super Ball', color: '#3182ce', sprite: superballImg },
    { key: 'ultraball', label: 'Ultra Ball', color: '#ecc94b', sprite: ultraballImg },
    { key: 'masterball', label: 'Master Ball', color: '#9f7aea', sprite: masterballImg },
];
export const DEFAULT_BALLS = {
    pokeball: 10,
    superball: 0,
    ultraball: 0,
    masterball: 0,
};
export function getUserPokeballs() {
    // Leer desde localStorage primero, luego fallback a defaults
    try {
        const stored = localStorage.getItem('userPokeballs');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Validar que el objeto tenga las propiedades correctas
            if (parsed && typeof parsed === 'object' &&
                typeof parsed.pokeball === 'number' &&
                typeof parsed.superball === 'number' &&
                typeof parsed.ultraball === 'number' &&
                typeof parsed.masterball === 'number') {
                return parsed;
            }
        }
    }
    catch (error) {
        console.error('Error parsing pokeballs from localStorage:', error);
    }
    // Fallback a valores por defecto
    return { ...DEFAULT_BALLS };
}
export async function setUserPokeballs(balls) {
    // Guardar en localStorage PRIMERO (como hace el equipo)
    try {
        localStorage.setItem('userPokeballs', JSON.stringify(balls));
        console.log('🔄 Pokeballs guardadas en localStorage:', balls);
        // Trigger an event to update any listening components
        window.dispatchEvent(new CustomEvent('pokeballsUpdated', { detail: balls }));
        // El UserContext detectará el cambio en localStorage y sincronizará con Firestore
    }
    catch (error) {
        console.error('❌ Error saving pokeballs to localStorage:', error);
        throw error;
    }
}
export async function getUserPokeballsWithSync() {
    // Intentar obtener del contexto de usuario primero
    try {
        const { auth } = await import('../../lib/firebase');
        const { getUserProfile } = await import('../../lib/userData');
        const currentUser = auth.currentUser;
        if (currentUser?.uid && currentUser?.email) {
            const profile = await getUserProfile(currentUser.uid, currentUser.email);
            if (profile?.pokeballs && typeof profile.pokeballs === 'object') {
                // Return pokeballs from Firestore directly
                return profile.pokeballs;
            }
        }
    }
    catch (error) {
        console.error('Error loading pokeballs from Firebase:', error);
    }
    // Fallback to default pokeballs if no user or error
    return DEFAULT_BALLS;
}
export function PokeballsDisplay({ balls: externalBalls, subscribe, onSelectBall, selectedBallKey } = {}) {
    const { user } = useUser();
    const [balls, setBalls] = useState(externalBalls || DEFAULT_BALLS);
    const [shakeKeys, setShakeKeys] = useState({});
    // Inicializar con datos del perfil del usuario
    useEffect(() => {
        console.log('🔄 Pokeballs: useEffect [user.profile] ejecutándose:', {
            hasUser: !!user,
            hasProfile: !!user?.profile,
            hasPokeballs: !!user?.profile?.pokeballs,
            pokeballs: user?.profile?.pokeballs
        });
        if (user?.profile?.pokeballs) {
            console.log('🔄 Pokeballs: Inicializando con datos del perfil:', user.profile.pokeballs);
            setBalls(user.profile.pokeballs);
        }
        else if (!user?.uid) {
            // Si no hay usuario, usar valores por defecto
            console.log('🔄 Pokeballs: Usuario no logueado, usando valores por defecto');
            setBalls(DEFAULT_BALLS);
        }
        else if (user?.uid && !user?.profile?.pokeballs) {
            // Usuario logueado pero sin pokeballs en el perfil, usar valores por defecto
            console.log('🔄 Pokeballs: Usuario logueado sin pokeballs, usando valores por defecto');
            setBalls(DEFAULT_BALLS);
        }
    }, [user?.profile?.pokeballs, user?.uid, user?.profile]);
    // Escuchar eventos de actualización de pokeballs desde UserContext
    useEffect(() => {
        const handlePokeballsUpdate = (event) => {
            console.log('🔄 Pokeballs: Recibido evento pokeballsUpdated:', event.detail);
            setBalls(event.detail);
        };
        window.addEventListener('pokeballsUpdated', handlePokeballsUpdate);
        return () => {
            window.removeEventListener('pokeballsUpdated', handlePokeballsUpdate);
        };
    }, []);
    // Listener adicional para cuando se actualice el perfil completo
    useEffect(() => {
        const handleProfileUpdate = (event) => {
            console.log('🔄 Pokeballs: Recibido evento profileUpdated:', event.detail);
            if (event.detail?.pokeballs) {
                setBalls(event.detail.pokeballs);
            }
        };
        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);
    // Si se pasa balls como prop, usarlo siempre (para compatibilidad con componentes existentes)
    useEffect(() => {
        if (externalBalls)
            setBalls(externalBalls);
    }, [externalBalls]);
    // Permite suscripción para actualización en tiempo real (para compatibilidad)
    useEffect(() => {
        if (subscribe) {
            return subscribe(() => setBalls(getUserPokeballs()));
        }
    }, [subscribe]);
    // Gentle shake every 3s for available balls
    useEffect(() => {
        const interval = setInterval(() => {
            const newShakeKeys = {};
            BALL_TYPES.forEach(ball => {
                if (balls[ball.key] > 0) {
                    newShakeKeys[ball.key] = Math.random(); // force re-render for animation
                }
            });
            setShakeKeys(newShakeKeys);
            // Remove shake after animation duration
            setTimeout(() => setShakeKeys({}), 700);
        }, 3000);
        return () => clearInterval(interval);
    }, [balls]);
    return (_jsx("div", { className: "flex flex-row gap-4 justify-center items-end mt-2", style: { background: 'rgba(255,255,255,0.35)', borderRadius: 12, padding: 8 }, children: BALL_TYPES.map(ball => {
            const available = balls[ball.key] > 0;
            const isSelected = selectedBallKey === ball.key;
            return (_jsxs("div", { className: `flex flex-col items-center ${available ? 'pokeball-selectable' : 'pokeball-disabled'}${isSelected ? ' ring-2 ring-yellow-400' : ''}`, onClick: () => available && onSelectBall && onSelectBall(ball.key), style: {
                    borderRadius: 8,
                    boxShadow: isSelected ? '0 0 0 2px #ecc94b, 0 2px 8px #0002' : undefined,
                    background: isSelected ? 'rgba(255,255,200,0.18)' : undefined,
                    transition: 'box-shadow 0.18s, background 0.18s',
                    cursor: available ? 'pointer' : 'not-allowed',
                    padding: 2,
                    minWidth: 64,
                    // Añadir un borde pulsante para los disponibles cuando el seleccionado está agotado
                    ...(available && !Object.values(balls).every(count => count === 0) && balls[selectedBallKey] === 0 && ball.key !== selectedBallKey ? {
                        animation: 'pokeball-available-pulse 2s ease-in-out infinite',
                        border: '2px solid #22c55e',
                    } : {})
                }, tabIndex: available ? 0 : -1, "aria-disabled": !available, children: [_jsx("img", { src: ball.sprite, alt: ball.label, style: {
                            width: 48,
                            height: 48,
                            marginBottom: 2,
                            imageRendering: 'auto',
                            filter: available ? undefined : 'grayscale(1) brightness(1.15)',
                            opacity: available ? 1 : 0.5,
                            transition: 'filter 0.2s, opacity 0.2s',
                            display: 'block',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }, className: shakeKeys[ball.key] && available ? 'pokeball-gentle-shake' : '' }), _jsx("span", { className: "text-xs font-semibold whitespace-nowrap text-center w-full block mt-1", style: { color: ball.color, lineHeight: 1.1 }, children: ball.label }), _jsx("span", { className: "text-sm font-bold text-gray-800 mt-0.5", children: balls[ball.key] })] }, ball.key));
        }) }));
}
