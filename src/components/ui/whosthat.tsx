import React, { useState, useEffect, useRef, useCallback } from 'react';
import pokemonList from '@/data/sv/pokemon-sv.json';
import { playSoundEffect } from '@/lib/soundEffects'; // Se mantiene por si se usa en otros lados o para el click
import { useUser } from '../../context/UserContext';
import { getUserPokeballs, setUserPokeballs } from './pokeballs';
import whosThatAudio from '../../sounds/sfx/whosthat.mp3';
import levelUpSoundFile from '../../sounds/sfx/levelup.mp3'; // Importar sonido de acierto
import nothingSoundFile from '../../sounds/sfx/nothing.mp3'; // Importar sonido de error

// Filtered list of Pokémon without hyphens in their names
const simplePokemonList = pokemonList.filter(pokemon => !pokemon.name.includes('-'));

function getRandomPokemon() {
  if (simplePokemonList.length === 0) {
    // Fallback or error handling if all Pokémon have hyphens (very unlikely)
    console.warn("No Pokémon without hyphens found. Falling back to the original list.");
    return pokemonList[Math.floor(Math.random() * pokemonList.length)];
  }
  return simplePokemonList[Math.floor(Math.random() * simplePokemonList.length)];
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function WhosThatPokemon() {
  const { user, triggerFichasUpdate } = useUser();
  const [pokemon, setPokemon] = useState(() => getRandomPokemon());
  const [guess, setGuess] = useState('');
  const [resultMessage, setResultMessage] = useState<{status: string, details: string, type: 'correct' | 'incorrect' | ''}>({status: '', details: '', type: ''});
  const [revealed, setRevealed] = useState(false);
  
  // Estados para el sistema de recompensas diarias
  const [dailyStats, setDailyStats] = useState({
    attemptsUsed: 0,
    correctAnswers: 0,
    maxAttempts: 10,
    skipsUsed: 0,
    maxSkips: 3,
    currentStreak: 0,
    lastReset: new Date().toDateString(),
    pokemonSkippedToday: [] as string[],
    dailyRewardClaimed: false
  });
  
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [skipTimer, setSkipTimer] = useState<NodeJS.Timeout | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  
  // Estados para las animaciones
  const [showInput, setShowInput] = useState(false);
  const [titleText, setTitleText] = useState('');
  const [spriteVisible, setSpriteVisible] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false); // Tracks "whosthat.mp3" specifically
  const [spriteScale, setSpriteScale] = useState(1.3);
  const [titleDramatic, setTitleDramatic] = useState(false);
  const [inputContainerScale, setInputContainerScale] = useState(1);
  const [animateCorrectGuess, setAnimateCorrectGuess] = useState(false); // Nuevo estado para animación de acierto

  // Refs para controlar audio, timeouts, e intervalos
  const cryAudioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const currentGenerationRef = useRef(0); // Generation counter

  const fullTitle = "¿Quién es ese Pokémon?";

  // Función para verificar y resetear estadísticas diarias
  const checkDailyReset = useCallback(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('whosthat_daily_stats');
    
    if (stored) {
      const parsedStats = JSON.parse(stored);
      if (parsedStats.lastReset !== today) {
        // Es un nuevo día, resetear estadísticas
        const newStats = {
          attemptsUsed: 0,
          correctAnswers: 0,
          maxAttempts: 10,
          skipsUsed: 0,
          maxSkips: 3,
          currentStreak: 0,
          lastReset: today,
          pokemonSkippedToday: [],
          dailyRewardClaimed: false
        };
        setDailyStats(newStats);
        localStorage.setItem('whosthat_daily_stats', JSON.stringify(newStats));
        setCanPlay(true);
        return newStats;
      } else {
        // Mismo día, cargar estadísticas existentes
        setDailyStats(parsedStats);
        setCanPlay(parsedStats.attemptsUsed < parsedStats.maxAttempts);
        return parsedStats;
      }
    } else {
      // Primera vez jugando
      const newStats = {
        attemptsUsed: 0,
        correctAnswers: 0,
        maxAttempts: 10,
        skipsUsed: 0,
        maxSkips: 3,
        currentStreak: 0,
        lastReset: today,
        pokemonSkippedToday: [],
        dailyRewardClaimed: false
      };
      setDailyStats(newStats);
      localStorage.setItem('whosthat_daily_stats', JSON.stringify(newStats));
      setCanPlay(true);
      return newStats;
    }
  }, []);

  // Función para actualizar estadísticas diarias
  const updateDailyStats = useCallback((isCorrect: boolean, isSkip: boolean = false) => {
    setDailyStats(prevStats => {
      const newStats = {
        ...prevStats,
        attemptsUsed: isSkip ? prevStats.attemptsUsed : prevStats.attemptsUsed + 1,
        correctAnswers: isCorrect ? prevStats.correctAnswers + 1 : prevStats.correctAnswers,
        currentStreak: isCorrect ? prevStats.currentStreak + 1 : 0,
        skipsUsed: isSkip ? prevStats.skipsUsed + 1 : prevStats.skipsUsed,
        pokemonSkippedToday: isSkip ? [...prevStats.pokemonSkippedToday, pokemon.name] : prevStats.pokemonSkippedToday
      };
      
      localStorage.setItem('whosthat_daily_stats', JSON.stringify(newStats));
      
      // Verificar si se agotaron los intentos
      if (newStats.attemptsUsed >= newStats.maxAttempts) {
        setCanPlay(false);
        // Mostrar recompensa diaria si no se ha reclamado
        if (!newStats.dailyRewardClaimed) {
          setTimeout(() => setShowDailyReward(true), 2000);
        }
      }
      
      return newStats;
    });
  }, [pokemon.name]);

  // Función para calcular recompensas diarias
  const calculateDailyReward = useCallback(() => {
    const { correctAnswers, skipsUsed, maxAttempts } = dailyStats;
    const accuracy = correctAnswers / maxAttempts;
    const usedNoSkips = skipsUsed === 0;
    
    let reward = {
      level: '',
      pokeballs: 0,
      superballs: 0,
      ultraballs: 0,
      masterballs: 0,
      fichas: 0,
      bonus: 0,
      title: ''
    };
    
    if (correctAnswers === 10) {
      // Maestro Pokémon
      reward = {
        level: '💎 Maestro Pokémon',
        pokeballs: 5,
        superballs: 3,
        ultraballs: 2,
        masterballs: 1,
        fichas: 25,
        bonus: usedNoSkips ? 5 : 0,
        title: usedNoSkips ? 'Maestro Pokémon Perfecto' : 'Maestro Pokémon'
      };
    } else if (correctAnswers >= 7) {
      // Oro
      reward = {
        level: '🥇 Oro',
        pokeballs: 2,
        superballs: 2,
        ultraballs: 1,
        masterballs: 0,
        fichas: 15,
        bonus: 0,
        title: 'Entrenador Experto'
      };
    } else if (correctAnswers >= 4) {
      // Plata
      reward = {
        level: '🥈 Plata',
        pokeballs: 3,
        superballs: 1,
        ultraballs: 0,
        masterballs: 0,
        fichas: 10,
        bonus: 0,
        title: 'Entrenador Competente'
      };
    } else if (correctAnswers >= 1) {
      // Bronce
      reward = {
        level: '🥉 Bronce',
        pokeballs: 2,
        superballs: 0,
        ultraballs: 0,
        masterballs: 0,
        fichas: 5,
        bonus: 0,
        title: 'Entrenador Novato'
      };
    }
    
    return reward;
  }, [dailyStats]);

  // Función para reclamar recompensa diaria
  const claimDailyReward = useCallback(async () => {
    const reward = calculateDailyReward();
    
    try {
      // Obtener pokéballs actuales del usuario usando el mismo sistema que coinmachine
      const currentPokeballs = await getUserPokeballs();
      const newPokeballs = { ...currentPokeballs };
      
      // Agregar pokéballs según el premio
      if (reward.pokeballs > 0) {
        newPokeballs.pokeball = (newPokeballs.pokeball || 0) + reward.pokeballs;
      }
      if (reward.superballs > 0) {
        newPokeballs.superball = (newPokeballs.superball || 0) + reward.superballs;
      }
      if (reward.ultraballs > 0) {
        newPokeballs.ultraball = (newPokeballs.ultraball || 0) + reward.ultraballs;
      }
      if (reward.masterballs > 0) {
        newPokeballs.masterball = (newPokeballs.masterball || 0) + reward.masterballs;
      }
      
      // Actualizar pokeballs del usuario usando el mismo sistema que coinmachine
      await setUserPokeballs(newPokeballs);
      
      // Sumar fichas usando el sistema del UserContext como coinmachine
      if (reward.fichas + reward.bonus > 0 && user?.profile) {
        const currentFichas = user.profile.fichas || 0;
        const newFichas = currentFichas + reward.fichas + reward.bonus;
        triggerFichasUpdate(newFichas);
      }
      
      // Marcar como reclamada
      const newStats = { ...dailyStats, dailyRewardClaimed: true };
      setDailyStats(newStats);
      localStorage.setItem('whosthat_daily_stats', JSON.stringify(newStats));
      
      setShowDailyReward(false);
      
      console.log('🎁 Recompensas reclamadas:', {
        pokeballs: reward.pokeballs,
        superballs: reward.superballs,
        ultraballs: reward.ultraballs,
        masterballs: reward.masterballs,
        fichas: reward.fichas + reward.bonus,
        newPokeballsTotal: newPokeballs,
        newFichasTotal: user?.profile ? (user.profile.fichas || 0) + reward.fichas + reward.bonus : 'N/A'
      });
    } catch (error) {
      console.error('❌ Error al reclamar recompensas:', error);
    }
  }, [dailyStats, calculateDailyReward, user, triggerFichasUpdate]);

  // Función para saltar Pokémon
  const handleSkipPokemon = useCallback(() => {
    if (dailyStats.skipsUsed >= dailyStats.maxSkips) return;
    
    playSoundEffect('notification', 0.1);
    updateDailyStats(false, true);
    
    // Limpiar timer del botón skip
    if (skipTimer) {
      clearTimeout(skipTimer);
      setSkipTimer(null);
    }
    setShowSkipButton(false);
    
    // Generar nuevo Pokémon (evitando los ya saltados)
    currentGenerationRef.current += 1;
    const nextGeneration = currentGenerationRef.current;
    setupNewRound(nextGeneration);
  }, [dailyStats.skipsUsed, dailyStats.maxSkips, skipTimer, updateDailyStats]);

  // Función para limpiar todos los timers y el audio del cry
  const clearAllTimersAndAudio = useCallback(() => {
    console.log(`🧹 Clearing timers and audio for generation ${currentGenerationRef.current}`);
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
    
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];
    
    if (cryAudioRef.current) {
      cryAudioRef.current.pause();
      cryAudioRef.current.src = ''; // Detach source to stop download/playback
      cryAudioRef.current.load(); // Reset audio element
      cryAudioRef.current = null;
      console.log('🔇 Cry audio stopped and cleared.');
    }
  }, []);

  // Función para animar el título con efecto typewriter
  const animateTitle = useCallback((generation: number) => {
    if (generation !== currentGenerationRef.current) return;
    console.log(`✍️ Animating title for generation ${generation}`);
    
    let currentIndex = 0;
    setTitleText(''); // Ensure title starts empty for the current generation
    const interval = setInterval(() => {
      if (generation !== currentGenerationRef.current) {
        clearInterval(interval);
        return;
      }
      if (currentIndex <= fullTitle.length) {
        setTitleText(fullTitle.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        // Remover del array cuando termine
        const index = intervalsRef.current.indexOf(interval);
        if (index > -1) intervalsRef.current.splice(index, 1);
        
        // Quitar efecto dramático después de completar el título con transición más suave
        const timeout = setTimeout(() => {
          if (generation !== currentGenerationRef.current) return;
          setTitleDramatic(false);
        }, 800); // Aumentamos el delay para una transición más gradual
        timeoutsRef.current.push(timeout);
      }
    }, 60);
    intervalsRef.current.push(interval);
  }, [fullTitle]); // fullTitle is stable

  // Función para reproducir el cry del Pokémon
  const playCryForCurrentGeneration = useCallback((pokemonToPlay: { name: string }, generation: number) => {
    if (generation !== currentGenerationRef.current) {
      console.log(`🚫 Cry for ${pokemonToPlay.name} skipped (generation ${generation} !== ${currentGenerationRef.current})`);
      return;
    }
    if (!pokemonToPlay) {
      console.log('⚠️ No se especificó pokémon para reproducir cry');
      return;
    }
    
    console.log(`🎵 Attempting to play cry for: ${pokemonToPlay.name} (generation ${generation})`);

    // Clear previous cry audio instance *before* creating a new one
    if (cryAudioRef.current) {
        cryAudioRef.current.pause();
        cryAudioRef.current.src = '';
        cryAudioRef.current.load();
        cryAudioRef.current = null;
        console.log('🔇 Previous cry audio instance cleared before new play.');
    }
    
    try {
      const cryUrl = `https://play.pokemonshowdown.com/audio/cries/${pokemonToPlay.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.mp3`;
      const newCryAudio = new Audio(cryUrl);
      newCryAudio.volume = 0.4;
      cryAudioRef.current = newCryAudio; // Assign to ref immediately

      newCryAudio.play()
        .then(() => {
          if (generation !== currentGenerationRef.current) {
            console.log(`🔇 Cry for ${pokemonToPlay.name} played but generation changed, stopping.`);
            if (newCryAudio) { // Check if it's still the same audio object
                newCryAudio.pause();
                newCryAudio.src = '';
                newCryAudio.load();
            }
            if(cryAudioRef.current === newCryAudio) cryAudioRef.current = null;
            return;
          }
          console.log(`✅ Cry de ${pokemonToPlay.name} reproducido (generation ${generation})`);
        })
        .catch(error => {
          if (generation !== currentGenerationRef.current) {
            console.log(`🔇 Cry for ${pokemonToPlay.name} failed but generation changed.`);
            if(cryAudioRef.current === newCryAudio) cryAudioRef.current = null;
            return;
          }
          console.log(`ℹ️ Cry de ${pokemonToPlay.name} no disponible (generation ${generation}):`, error);
          if(cryAudioRef.current === newCryAudio) cryAudioRef.current = null;
        });
    } catch (error) {
      console.log(`ℹ️ Error preparing cry for ${pokemonToPlay.name} (generation ${generation}):`, error);
      if(cryAudioRef.current) cryAudioRef.current = null;
    }
  }, []); // No dependencies that change frequently

  // Función para configurar una nueva ronda del juego
  const setupNewRound = useCallback((generation: number) => {
    if (generation !== currentGenerationRef.current) return;

    console.log(`🚀 Setting up new round for generation ${generation}`);
    clearAllTimersAndAudio();

    const newPokemon = getRandomPokemon();
    console.log(`✨ New Pokémon for generation ${generation}: ${newPokemon.name}`);

    setPokemon(newPokemon);
    setGuess('');
    setResultMessage({status: '', details: '', type: ''}); // Resetear mensaje de resultado
    setRevealed(false);
    setShowInput(false);
    setTitleText(''); // Reset title text for typewriter
    setSpriteVisible(false);
    setAudioPlaying(true); // For "whosthat.mp3"
    setSpriteScale(1.3); // Initial scale before zoom
    setTitleDramatic(false); // Reset dramatic title state
    setInputContainerScale(1.2); // Iniciar escala grande para el input y botón
    setAnimateCorrectGuess(false); // Resetear animación de acierto
    
    // Resetear estado del botón skip
    setShowSkipButton(false);
    if (skipTimer) {
      clearTimeout(skipTimer);
      setSkipTimer(null);
    }

    // 1. Reproducir sonido "Who's that Pokemon"
    const whosThatSound = new Audio(whosThatAudio);
    whosThatSound.volume = 0.3;
    
    whosThatSound.play()
      .then(() => {
        if (generation !== currentGenerationRef.current) {
            whosThatSound.pause();
            return;
        }
        console.log(`✅ whosthat.mp3 played (gen ${generation})`);

        // 2. Iniciar animación dramática del título
        const timeout1 = setTimeout(() => {
          if (generation !== currentGenerationRef.current) return;
          setTitleDramatic(true);
          animateTitle(generation);
        }, 200);
        timeoutsRef.current.push(timeout1);

        // 3. Mostrar sprite grande después de que termine el título (approx 2.3s)
        const timeout2 = setTimeout(() => {
          if (generation !== currentGenerationRef.current) return;
          setSpriteVisible(true);
          setSpriteScale(2.5); // Zoom in

          // Animar reducción de tamaño gradualmente
          const scaleInterval = setInterval(() => {
            if (generation !== currentGenerationRef.current) {
              clearInterval(scaleInterval);
              return;
            }
            setSpriteScale(prevScale => {
              const newScale = prevScale - 0.1;
              if (newScale <= 1.3) {
                clearInterval(scaleInterval);
                const index = intervalsRef.current.indexOf(scaleInterval);
                if (index > -1) intervalsRef.current.splice(index, 1);
                return 1.3;
              }
              return newScale;
            });
          }, 100);
          intervalsRef.current.push(scaleInterval);
        }, 2300); // Title animation is roughly 2.1s (fullTitle.length * 60ms)
        timeoutsRef.current.push(timeout2);

        // 4. Reproducir cry del Pokémon como pista
        const timeout3 = setTimeout(() => {
          if (generation !== currentGenerationRef.current) return;
          playCryForCurrentGeneration(newPokemon, generation);
        }, 3000); // After sprite appears and starts scaling
        timeoutsRef.current.push(timeout3);

        // 5. Mostrar input y finalizar audioPlaying (para whosthat.mp3)
        const timeout4 = setTimeout(() => {
          if (generation !== currentGenerationRef.current) return;
          setShowInput(true);
          setAudioPlaying(false); // "whosthat.mp3" sequence finished
          
          // Animar la escala del input a su tamaño normal
          const timeoutScaleInput = setTimeout(() => {
            if (generation !== currentGenerationRef.current) return;
            setInputContainerScale(1);
          }, 100); // Pequeño retraso para que la animación sea visible
          timeoutsRef.current.push(timeoutScaleInput);

          // Inicializar timer para mostrar botón de skip (solo si aún puede saltar)
          if (dailyStats.skipsUsed < dailyStats.maxSkips && canPlay) {
            const skipTimerTimeout = setTimeout(() => {
              if (generation !== currentGenerationRef.current) return;
              setShowSkipButton(true);
            }, 15000); // 15 segundos
            setSkipTimer(skipTimerTimeout);
            timeoutsRef.current.push(skipTimerTimeout);
          }

        }, 4500); // After cry has a chance to play
        timeoutsRef.current.push(timeout4);

      })
      .catch(error => {
        if (generation !== currentGenerationRef.current) return;
        console.error(`❌ Error playing whosthat.mp3 (gen ${generation}):`, error);
        // Fallback: mostrar UI directamente si el audio principal falla
        setShowInput(true);
        setAudioPlaying(false);
        setTitleText(fullTitle);
        setSpriteVisible(true);
        setTitleDramatic(false); // Ensure title is not stuck in dramatic state
      });
  }, [clearAllTimersAndAudio, animateTitle, playCryForCurrentGeneration, fullTitle]);


  useEffect(() => {
    // Inicializar estadísticas diarias al cargar el componente
    checkDailyReset();
    
    currentGenerationRef.current += 1;
    const initialGeneration = currentGenerationRef.current;
    console.log(`🔄 Initializing WhosThatPokemon - Generation ${initialGeneration}`);
    setupNewRound(initialGeneration);

    return () => {
      // Increment generation on unmount to invalidate all pending operations
      // from the generation that was active during this effect's lifecycle.
      currentGenerationRef.current += 1; 
      console.log(`🧹 Cleanup WhosThatPokemon - New Generation is ${currentGenerationRef.current}. Clearing timers/audio from previous.`);
      clearAllTimersAndAudio();
    };
  }, [setupNewRound, clearAllTimersAndAudio, checkDailyReset]); // setupNewRound and clearAllTimersAndAudio are memoized

  // ... (animateTitle and playCry are now useCallback, defined above setupNewRound)

  const handleCheck = () => {
    if (!canPlay) return; // No permitir más intentos si se agotaron
    
    const isCorrect = normalizeName(guess) === normalizeName(pokemon.name);

    // Actualizar estadísticas diarias
    updateDailyStats(isCorrect, false);

    if (isCorrect) {
      setResultMessage({status: "¡Correcto!", details: `Es ${pokemon.name}. Has ganado 1 Pokéball.`, type: 'correct'});
      setRevealed(true);
      setAnimateCorrectGuess(true); // Activar animación de acierto

      // Reproducir cry del Pokémon actual (asegurándose que es la generación correcta)
      playCryForCurrentGeneration(pokemon, currentGenerationRef.current);
      
      // Suma pokeball usando el sistema unificado
      getUserPokeballs().then(currentPokeballs => {
        const newPokeballs = { 
          ...currentPokeballs, 
          pokeball: (currentPokeballs.pokeball || 0) + 1 
        };
        setUserPokeballs(newPokeballs);
      }).catch(error => {
        console.error('Error al actualizar pokeballs:', error);
      });
      
      // Suma pokémon adivinados
      const currentGuessed = parseInt(localStorage.getItem('pokemon_guessed') || '0', 10);
      localStorage.setItem('pokemon_guessed', String(currentGuessed + 1));

      // Reproducir sonido de acierto
      const audio = new Audio(levelUpSoundFile);
      audio.volume = 0.3;
      audio.play().catch(error => console.error("Error playing level up sound:", error));

      // Animación de escala del sprite
      setSpriteScale(1.6); // Agrandar
      const timeoutId = setTimeout(() => {
        if (currentGenerationRef.current) { // Solo si aún estamos en una ronda activa
            setSpriteScale(1.3); // Volver al tamaño normal
            setAnimateCorrectGuess(false); // Desactivar para la próxima ronda
        }
      }, 500); // Duración de la animación de agrandamiento
      timeoutsRef.current.push(timeoutId);

    } else {
      setResultMessage({status: "¡Incorrecto!", details: "¡Sigue intentando!", type: 'incorrect'});
      // No revelar el Pokémon si es incorrecto, permitir más intentos

      // Reproducir sonido de error
      const audio = new Audio(nothingSoundFile);
      audio.volume = 0.3;
      audio.play().catch(error => console.error("Error playing nothing sound:", error));
    }
  };

  const handleNext = () => {
    if (!canPlay) return; // No permitir continuar si se agotaron los intentos
    
    currentGenerationRef.current += 1;
    const nextGeneration = currentGenerationRef.current;
    console.log(`🔄 Handling Next - Advancing to Generation ${nextGeneration}`);
    // No need to call clearAllTimersAndAudio here, setupNewRound will do it.
    setupNewRound(nextGeneration);
  };

  // Función para resetear intentos diarios (solo para desarrollo)
  const resetDailyAttemptsForDev = useCallback(() => {
    const today = new Date().toDateString();
    const newStats = {
      attemptsUsed: 0,
      correctAnswers: 0,
      maxAttempts: 10,
      skipsUsed: 0,
      maxSkips: 3,
      currentStreak: 0,
      lastReset: today,
      pokemonSkippedToday: [],
      dailyRewardClaimed: false
    };
    
    setDailyStats(newStats);
    localStorage.setItem('whosthat_daily_stats', JSON.stringify(newStats));
    setCanPlay(true);
    setShowDailyReward(false);
    
    // Reiniciar la ronda actual también
    currentGenerationRef.current += 1;
    const nextGeneration = currentGenerationRef.current;
    setupNewRound(nextGeneration);
    
    console.log('🔧 DEV: Intentos diarios reseteados');
    playSoundEffect('notification', 0.1);
  }, [setupNewRound]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full relative">
      {/* Botón de desarrollo - esquina superior derecha */}
      <button
        onClick={resetDailyAttemptsForDev}
        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-md transition-all duration-200 hover:scale-105 z-50"
        title="DEV: Resetear intentos diarios"
      >
        🔧 Reset
      </button>

      {/* Título con animación typewriter dramática */}
      <h2 className={`text-3xl sm:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent min-h-[3rem] transition-all duration-1000 ease-out ${
        titleDramatic ? 'text-5xl sm:text-6xl transform scale-110 animate-pulse drop-shadow-2xl' : ''
      }`}>
        {titleText}
        {audioPlaying && titleText.length < fullTitle.length && (
          <span className="animate-ping text-yellow-400">|</span>
        )}
      </h2>
      
      {/* Mostrar descripción solo cuando el título esté completo */}
      {titleText === fullTitle && !titleDramatic && (
        <div className="animate-fade-in-down space-y-3 mb-4">
          <p className="text-sm text-gray-600 text-center max-w-md">
            Adivina el nombre del Pokémon por su silueta. Si aciertas, ¡ganas una Pokéball!
          </p>
          
          {/* Contadores de progreso diario */}
          <div className="flex justify-center space-x-4 text-xs">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-purple-200/50">
              <div className="flex items-center space-x-1">
                <span className="text-purple-600">🎯</span>
                <span className="font-semibold text-gray-700">
                  {dailyStats.correctAnswers}/{dailyStats.maxAttempts}
                </span>
              </div>
              <div className="text-center text-gray-500 mt-1">Aciertos</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-blue-200/50">
              <div className="flex items-center space-x-1">
                <span className="text-blue-600">⚡</span>
                <span className="font-semibold text-gray-700">
                  {dailyStats.currentStreak}
                </span>
              </div>
              <div className="text-center text-gray-500 mt-1">Racha</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-orange-200/50">
              <div className="flex items-center space-x-1">
                <span className="text-orange-600">⏭️</span>
                <span className="font-semibold text-gray-700">
                  {dailyStats.skipsUsed}/{dailyStats.maxSkips}
                </span>
              </div>
              <div className="text-center text-gray-500 mt-1">Saltos</div>
            </div>
          </div>

          {/* Mensaje de intentos restantes */}
          {canPlay && (
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                {dailyStats.maxAttempts - dailyStats.attemptsUsed} intentos restantes hoy
              </div>
            </div>
          )}
          
          {/* Mensaje de sin intentos */}
          {!canPlay && !showDailyReward && (
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                Intentos agotados por hoy. ¡Vuelve mañana!
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Sprite del Pokémon con animaciones dramáticas */}
      <div className="flex items-center justify-center mb-6 relative">
        {spriteVisible && (
          <div className="relative">
            {/* Efecto de aura/glow detrás del sprite */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-lg animate-pulse opacity-20"
              style={{
                transform: `scale(${Math.min(spriteScale * 0.8, 1.4)})`, // Reducido y con límite máximo
                transition: 'transform 0.1s ease-out'
              }}
            ></div>
            
            <img
              src={`https://img.pokemondb.net/sprites/home/normal/${pokemon.name.toLowerCase().replace(/♀/g, '-f').replace(/♂/g, '-m').replace(/[.'':]/g, '').replace(/\s+/g, '-')}.png`}
              alt="Pokémon misterioso"
              className={`relative z-10 drop-shadow-2xl transition-all duration-100 ease-out ${
                audioPlaying && spriteScale > 1.5 ? 'animate-bounce' : ''
              } ${animateCorrectGuess ? 'animate-pulse-strong' : ''}`}
              style={{
                width: `${160 * spriteScale}px`,
                height: `${160 * spriteScale}px`,
                filter: revealed ? 'none' : 'brightness(0) grayscale(1)',
                transition: 'filter 0.4s, width 0.1s ease-out, height 0.1s ease-out',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              draggable={false}
            />
          </div>
        )}
      </div>
      
      {/* Información del Pokémon revelado */}
      {revealed && (
        <div className="animate-fade-in-up flex flex-col items-center space-y-2 mt-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-purple-200/50">
            <h3 className="text-xl font-bold text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              {pokemon.name}
            </h3>
            <p className="text-sm text-gray-600 text-center mt-1">
              #{pokemon.num.toString().padStart(3, '0')} en la Pokédex
            </p>
          </div>
        </div>
      )}

      {/* Input y botón - solo aparecen cuando showInput es true Y no está revelado */}
      {showInput && !revealed && canPlay && (
        <div 
          className="animate-fade-in-up space-y-4 w-full max-w-xs sm:max-w-sm md:max-w-md" // Añadido w-full y max-w para control de ancho
          style={{ 
            transform: `scale(${inputContainerScale})`,
            transition: 'transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)' 
          }}
        >
          {/* Campo de input con mejoras de claridad */}
          <div className="relative">
            {/* Glow pulsante más intenso cuando el input está vacío */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg blur-[2px] transition-all duration-300 ${
              guess.trim() === '' ? 'opacity-60 animate-pulse' : 'opacity-40'
            }`}></div>
            
            {/* Destello adicional cuando el input está vacío */}
            {guess.trim() === '' && (
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-purple-400 to-pink-400 rounded-lg blur-[4px] opacity-30 animate-ping"></div>
            )}
            
            <input
              type="text"
              className={`relative z-10 w-full px-6 py-3 text-lg font-medium text-center bg-white/85 backdrop-blur-sm rounded-lg border-2 shadow-lg focus:outline-none focus:shadow-xl hover:shadow-md transition-all duration-300 placeholder:text-sm placeholder:text-gray-700 ${
                guess.trim() === '' 
                  ? 'border-purple-400/80 animate-pulse shadow-purple-300/50' 
                  : 'border-purple-300/70'
              }`}
              style={{
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.15), inset 0 1px 3px rgba(255, 255, 255, 0.1)'
              }}
              placeholder="Escribe el nombre del Pokémon"
              value={guess}
              onChange={e => {
                const value = e.target.value;
                // Capitalizar automáticamente la primera letra
                const capitalizedValue = value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
                setGuess(capitalizedValue);
              }}
              disabled={revealed}
              onKeyDown={e => { if (e.key === 'Enter' && guess.trim() !== '') handleCheck(); }}
              autoFocus
            />
          </div>
          
          {/* Contenedor para botones principales */}
          <div className="space-y-3">
            {/* Botón verificar con estilos condicionales e intensidad mejorada */}
            <div className="relative">
              {/* Glow sutil y elegante */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-blue-400/50 rounded-xl blur-[3px] animate-pulse ${guess.trim() === '' ? 'opacity-30' : 'opacity-60'} transition-opacity duration-300`}></div>
              
              <button
                className={`relative z-10 w-full px-6 py-3 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 active:scale-98
                  ${guess.trim() === '' || revealed
                    ? 'bg-white/60 text-gray-400 border-2 border-purple-200/40 cursor-not-allowed' 
                    : 'bg-purple-500 text-white border-2 border-purple-600 hover:bg-purple-600 hover:shadow-xl'
                }`}
                style={{
                  // La sombra base puede ajustarse o eliminarse si el bg es muy oscuro
                  boxShadow: guess.trim() !== '' && !revealed ? '0 4px 20px rgba(128, 0, 128, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.1)' : '0 4px 15px rgba(168, 85, 247, 0.1), inset 0 1px 3px rgba(255, 255, 255, 0.05)',
                }}
                onClick={() => { 
                  if (guess.trim() === '' || revealed) return;
                  playSoundEffect('notification', 0.1); 
                  handleCheck(); 
                }}
                disabled={revealed || guess.trim() === ''}
                onMouseEnter={(e) => {
                  if (guess.trim() !== '' && !revealed) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(128, 0, 128, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (guess.trim() !== '' && !revealed) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(128, 0, 128, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <span className="relative z-10 tracking-wide">Verificar</span>
              </button>
            </div>

            {/* Botón Saltar Pokémon - aparece después de 15s */}
            {showSkipButton && dailyStats.skipsUsed < dailyStats.maxSkips && (
              <div className="relative animate-fade-in-up">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400/50 to-yellow-400/50 rounded-xl blur-[2px] opacity-40 animate-pulse"></div>
                
                <button
                  className="relative z-10 w-full px-4 py-2 text-sm font-medium rounded-xl bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-600 shadow-md hover:shadow-lg transition-all duration-300 active:scale-98"
                  style={{
                    boxShadow: '0 3px 15px rgba(249, 115, 22, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
                  }}
                  onClick={handleSkipPokemon}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(249, 115, 22, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 3px 15px rgba(249, 115, 22, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>⏭️</span>
                    <span>Saltar Pokémon</span>
                    <span className="text-xs opacity-75">({dailyStats.maxSkips - dailyStats.skipsUsed} restantes)</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Resultado con estilo mejorado y más identidad */}
      {resultMessage.type && (
        <div className={`
          relative w-11/12 max-w-sm mx-auto text-center 
          font-semibold mt-4 mb-2 p-4 
          rounded-xl shadow-lg 
          border-2 
          transition-all duration-300 ease-in-out animate-pop-in 
          flex flex-col items-center justify-center overflow-hidden
          ${resultMessage.type === 'correct' ? 
            'bg-gradient-to-br from-yellow-400 via-pink-500 to-blue-500 border-yellow-500' : ''}
          ${resultMessage.type === 'incorrect' ? 
            'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 border-rose-700' : ''}
        `}>
          
          {/* Efectos de confetti solo para mensaje correcto */}
          {resultMessage.type === 'correct' && (
            <>
              {/* Capa de confetti 1 - Colores del título */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 via-blue-500 via-purple-500 via-indigo-500 via-cyan-500 via-pink-400 to-yellow-400 animate-spin opacity-25" style={{ animationDuration: '6s' }}></div>
              
              {/* Capa de confetti 2 - Tonos complementarios */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-l from-blue-400 via-purple-500 via-pink-600 via-rose-500 via-orange-400 via-yellow-500 via-amber-400 via-blue-500 to-blue-400 animate-spin opacity-20" style={{ animationDuration: '8s' }}></div>
              
              {/* Capa de confetti 3 - Variaciones de la paleta principal */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-400 via-pink-400 via-fuchsia-500 via-violet-500 via-blue-600 via-sky-400 via-cyan-400 to-yellow-300 animate-spin opacity-15" style={{ animationDuration: '10s' }}></div>
              
              {/* Capa de confetti 4 - Destellos */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white via-yellow-200 via-pink-200 via-blue-200 via-purple-200 via-cyan-200 to-white animate-spin opacity-10" style={{ animationDuration: '4s' }}></div>
            </>
          )}
          
          {resultMessage.type === 'correct' && (
            <div className="relative z-10 animate-bounce-short flex flex-col items-center">
              <div className="text-3xl mb-2 filter drop-shadow-lg">
                <span className="inline-block animate-pulse">🎊</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                <span className="inline-block animate-pulse" style={{ animationDelay: '0.2s' }}>🎉</span>
              </div>
              <span className="block text-xl font-extrabold text-white [text-shadow:_2px_2px_4px_rgba(0,0,0,0.6)] tracking-tight">{resultMessage.status}</span>
              <p className="text-sm text-blue-100 mt-1 [text-shadow:_1px_1px_2px_rgba(0,0,0,0.5)] font-semibold">{resultMessage.details}</p>
            </div>
          )}
          {resultMessage.type === 'incorrect' && (
            <div className="relative z-10 animate-shake flex flex-col items-center">
              <span className="text-3xl mb-2 filter drop-shadow-md">❌</span>
              <span className="block text-xl font-extrabold text-white [text-shadow:_1px_1px_2px_rgba(0,0,0,0.4)] tracking-tight">{resultMessage.status}</span>
              <p className="text-sm text-rose-100 mt-1 [text-shadow:_1px_1px_1px_rgba(0,0,0,0.3)]">{resultMessage.details}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Botón siguiente Pokémon */}
      {revealed && canPlay && (
        <div className="relative mt-4">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full blur-sm opacity-20 animate-pulse"></div>
          <button
            className="relative z-10 px-6 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up border border-gray-300/50"
            onClick={() => { playSoundEffect('notification', 0.1); handleNext(); }}
          >
            Siguiente Pokémon
          </button>
        </div>
      )}
      
      {/* Indicador de carga durante el audio "whosthat.mp3" */}
      {audioPlaying && (
        <div className="absolute bottom-4 right-4 text-xs text-gray-500 animate-pulse">
          🎵 Preparando...
        </div>
      )}

      {/* Pantalla de recompensas diarias */}
      {showDailyReward && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-11/12 mx-4 overflow-hidden shadow-2xl animate-scale-in">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 px-6 py-4 text-center">
              <h3 className="text-2xl font-bold text-white [text-shadow:_2px_2px_4px_rgba(0,0,0,0.5)]">
                🎉 ¡Resumen del Día! 🎉
              </h3>
            </div>
            
            {/* Contenido de recompensas */}
            <div className="p-6 space-y-4">
              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">{dailyStats.correctAnswers}</div>
                  <div className="text-sm text-gray-600">Aciertos</div>
                </div>
                <div className="text-center bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{Math.round((dailyStats.correctAnswers / dailyStats.maxAttempts) * 100)}%</div>
                  <div className="text-sm text-gray-600">Precisión</div>
                </div>
              </div>

              {/* Nivel alcanzado */}
              {(() => {
                const reward = calculateDailyReward();
                return (
                  <div className="text-center mb-4">
                    <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 text-white rounded-xl px-4 py-3 mb-2">
                      <div className="text-lg font-bold">{reward.level}</div>
                      <div className="text-sm opacity-90">{reward.title}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Recompensas obtenidas */}
              {(() => {
                const reward = calculateDailyReward();
                return (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700 text-center">Recompensas obtenidas:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {reward.pokeballs > 0 && (
                        <div className="flex items-center justify-between bg-red-50 rounded p-2">
                          <span>🔴 Pokéballs</span>
                          <span className="font-semibold">+{reward.pokeballs}</span>
                        </div>
                      )}
                      {reward.superballs > 0 && (
                        <div className="flex items-center justify-between bg-blue-50 rounded p-2">
                          <span>🔵 Superballs</span>
                          <span className="font-semibold">+{reward.superballs}</span>
                        </div>
                      )}
                      {reward.ultraballs > 0 && (
                        <div className="flex items-center justify-between bg-yellow-50 rounded p-2">
                          <span>🟡 Ultraballs</span>
                          <span className="font-semibold">+{reward.ultraballs}</span>
                        </div>
                      )}
                      {reward.masterballs > 0 && (
                        <div className="flex items-center justify-between bg-purple-50 rounded p-2">
                          <span>🟣 Masterballs</span>
                          <span className="font-semibold">+{reward.masterballs}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between bg-green-50 rounded p-2 col-span-2">
                        <span>💰 Fichas</span>
                        <span className="font-semibold">+{reward.fichas + reward.bonus}</span>
                      </div>
                    </div>
                    
                    {reward.bonus > 0 && (
                      <div className="text-center text-sm text-green-600 font-semibold mt-2">
                        🎁 Bonus por no usar saltos: +{reward.bonus} fichas
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Botón para reclamar */}
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-98"
                onClick={() => {
                  playSoundEffect('notification', 0.1);
                  claimDailyReward();
                }}
              >
                Reclamar Recompensas
              </button>

              <div className="text-center text-xs text-gray-500 mt-2">
                ¡Vuelve mañana para más diversión!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
