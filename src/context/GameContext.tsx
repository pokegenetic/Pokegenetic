import { createContext, useContext, useEffect, useState } from 'react'
import { getPokemonTeam as getLocalStoragePokemonTeam, type PackEntry, type HomePackEntry } from '../lib/equipoStorage'
import { updateUserEquipo } from '../lib/userData'
import type { ParsedPokemon } from '../lib/parseShowdown'

type Game = {
  id: string
  name: string
  region: string
  generation: string
}

type Pokemon = {
  name: string;
  species: string;
  gender: string;
  item: string;
  ability: string | null;
  isShiny: boolean;
  isHO: boolean;
  teraType: string;
  EVs: Record<string, number>;
  IVs: Record<string, number>;
  nature: string;
  moves: string[];
  level: number;
  types: string[];
  caught?: boolean; // Indicates if the Pokémon is caught
  price?: number; // Price of the Pokémon
}

type GameContextType = {
  selectedGame: Game | null
  setSelectedGame: (game: Game) => void
  isLoading: boolean
  pokemonTeam: (ParsedPokemon | PackEntry | HomePackEntry)[]
  addPokemonToTeam: (pokemon: ParsedPokemon | PackEntry | HomePackEntry) => void
  removePokemonFromTeam: (index: number) => void
  updatePokemonInTeam: (index: number, pokemon: ParsedPokemon | PackEntry | HomePackEntry) => void
  clearPokemonTeam: () => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedGame, setSelectedGameState] = useState<Game | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pokemonTeam, setPokemonTeamState] = useState<(ParsedPokemon | PackEntry | HomePackEntry)[]>(getLocalStoragePokemonTeam)

  // Función para sincronizar equipo con Firebase
  const syncTeamWithFirebase = async (team: (ParsedPokemon | PackEntry | HomePackEntry)[]) => {
    // Esta función se implementará cuando tengamos acceso al usuario
    // Para evitar dependencia circular, la implementaremos más adelante
  }

  useEffect(() => {
    const savedGame = localStorage.getItem('selectedGame')
    if (savedGame) {
      setSelectedGameState(JSON.parse(savedGame))
    }
    setIsLoading(false)
  }, [])
  
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
    }
    
    // Sincronizar cuando cambia localStorage
    window.addEventListener('storage', syncTeamFromStorage);
    
    // También sincronizar al montar el componente
    syncTeamFromStorage();
    
    return () => {
      window.removeEventListener('storage', syncTeamFromStorage);
    }
  }, [])

  const setSelectedGame = (game: Game) => {
    localStorage.setItem('selectedGame', JSON.stringify(game))
    setSelectedGameState(game)
  }

  const addPokemonToTeam = (pokemon: ParsedPokemon | PackEntry | HomePackEntry) => {
    const updatedTeam = [...pokemonTeam, pokemon];
    setPokemonTeamState(updatedTeam);
  }

  const removePokemonFromTeam = (index: number) => {
    const updatedTeam = pokemonTeam.filter((_, i) => i !== index)
    setPokemonTeamState(updatedTeam)
  }

  const updatePokemonInTeam = (index: number, pokemon: ParsedPokemon | PackEntry | HomePackEntry) => {
    const updatedTeam = [...pokemonTeam]
    updatedTeam[index] = pokemon
    setPokemonTeamState(updatedTeam)
  }

  const clearPokemonTeam = () => {
    setPokemonTeamState([]);
    // También limpiar localStorage directamente
    localStorage.removeItem('pokemonTeam');
    localStorage.removeItem('pokemonTeamShowdownText');
  };

  return (
    <GameContext.Provider value={{ 
      selectedGame, 
      setSelectedGame, 
      isLoading, 
      pokemonTeam, 
      addPokemonToTeam,
      removePokemonFromTeam,
      updatePokemonInTeam,
      clearPokemonTeam
    }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame debe usarse dentro de GameProvider')
  return context
}