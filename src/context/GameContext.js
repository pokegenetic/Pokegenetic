import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { getPokemonTeam as getLocalStoragePokemonTeam } from '../lib/equipoStorage';
const GameContext = createContext(undefined);
export const GameProvider = ({ children }) => {
    const [selectedGame, setSelectedGameState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pokemonTeam, setPokemonTeamState] = useState(getLocalStoragePokemonTeam);
    // Función para sincronizar equipo con Firebase
    const syncTeamWithFirebase = async (team) => {
        // Esta función se implementará cuando tengamos acceso al usuario
        // Para evitar dependencia circular, la implementaremos más adelante
    };
    useEffect(() => {
        const savedGame = localStorage.getItem('selectedGame');
        if (savedGame) {
            setSelectedGameState(JSON.parse(savedGame));
        }
        setIsLoading(false);
    }, []);
    // Sincronizar con localStorage para detectar cambios de equipo
    useEffect(() => {
        const checkForTeamChanges = () => {
            const storedTeam = getLocalStoragePokemonTeam();
            // Convertir a string para comparación sencilla
            const currentTeamStr = JSON.stringify(pokemonTeam);
            const storedTeamStr = JSON.stringify(storedTeam);
            if (currentTeamStr !== storedTeamStr) {
                setPokemonTeamState(storedTeam);
            }
        };
        // Verificar cada segundo
        const intervalId = setInterval(checkForTeamChanges, 1000);
        return () => {
            clearInterval(intervalId);
        };
    }, [pokemonTeam]);
    // Efecto para mantener el estado sincronizado con localStorage
    useEffect(() => {
        // Esta función actualiza el estado desde localStorage
        const syncTeamFromStorage = () => {
            const storedTeam = getLocalStoragePokemonTeam();
            setPokemonTeamState(storedTeam);
        };
        // Sincronizar cuando cambia localStorage
        window.addEventListener('storage', syncTeamFromStorage);
        // También sincronizar al montar el componente
        syncTeamFromStorage();
        return () => {
            window.removeEventListener('storage', syncTeamFromStorage);
        };
    }, []);
    const setSelectedGame = (game) => {
        localStorage.setItem('selectedGame', JSON.stringify(game));
        setSelectedGameState(game);
    };
    const addPokemonToTeam = (pokemon) => {
        const updatedTeam = [...pokemonTeam, pokemon];
        setPokemonTeamState(updatedTeam);
    };
    const removePokemonFromTeam = (index) => {
        const updatedTeam = pokemonTeam.filter((_, i) => i !== index);
        setPokemonTeamState(updatedTeam);
    };
    const updatePokemonInTeam = (index, pokemon) => {
        const updatedTeam = [...pokemonTeam];
        updatedTeam[index] = pokemon;
        setPokemonTeamState(updatedTeam);
    };
    const clearPokemonTeam = () => {
        setPokemonTeamState([]);
        // También limpiar localStorage directamente
        localStorage.removeItem('pokemonTeam');
        localStorage.removeItem('pokemonTeamShowdownText');
    };
    return (_jsx(GameContext.Provider, { value: {
            selectedGame,
            setSelectedGame,
            isLoading,
            pokemonTeam,
            addPokemonToTeam,
            removePokemonFromTeam,
            updatePokemonInTeam,
            clearPokemonTeam
        }, children: children }));
};
export const useGame = () => {
    const context = useContext(GameContext);
    if (!context)
        throw new Error('useGame debe usarse dentro de GameProvider');
    return context;
};
