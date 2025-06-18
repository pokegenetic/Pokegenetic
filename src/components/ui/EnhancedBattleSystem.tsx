import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playSoundEffect } from '@/lib/soundEffects';
import { BattleProps } from './battleTypes';
import {
  calcularTapsObjetivo,
  calcularTiempoBase,
  obtenerPokemonActual,
  obtenerNombreOponente,
  obtenerSpriteOponente,
  esUltimoPokemon
} from './battleUtils';
import { getPokemonSpriteUrl, getPokemonStaticIconUrl, getShowdownSpriteUrl, getPokemonBasicSpriteById, pokemonNameToId } from '@/utils/pokemonSprites';
import { DIRECT_SPRITE_URLS } from '@/utils/directSprites';
import { BattlefieldBackground } from './BattlefieldBackground';

// Calcular efectividad de tipos
const calcularEfectividad = (tipoAtacante: string, tipoDefensor: string): string => {
  const efectividades: { [key: string]: { [key: string]: string } } = {
    'Fuego': { 'Planta': 'fuerte', 'Agua': 'debil', 'Fuego': 'debil', 'Hielo': 'fuerte', 'Acero': 'fuerte', 'Bicho': 'fuerte' },
    'Agua': { 'Fuego': 'fuerte', 'Planta': 'debil', 'Agua': 'debil', 'Tierra': 'fuerte', 'Roca': 'fuerte' },
    'Planta': { 'Agua': 'fuerte', 'Fuego': 'debil', 'Planta': 'debil', 'Tierra': 'fuerte', 'Roca': 'fuerte', 'Veneno': 'debil', 'Volador': 'debil', 'Bicho': 'debil', 'Acero': 'debil' },
    'Eléctrico': { 'Agua': 'fuerte', 'Volador': 'fuerte', 'Planta': 'debil', 'Eléctrico': 'debil', 'Tierra': 'inmune' },
    'Psíquico': { 'Lucha': 'fuerte', 'Veneno': 'fuerte', 'Psíquico': 'debil', 'Acero': 'debil', 'Siniestro': 'inmune' },
    'Hielo': { 'Planta': 'fuerte', 'Tierra': 'fuerte', 'Volador': 'fuerte', 'Dragón': 'fuerte', 'Fuego': 'debil', 'Agua': 'debil', 'Hielo': 'debil', 'Acero': 'debil' },
    'Dragón': { 'Dragón': 'fuerte', 'Acero': 'debil', 'Hada': 'inmune' },
    'Siniestro': { 'Psíquico': 'fuerte', 'Fantasma': 'fuerte', 'Lucha': 'debil', 'Siniestro': 'debil', 'Hada': 'debil' },
    'Hada': { 'Lucha': 'fuerte', 'Dragón': 'fuerte', 'Siniestro': 'fuerte', 'Fuego': 'debil', 'Veneno': 'debil', 'Acero': 'debil' },
    'Lucha': { 'Normal': 'fuerte', 'Hielo': 'fuerte', 'Roca': 'fuerte', 'Siniestro': 'fuerte', 'Acero': 'fuerte', 'Volador': 'debil', 'Psíquico': 'debil', 'Bicho': 'debil', 'Hada': 'debil', 'Fantasma': 'inmune' },
    'Veneno': { 'Planta': 'fuerte', 'Hada': 'fuerte', 'Veneno': 'debil', 'Tierra': 'debil', 'Roca': 'debil', 'Fantasma': 'debil', 'Acero': 'inmune' },
    'Tierra': { 'Fuego': 'fuerte', 'Eléctrico': 'fuerte', 'Veneno': 'fuerte', 'Roca': 'fuerte', 'Acero': 'fuerte', 'Planta': 'debil', 'Bicho': 'debil', 'Volador': 'inmune' },
    'Volador': { 'Eléctrico': 'debil', 'Hielo': 'debil', 'Roca': 'debil', 'Planta': 'fuerte', 'Lucha': 'fuerte', 'Bicho': 'fuerte', 'Acero': 'debil' },
    'Bicho': { 'Planta': 'fuerte', 'Psíquico': 'fuerte', 'Siniestro': 'fuerte', 'Fuego': 'debil', 'Lucha': 'debil', 'Veneno': 'debil', 'Volador': 'debil', 'Fantasma': 'debil', 'Acero': 'debil', 'Hada': 'debil' },
    'Roca': { 'Fuego': 'fuerte', 'Hielo': 'fuerte', 'Volador': 'fuerte', 'Bicho': 'fuerte', 'Lucha': 'debil', 'Tierra': 'debil', 'Acero': 'debil' },
    'Fantasma': { 'Psíquico': 'fuerte', 'Fantasma': 'fuerte', 'Siniestro': 'debil', 'Normal': 'inmune' },
    'Acero': { 'Hielo': 'fuerte', 'Roca': 'fuerte', 'Hada': 'fuerte', 'Fuego': 'debil', 'Agua': 'debil', 'Eléctrico': 'debil', 'Acero': 'debil' },
    'Normal': { 'Roca': 'debil', 'Fantasma': 'inmune', 'Acero': 'debil' }
  };
  
  return efectividades[tipoAtacante]?.[tipoDefensor] || 'normal';
};

// Estados de animación de Pokémon
type PokemonAnimationState = 'entering' | 'idle' | 'hit' | 'fainting' | 'fainted';

// Componente principal del sistema de combate mejorado
const EnhancedBattleSystem: React.FC<BattleProps> = ({
  gimnasioActual,
  entrenadorActual,
  pokemonActual,
  combatienteActual,
  tipoSeleccionado,
  gimnasios,
  onVictoria,
  onDerrota,
  onVolverAlGimnasio,
  estado
}) => {
  // Estados del combate
  const [tapsAcumulados, setTapsAcumulados] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [combateEnCurso, setCombateEnCurso] = useState(false);
  const [ataqueInminente, setAtaqueInminente] = useState(false);
  const [cuentaRegresiva, setCuentaRegresiva] = useState(3);
  const [mostrarCuentaRegresiva, setMostrarCuentaRegresiva] = useState(false);
  
  // Estados adicionales para efectos especiales
  const [powerUps, setPowerUps] = useState<Array<{id: string, type: string, x: number, y: number}>>([]);
  const [criticalHit, setCriticalHit] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [consecutiveTaps, setConsecutiveTaps] = useState(0);

  // Estados de animación
  const [pokemonAnimationState, setPokemonAnimationState] = useState<PokemonAnimationState>('entering');
  const [showPokemon, setShowPokemon] = useState(false);
  const [showPokeball, setShowPokeball] = useState(false);
  const [pokemonOpacity, setPokemonOpacity] = useState(0);
  const [battleEffects, setBattleEffects] = useState<string[]>([]);
  const [hitEffect, setHitEffect] = useState(false);
  
  // Referencias para cleanup
  const combateEnCursoRef = useRef(combateEnCurso);
  const tapsAcumuladosRef = useRef(tapsAcumulados);
  const combatienteActualRef = useRef(combatienteActual);
  const gimnasioActualRef = useRef(gimnasioActual);
  const pokemonActualRef = useRef(pokemonActual);

  // Actualizar referencias
  useEffect(() => {
    combateEnCursoRef.current = combateEnCurso;
    tapsAcumuladosRef.current = tapsAcumulados;
    combatienteActualRef.current = combatienteActual;
    gimnasioActualRef.current = gimnasioActual;
    pokemonActualRef.current = pokemonActual;
  }, [combateEnCurso, tapsAcumulados, combatienteActual, gimnasioActual, pokemonActual]);

  // Animación de entrada del Pokémon al iniciar
  useEffect(() => {
    // Reiniciar animaciones cuando cambia el pokémon
    setPokemonAnimationState('entering');
    setShowPokemon(false);
    setShowPokeball(true);
    setPokemonOpacity(0);
    
    // Secuencia de aparición del Pokémon (más rápida)
    const timer1 = setTimeout(() => {
      setShowPokeball(false);
      setShowPokemon(true);
      setPokemonAnimationState('idle');
      
      // Fade in del Pokémon inmediato
      setPokemonOpacity(1);
    }, 800); // Reducido de 1500 a 800ms
    
    return () => clearTimeout(timer1);
  }, [pokemonActual, combatienteActual]);

  // Función para limpiar timers y estados
  const limpiarTimers = () => {
    if ((window as any).currentIntervals) {
      const { ataqueInterval, timerInterval } = (window as any).currentIntervals;
      if (ataqueInterval) clearInterval(ataqueInterval);
      if (timerInterval) clearInterval(timerInterval);
      (window as any).currentIntervals = null;
    }
    
    // Resetear estados especiales
    setConsecutiveTaps(0);
    setComboMultiplier(1);
    setCriticalHit(false);
    setPowerUps([]);
  };

  // Derrota - useCallback para usar en useEffect
  const derrota = useCallback(() => {
    limpiarTimers();
    setCombateEnCurso(false);
    onDerrota();
  }, [onDerrota]);

  // Animación de Pokémon derrotado
  const animarPokemonDerrotado = useCallback(() => {
    setPokemonAnimationState('hit');
    setHitEffect(true);
    
    setTimeout(() => {
      setHitEffect(false);
      setPokemonAnimationState('fainting');
      
      // Fade out del Pokémon
      setTimeout(() => {
        setPokemonOpacity(0);
        
        setTimeout(() => {
          setPokemonAnimationState('fainted');
          setShowPokemon(false);
        }, 500);
      }, 300);
    }, 200);
  }, []);

  // Función para generar power-ups aleatorios
  const generatePowerUp = useCallback(() => {
    if (Math.random() < 0.15) { // 15% de probabilidad
      const powerUpTypes = ['critical', 'speed', 'shield', 'double'];
      const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const id = Date.now().toString();
      const x = Math.random() * 80 + 10; // Entre 10% y 90% del ancho
      const y = Math.random() * 60 + 20; // Entre 20% y 80% de la altura
      
      setPowerUps(prev => [...prev, { id, type, x, y }]);
      
      // Remover el power-up después de 5 segundos
      setTimeout(() => {
        setPowerUps(prev => prev.filter(p => p.id !== id));
      }, 5000);
    }
  }, []);

  // Función para usar power-up
  const usePowerUp = (powerUpId: string, type: string) => {
    setPowerUps(prev => prev.filter(p => p.id !== powerUpId));
    
    switch (type) {
      case 'critical':
        setCriticalHit(true);
        addBattleEffect('¡GOLPE CRÍTICO!');
        setTimeout(() => setCriticalHit(false), 1000);
        break;
      case 'speed':
        setComboMultiplier(3);
        addBattleEffect('¡VELOCIDAD x3!');
        setTimeout(() => setComboMultiplier(1), 3000);
        break;
      case 'shield':
        addBattleEffect('¡ESCUDO ACTIVADO!');
        // Hacer inmune al próximo ataque
        break;
      case 'double':
        addBattleEffect('¡TAPS DOBLES!');
        setComboMultiplier(2);
        setTimeout(() => setComboMultiplier(1), 4000);
        break;
    }
    
    playSoundEffect('notification', 0.3);
  };

  // Función para agregar efectos visuales dinámicos
  const addBattleEffect = (effect: string) => {
    setBattleEffects(prev => [...prev, effect]);
    setTimeout(() => {
      setBattleEffects(prev => prev.filter(e => e !== effect));
    }, 2000);
  };

  // Iniciar cuenta regresiva
  const iniciarCuentaRegresiva = () => {
    if (!tipoSeleccionado) {
      playSoundEffect('error', 0.2);
      alert('¡Selecciona un tipo primero!');
      return;
    }

    playSoundEffect('notification', 0.2);
    setMostrarCuentaRegresiva(true);
    setCuentaRegresiva(3);

    const interval = setInterval(() => {
      setCuentaRegresiva(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setMostrarCuentaRegresiva(false);
          iniciarCombate();
          return 0;
        }
        playSoundEffect('notification', 0.15);
        return prev - 1;
      });
    }, 1000);
  };

  // Iniciar combate con efectos mejorados
  const iniciarCombate = async () => {
    if (!tipoSeleccionado) {
      playSoundEffect('error', 0.2);
      alert('¡Selecciona un tipo primero!');
      return;
    }

    playSoundEffect('notification', 0.2);
    addBattleEffect('¡Comienza la batalla!');

    const gimnasio = gimnasios[gimnasioActual];
    const tiempoBase = calcularTiempoBase(combatienteActual, gimnasioActual);
    const tapsObjetivo = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);

    setTapsAcumulados(0);
    setTiempoRestante(tiempoBase);
    setCombateEnCurso(true);
    setAtaqueInminente(false);

    // Ataques del oponente más inteligentes
    const intervaloBase = combatienteActual === 'entrenador' ? 2500 : 1800;
    const intervaloAtaque = Math.max(intervaloBase - (gimnasioActual * 100), 1000);
    
    const ataqueInterval = setInterval(() => {
      setAtaqueInminente(true);
      addBattleEffect('¡Ataque enemigo!');
      
      setTimeout(() => {
        setTapsAcumulados(prev => {
          const efectividad = calcularEfectividad(tipoSeleccionado, gimnasio.tipo);
          let tapsPerdidos = combatienteActual === 'entrenador' ? 4 : 7;
          
          if (efectividad === 'inmune') {
            tapsPerdidos = 0;
            addBattleEffect('¡No tiene efecto!');
          } else if (efectividad === 'fuerte') {
            tapsPerdidos = Math.ceil(tapsPerdidos * 0.4);
            addBattleEffect('¡Súper efectivo!');
          } else if (efectividad === 'debil') {
            tapsPerdidos = Math.ceil(tapsPerdidos * 1.6);
            addBattleEffect('No muy efectivo...');
          }
          
          // Efecto visual de golpe
          if (tapsPerdidos > 0) {
            setPokemonAnimationState('hit');
            setTimeout(() => setPokemonAnimationState('idle'), 300);
          }
          
          return Math.max(0, prev - tapsPerdidos);
        });
        setAtaqueInminente(false);
      }, 800);
    }, intervaloAtaque);

    // Timer del combate
    const timerInterval = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(ataqueInterval);
          clearInterval(timerInterval);
          
          if (!combateEnCursoRef.current) {
            return 0;
          }
          
          setCombateEnCurso(false);
          
          const tapsObjetivoFinal = calcularTapsObjetivo(
            combatienteActualRef.current,
            gimnasioActualRef.current,
            pokemonActualRef.current
          );

          if (tapsAcumuladosRef.current >= tapsObjetivoFinal) {
            victoria();
          } else {
            derrota();
          }
          
          return 0;
        }
        
        playSoundEffect('notification', 0.1);
        return prev - 1;
      });
    }, 1000);

    // Guardar intervalos para poder limpiarlos después
    (window as any).currentIntervals = { ataqueInterval, timerInterval };
  };

  // Victoria contra un Pokémon con animaciones
  const victoria = useCallback(async () => {
    limpiarTimers();
    
    // Animar Pokémon derrotado
    animarPokemonDerrotado();
    addBattleEffect('¡Victoria!');
    
    const esUltimoDelOponente = esUltimoPokemon(
      gimnasios[gimnasioActual],
      combatienteActual,
      entrenadorActual,
      pokemonActual
    );
    
    // Esperar a que termine la animación de derrota
    setTimeout(() => {
      if (esUltimoDelOponente) {
        onVictoria();
      } else {
        // Si no es el último, continuar al siguiente Pokémon automáticamente
        onVolverAlGimnasio();
      }
    }, 2000);
  }, [animarPokemonDerrotado, gimnasios, gimnasioActual, combatienteActual, entrenadorActual, pokemonActual, onVictoria, onVolverAlGimnasio]);

  // Función para manejar taps con efectos mejorados
  const handleTap = () => {
    if (!combateEnCurso) return;
    
    playSoundEffect('pop', 0.15);
    setConsecutiveTaps(prev => prev + 1);
    
    // Generar power-up ocasionalmente
    generatePowerUp();
    
    setTapsAcumulados(prev => {
      let increment = 1 * comboMultiplier;
      
      // Aplicar efectos especiales
      if (criticalHit) {
        increment *= 2;
      }
      
      const newValue = prev + increment;
      
      // Efectos especiales por combos
      if (consecutiveTaps >= 20) {
        addBattleEffect('¡COMBO MAESTRO!');
        playSoundEffect('notification', 0.2);
        setConsecutiveTaps(0);
        return newValue + 5; // Bonus por combo maestro
      } else if (newValue % 15 === 0) {
        addBattleEffect('¡Combo x15!');
        playSoundEffect('notification', 0.2);
      } else if (newValue % 10 === 0) {
        addBattleEffect('¡Combo x10!');
        playSoundEffect('notification', 0.15);
      } else if (newValue % 5 === 0) {
        addBattleEffect('¡Combo x5!');
      }
      
      return newValue;
    });
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      limpiarTimers();
    };
  }, []);

  const gimnasio = gimnasios[gimnasioActual];
  const pokemonNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
  const oponenteNombre = obtenerNombreOponente(gimnasio, combatienteActual, entrenadorActual);
  const oponenteSprite = obtenerSpriteOponente(gimnasio, combatienteActual, entrenadorActual);
  const tapsObjetivo = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);

  // Si estamos en estado de victoria o derrota, mostrar pantalla correspondiente
  if (estado === 'victoria') {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">¡Victoria!</h2>
          <p className="text-gray-600 mb-6">
            Has derrotado a {pokemonNombre} de {oponenteNombre}
          </p>
          <button
            onClick={onVolverAlGimnasio}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  if (estado === 'derrota') {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Derrota</h2>
          <p className="text-gray-600 mb-6">
            No has podido contra {pokemonNombre}, has quedado fuera de juego
          </p>
          <button
            onClick={onVolverAlGimnasio}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Volver al Gimnasio
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de cuenta regresiva
  if (mostrarCuentaRegresiva) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="text-8xl font-bold animate-pulse">{cuentaRegresiva}</div>
          <p className="text-xl mt-4">Preparándose para batalla...</p>
        </div>
      </div>
    );
  }

  // Pantalla principal de combate mejorada
  return (
    <div className="fixed inset-0 z-50 text-white overflow-hidden">
      {/* Fondo del campo de batalla */}
      <BattlefieldBackground gymType={gimnasio.tipo} />
      
      {/* Power-ups flotantes */}
      {powerUps.map((powerUp) => {
        const powerUpEmojis = {
          critical: '⚡',
          speed: '💨',
          shield: '🛡️',
          double: '💎'
        };
        
        const powerUpColors = {
          critical: 'text-yellow-400',
          speed: 'text-blue-400',
          shield: 'text-green-400',
          double: 'text-purple-400'
        };
        
        return (
          <div
            key={powerUp.id}
            className={`absolute w-12 h-12 ${powerUpColors[powerUp.type]} text-2xl animate-bounce cursor-pointer hover:scale-110 transition-transform z-30`}
            style={{ 
              left: `${powerUp.x}%`, 
              top: `${powerUp.y}%`,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}
            onClick={() => usePowerUp(powerUp.id, powerUp.type)}
          >
            {powerUpEmojis[powerUp.type]}
          </div>
        );
      })}

      {/* Efectos visuales dinámicos */}
      {battleEffects.map((effect, index) => (
        <div
          key={`${effect}-${index}`}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-yellow-300 animate-bounce z-40 pointer-events-none"
          style={{
            animationDuration: '0.6s',
            textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
          }}
        >
          {effect}
        </div>
      ))}

      {/* Layout principal - Sistema mejorado con flexbox */}
      <div className="h-screen flex flex-col">
        
        {/* FILA 1: Información superior - altura fija pequeña */}
        <div className="h-20 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm">
          {/* Info del Pokémon enemigo */}
          <div className="bg-white text-black rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{pokemonNombre}</span>
              <span className="text-sm text-gray-600">Nv.50</span>
            </div>
            <div className="w-32 h-2 bg-gray-300 rounded-full mt-1">
              <div className="w-full h-full bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Efectividad */}
          {combateEnCurso && (
            <div className="bg-black/80 rounded-lg px-4 py-2 border border-white/20">
              <p className="text-sm font-bold text-center">
                {calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'fuerte' ? '🔥 Súper efectivo' :
                 calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'debil' ? '❄️ No muy efectivo' :
                 calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'inmune' ? '🚫 No tiene efecto' :
                 '⚡ Normal'}
              </p>
            </div>
          )}
        </div>

        {/* FILA 2: Campo de batalla - toma la mayor parte del espacio */}
        <div className="flex-1 relative flex items-center justify-start px-16 py-12 min-h-0">
          {/* Contenedor del lado enemigo */}
          <div className="flex flex-col items-center">
            {/* Entrenador enemigo detrás del Pokémon */}
            <div className="mb-6">
              <img 
                src={oponenteSprite} 
                alt={oponenteNombre}
                className="w-24 h-24 object-contain opacity-50"
                style={{ 
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                }}
              />
            </div>
            
            {/* Pokeball de aparición del enemigo */}
            {showPokeball && (
              <div className="w-40 h-40 flex items-center justify-center animate-bounce">
                <div className="w-24 h-24 bg-red-500 rounded-full border-6 border-white relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border-3 border-gray-800"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800"></div>
                </div>
              </div>
            )}

            {/* Sprite del Pokémon enemigo - MUCHO MÁS GRANDE */}
            {showPokemon && (
              <div className="relative">
                <img 
                  src={DIRECT_SPRITE_URLS[pokemonNombre] || getPokemonSpriteUrl(pokemonNombre)}
                  alt={pokemonNombre}
                  className={`w-80 h-80 object-contain transition-all duration-500 ${
                    pokemonAnimationState === 'hit' ? 'animate-pulse' : ''
                  } ${
                    pokemonAnimationState === 'fainting' ? 'animate-bounce' : ''
                  }`}
                  style={{ 
                    opacity: pokemonOpacity,
                    filter: hitEffect ? 'brightness(1.5) contrast(1.2)' : 'drop-shadow(0 12px 24px rgba(0,0,0,0.5))',
                    transform: pokemonAnimationState === 'hit' ? 'scale(1.1)' : 'scale(1)',
                    imageRendering: 'pixelated',
                    maxWidth: '320px',
                    maxHeight: '320px'
                  }}
                  onError={(e) => {
                    const currentTarget = e.currentTarget as HTMLImageElement;
                    console.log('Error loading sprite for:', pokemonNombre, 'Current src:', currentTarget.src);
                    
                    // Obtener el ID del Pokémon si está disponible
                    const pokemonId = pokemonNameToId[pokemonNombre];
                    
                    if (currentTarget.src.includes('animated') && pokemonId) {
                      // Primer fallback: sprite estático de Gen 5 por ID
                      const newSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${pokemonId}.png`;
                      console.log('Trying static sprite by ID:', newSrc);
                      currentTarget.src = newSrc;
                    } else if (currentTarget.src.includes('black-white') && pokemonId) {
                      // Segundo fallback: sprite básico por ID
                      const newSrc = getPokemonBasicSpriteById(pokemonId);
                      console.log('Trying basic sprite by ID:', newSrc);
                      currentTarget.src = newSrc;
                    } else if (currentTarget.src.includes('sprites/pokemon/') && !currentTarget.src.includes('other')) {
                      // Tercer fallback: URL directa si está disponible
                      const directUrl = DIRECT_SPRITE_URLS[pokemonNombre];
                      if (directUrl) {
                        console.log('Trying direct URL:', directUrl);
                        currentTarget.src = directUrl;
                      } else {
                        // Si no hay URL directa, intentar Showdown
                        const newSrc = getShowdownSpriteUrl(pokemonNombre);
                        console.log('Trying showdown sprite:', newSrc);
                        currentTarget.src = newSrc;
                      }
                    } else if (currentTarget.src.includes('pokemonshowdown')) {
                      // Cuarto fallback: artwork oficial
                      const pokemonName = pokemonNombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                      const newSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonName}.png`;
                      console.log('Trying official artwork:', newSrc);
                      currentTarget.src = newSrc;
                    } else {
                      // Último fallback: mostrar un placeholder
                      console.log('All sprite sources failed, showing placeholder');
                      currentTarget.style.display = 'none';
                      
                      // Crear un div placeholder si no existe
                      const existingPlaceholder = currentTarget.parentNode?.querySelector('.pokemon-placeholder');
                      if (!existingPlaceholder) {
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'pokemon-placeholder w-80 h-80 flex items-center justify-center bg-gray-600 rounded-lg text-white font-bold border-2 border-white/20';
                        fallbackDiv.innerHTML = '<div class="text-center"><div class="text-6xl mb-4">🎮</div><div class="text-lg">' + pokemonNombre + '</div></div>';
                        currentTarget.parentNode?.appendChild(fallbackDiv);
                      }
                    }
                  }}
                  onLoad={() => {
                    console.log('Successfully loaded sprite for:', pokemonNombre);
                  }}
                />
                
                {/* Efecto de golpe */}
                {hitEffect && (
                  <div className="absolute inset-0 bg-white/50 rounded-full animate-ping"></div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FILA 3: Panel de control inferior - altura fija */}
        <div className="h-40 relative">
          {/* Panel de batalla negro en la parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-full bg-black/90 border-t-4 border-white">
            <div className="h-full flex items-center justify-between px-8">
              
              {/* Información de batalla */}
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{oponenteNombre}</h2>
                  <p className="text-lg text-gray-300">Tipo: {gimnasio.tipo}</p>
                  <p className="text-sm text-gray-400">Tiempo: {tiempoRestante}s</p>
                </div>
              </div>

              {/* Área de tap central */}
              <div className="text-center">
                <button
                  onClick={handleTap}
                  disabled={!combateEnCurso}
                  className={`w-24 h-24 rounded-full text-3xl font-bold transition-all duration-200 shadow-2xl ${
                    combateEnCurso
                      ? ataqueInminente
                        ? 'bg-red-500 hover:bg-red-400 animate-pulse text-white scale-110'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 active:scale-95 text-white'
                      : 'bg-gray-500 cursor-not-allowed text-gray-300'
                  }`}
                  style={{
                    boxShadow: combateEnCurso 
                      ? ataqueInminente 
                        ? '0 0 20px rgba(239, 68, 68, 0.6)'
                        : '0 0 20px rgba(59, 130, 246, 0.6)'
                      : 'none'
                  }}
                >
                  {combateEnCurso ? '👊' : '🔄'}
                </button>
                
                {combateEnCurso && (
                  <div className="mt-2 text-sm text-white">
                    ¡Toca para atacar!
                    {comboMultiplier > 1 && (
                      <div className="text-yellow-400 animate-pulse font-bold">
                        x{comboMultiplier}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Indicadores de progreso */}
              <div className="text-right">
                <div className="text-lg text-white mb-1">
                  Progreso: {tapsAcumulados}/{tapsObjetivo}
                </div>
                <div className="w-32 bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      ataqueInminente ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-green-400 to-blue-500'
                    }`}
                    style={{ width: `${Math.min((tapsAcumulados / tapsObjetivo) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {Math.round((tapsAcumulados / tapsObjetivo) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Botón de iniciar combate */}
          {!combateEnCurso && !mostrarCuentaRegresiva && (
            <div className="absolute bottom-44 left-1/2 transform -translate-x-1/2">
              <button
                onClick={iniciarCuentaRegresiva}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-10 py-4 rounded-xl text-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                ¡Comenzar Batalla!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBattleSystem;
