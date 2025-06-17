import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playSoundEffect } from '@/lib/soundEffects';
import { BattleProps } from './battleTypes';
import { getPokemonIconUrl, getPokemonStaticIconUrl } from '../../utils/pokemonSprites';
import {
  calcularTapsObjetivo,
  calcularTiempoBase,
  obtenerPokemonActual,
  obtenerNombreOponente,
  obtenerSpriteOponente,
  esUltimoPokemon
} from './battleUtils';

// Componente principal del sistema de combate
const BattleSystem: React.FC<BattleProps> = ({
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
  
  // Estados para las animaciones de batalla
  const [faseAnimacion, setFaseAnimacion] = useState('intro'); // 'intro', 'pokeball', 'pokemon', 'countdown', 'battle', 'victory', 'transition'
  const [cuentaRegresiva, setCuentaRegresiva] = useState(3);
  const [pokemonFainted, setPokemonFainted] = useState(false);
  const [mostrarTransicion, setMostrarTransicion] = useState(false);
  const [trainerData, setTrainerData] = useState<any>(null);
  const [isLeaderBattle, setIsLeaderBattle] = useState(false);

  // Referencias para acceder a valores actuales en los timers
  const tapsAcumuladosRef = useRef(tapsAcumulados);
  const gimnasioActualRef = useRef(gimnasioActual);
  const combatienteActualRef = useRef(combatienteActual);
  const pokemonActualRef = useRef(pokemonActual);
  const combateEnCursoRef = useRef(combateEnCurso);
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Actualizar las referencias cuando cambien los estados
  useEffect(() => {
    tapsAcumuladosRef.current = tapsAcumulados;
  }, [tapsAcumulados]);

  useEffect(() => {
    gimnasioActualRef.current = gimnasioActual;
  }, [gimnasioActual]);

  useEffect(() => {
    combatienteActualRef.current = combatienteActual;
  }, [combatienteActual]);

  useEffect(() => {
    pokemonActualRef.current = pokemonActual;
  }, [pokemonActual]);

  useEffect(() => {
    combateEnCursoRef.current = combateEnCurso;
  }, [combateEnCurso]);

  // Función para limpiar todos los timers activos
  const limpiarTimers = () => {
    if ((window as any).currentIntervals) {
      const { ataqueInterval, timerInterval } = (window as any).currentIntervals;
      if (ataqueInterval) clearInterval(ataqueInterval);
      if (timerInterval) clearInterval(timerInterval);
      delete (window as any).currentIntervals;
    }
  };

  // Función para limpiar timeouts de animación
  const limpiarAnimationTimeouts = () => {
    animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    animationTimeoutsRef.current = [];
  };

  // Calcular efectividad de tipos
  const calcularEfectividad = (tipoAtacante: string, tipoDefensor: string): 'fuerte' | 'debil' | 'normal' | 'inmune' => {
    const efectividades: { [key: string]: { fuerte: string[], debil: string[], inmune: string[] } } = {
      'Normal': { fuerte: [], debil: ['Roca', 'Acero'], inmune: ['Fantasma'] },
      'Fuego': { fuerte: ['Planta', 'Hielo', 'Bicho', 'Acero'], debil: ['Fuego', 'Agua', 'Roca', 'Dragón'], inmune: [] },
      'Agua': { fuerte: ['Fuego', 'Tierra', 'Roca'], debil: ['Agua', 'Planta', 'Dragón'], inmune: [] },
      'Eléctrico': { fuerte: ['Agua', 'Volador'], debil: ['Eléctrico', 'Planta', 'Dragón'], inmune: ['Tierra'] },
      'Planta': { fuerte: ['Agua', 'Tierra', 'Roca'], debil: ['Fuego', 'Planta', 'Veneno', 'Volador', 'Bicho', 'Dragón', 'Acero'], inmune: [] },
      'Hielo': { fuerte: ['Planta', 'Tierra', 'Volador', 'Dragón'], debil: ['Fuego', 'Agua', 'Hielo', 'Acero'], inmune: [] },
      'Lucha': { fuerte: ['Normal', 'Hielo', 'Roca', 'Siniestro', 'Acero'], debil: ['Veneno', 'Volador', 'Psíquico', 'Bicho', 'Hada'], inmune: ['Fantasma'] },
      'Veneno': { fuerte: ['Planta', 'Hada'], debil: ['Veneno', 'Tierra', 'Roca', 'Fantasma'], inmune: ['Acero'] },
      'Tierra': { fuerte: ['Fuego', 'Eléctrico', 'Veneno', 'Roca', 'Acero'], debil: ['Planta', 'Bicho'], inmune: ['Volador'] },
      'Volador': { fuerte: ['Eléctrico', 'Planta', 'Lucha'], debil: ['Eléctrico', 'Roca', 'Acero'], inmune: [] },
      'Psíquico': { fuerte: ['Lucha', 'Veneno'], debil: ['Psíquico', 'Acero'], inmune: ['Siniestro'] },
      'Bicho': { fuerte: ['Planta', 'Psíquico', 'Siniestro'], debil: ['Fuego', 'Lucha', 'Veneno', 'Volador', 'Fantasma', 'Acero', 'Hada'], inmune: [] },
      'Roca': { fuerte: ['Fuego', 'Hielo', 'Volador', 'Bicho'], debil: ['Lucha', 'Tierra', 'Acero'], inmune: [] },
      'Fantasma': { fuerte: ['Psíquico', 'Fantasma'], debil: ['Siniestro'], inmune: ['Normal'] },
      'Dragón': { fuerte: ['Dragón'], debil: ['Acero'], inmune: ['Hada'] },
      'Siniestro': { fuerte: ['Psíquico', 'Fantasma'], debil: ['Lucha', 'Siniestro', 'Hada'], inmune: [] },
      'Acero': { fuerte: ['Hielo', 'Roca', 'Hada'], debil: ['Fuego', 'Agua', 'Eléctrico', 'Acero'], inmune: [] },
      'Hada': { fuerte: ['Lucha', 'Dragón', 'Siniestro'], debil: ['Fuego', 'Veneno', 'Acero'], inmune: [] }
    };

    const tipoData = efectividades[tipoAtacante];
    if (!tipoData) return 'normal';

    if (tipoData.inmune.includes(tipoDefensor)) return 'inmune';
    if (tipoData.fuerte.includes(tipoDefensor)) return 'fuerte';
    if (tipoData.debil.includes(tipoDefensor)) return 'debil';
    return 'normal';
  };

  // Función para iniciar cuenta regresiva
  const iniciarCuentaRegresiva = () => {
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

  // Iniciar animación de Pokeball
  const iniciarAnimacionPokeball = useCallback(() => {
    // Protección: no iniciar si ya está en curso
    if (mostrarAnimacionPokeball || mostrarCuentaRegresiva || combateEnCurso) {
      console.log('Animación Pokeball bloqueada - ya en curso');
      return;
    }
    
    console.log('Iniciando animación Pokeball');
    
    // Limpiar timeouts previos para evitar loops
    limpiarAnimationTimeouts();
    
    setMostrarAnimacionPokeball(true);
    setFaseAnimacion(0); // Fase de lanzamiento

    // Fase 1: Lanzamiento de Pokeball (1 segundo - más rápido)
    const timeout1 = setTimeout(() => {
      setFaseAnimacion(1); // Fase de apertura
    }, 1000);
    animationTimeoutsRef.current.push(timeout1);

    // Fase 2: Apertura de Pokeball (0.8 segundos - más rápido)
    const timeout2 = setTimeout(() => {
      setFaseAnimacion(2); // Fase de aparición del Pokémon
    }, 1800);
    animationTimeoutsRef.current.push(timeout2);

    // Fase 3: Terminar animación e INICIAR CUENTA REGRESIVA (1.2 segundos después - más rápido)
    const timeout3 = setTimeout(() => {
      setMostrarAnimacionPokeball(false);
      setFaseAnimacion(0);
      // Ahora iniciar el 3, 2, 1 después de la animación de Pokeball
      iniciarCuentaRegresivaCompleta();
    }, 3000);
    animationTimeoutsRef.current.push(timeout3);
  }, [mostrarAnimacionPokeball, mostrarCuentaRegresiva, combateEnCurso]);

  // Auto-iniciar animación cuando sea necesario
  useEffect(() => {
    if ((esPrimerPokemon || necesitaAnimacion) && !mostrarAnimacionPokeball && !mostrarCuentaRegresiva && !combateEnCurso) {
      console.log('useEffect disparando animación:', { esPrimerPokemon, necesitaAnimacion });
      // Iniciar animación de Pokeball INMEDIATAMENTE para evitar mostrar el campo
      iniciarAnimacionPokeball();
      setNecesitaAnimacion(false); // Resetear flag
      setEsPrimerPokemon(false);
    }
  }, [esPrimerPokemon, necesitaAnimacion, mostrarAnimacionPokeball, mostrarCuentaRegresiva, combateEnCurso, iniciarAnimacionPokeball]);

  // Effect para manejar cambios de Pokémon (no gimnasio/entrenador)
  useEffect(() => {
    // Si cambió solo el pokemonActual (nuevo pokemon en el mismo contexto)
    // marcar que necesita animación
    if (pokemonActual > 0) {
      setNecesitaAnimacion(true);
    }
  }, [pokemonActual]);

  // Resetear el estado cuando cambie el contexto del combate
  useEffect(() => {
    // Limpiar timeouts previos
    limpiarAnimationTimeouts();
    limpiarTimers();
    
    // Resetear estados de combate
    setPokemonFainted(false);
    setMostrarTransicion(false);
    setMostrarCuentaRegresiva(false);
    setMostrarAnimacionPokeball(false);
    setFaseAnimacion(0);
    setCombateEnCurso(false);
    setTapsAcumulados(0);
    setTiempoRestante(0);
    setAtaqueInminente(false);
    setNecesitaAnimacion(false);
    
    // Marcar como primer pokemon solo al inicio o cuando cambie el gimnasio/entrenador
    // No cuando solo cambie el pokemonActual (eso sería cambio de pokemon, no inicio)
    setEsPrimerPokemon(pokemonActual === 0);
  }, [gimnasioActual, entrenadorActual]);

  // Función para iniciar cuenta regresiva completa (para transiciones entre Pokémon)
  const iniciarCuentaRegresivaCompleta = () => {
    console.log('🕒 INICIANDO CUENTA REGRESIVA COMPLETA');
    setMostrarCuentaRegresiva(true);
    setCuentaRegresiva(3);
    
    const interval = setInterval(() => {
      setCuentaRegresiva(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          console.log('⏰ FIN DE CUENTA REGRESIVA - Iniciando combate directo');
          setMostrarCuentaRegresiva(false);
          // Usar función directa sin verificaciones para transiciones automáticas
          iniciarCombateDirecto();
          return 0;
        }
        console.log(`⏰ Cuenta regresiva: ${prev - 1}`);
        playSoundEffect('notification', 0.15);
        return prev - 1;
      });
    }, 1000);
  };

  // Iniciar combate directo (sin verificaciones)
  const iniciarCombateDirecto = async () => {
    console.log('🚀 INICIANDO COMBATE DIRECTO - Estado antes:', { 
      combateEnCurso, 
      mostrarCuentaRegresiva, 
      mostrarAnimacionPokeball 
    });
    
    playSoundEffect('notification', 0.2);

    const gimnasio = gimnasios[gimnasioActual];
    const tiempoBase = calcularTiempoBase(combatienteActual, gimnasioActual);
    const tapsObjetivo = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);

    setTapsAcumulados(0);
    setTiempoRestante(tiempoBase);
    setCombateEnCurso(true);
    setAtaqueInminente(false);
    
    console.log('✅ Estados establecidos para combate directo');

    // Ataques del oponente (más frecuentes para líderes)
    const intervaloBase = combatienteActual === 'entrenador' ? 2000 : 1200;
    const intervaloAtaque = Math.max(intervaloBase - (gimnasioActual * 100), 800);
    
    const ataqueInterval = setInterval(() => {
      setAtaqueInminente(true);
      setTimeout(() => {
        setTapsAcumulados(prev => {
          const efectividad = calcularEfectividad(tipoSeleccionado, gimnasio.tipo);
          let tapsPerdidos = combatienteActual === 'entrenador' ? 3 : 5; // Menos daño de entrenadores
          
          if (efectividad === 'inmune') tapsPerdidos = 0;
          else if (efectividad === 'fuerte') tapsPerdidos = Math.ceil(tapsPerdidos * 0.5);
          else if (efectividad === 'debil') tapsPerdidos = Math.ceil(tapsPerdidos * 1.5);
          
          return Math.max(0, prev - tapsPerdidos);
        });
        setAtaqueInminente(false);
      }, 1000);
    }, intervaloAtaque);

    // Timer del combate
    const timerInterval = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          limpiarTimers();
          setCombateEnCurso(false);
          derrota();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Guardar intervalos globalmente para poder limpiarlos
    (window as any).currentIntervals = { ataqueInterval, timerInterval };
  };

  // Iniciar combate
  const iniciarCombate = async () => {
    if (!tipoSeleccionado) {
      playSoundEffect('error', 0.2);
      alert('¡Selecciona un tipo primero!');
      return;
    }

    playSoundEffect('notification', 0.2);

    const gimnasio = gimnasios[gimnasioActual];
    const tiempoBase = calcularTiempoBase(combatienteActual, gimnasioActual);
    const tapsObjetivo = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);

    setTapsAcumulados(0);
    setTiempoRestante(tiempoBase);
    setCombateEnCurso(true);
    setAtaqueInminente(false);

    // Ataques del oponente (más frecuentes para líderes)
    const intervaloBase = combatienteActual === 'entrenador' ? 2000 : 1200;
    const intervaloAtaque = Math.max(intervaloBase - (gimnasioActual * 100), 800);
    
    const ataqueInterval = setInterval(() => {
      setAtaqueInminente(true);
      setTimeout(() => {
        setTapsAcumulados(prev => {
          const efectividad = calcularEfectividad(tipoSeleccionado, gimnasio.tipo);
          let tapsPerdidos = combatienteActual === 'entrenador' ? 3 : 5; // Menos daño de entrenadores
          
          if (efectividad === 'inmune') tapsPerdidos = 0;
          else if (efectividad === 'fuerte') tapsPerdidos = Math.ceil(tapsPerdidos * 0.5);
          else if (efectividad === 'debil') tapsPerdidos = Math.ceil(tapsPerdidos * 1.5);
          
          return Math.max(0, prev - tapsPerdidos);
        });
        setAtaqueInminente(false);
      }, 500);
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

  // Victoria contra un Pokémon - useCallback para usar en useEffect
  const victoria = useCallback(async () => {
    limpiarTimers();
    
    const gimnasio = gimnasios[gimnasioActual];
    const pokemonActualNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
    
    // Mostrar animación de "fainted" del Pokémon enemigo
    setPokemonFainted(true);
    
    // Reproducir música de victoria parcial solo una vez por pokemon
    if (!musicaVictoriaReproducida) {
      playSoundEffect('wintrainer', 0.3);
      setMusicaVictoriaReproducida(true);
    }
    
    setTimeout(() => {
      setPokemonFainted(false);
      
      const esUltimoDelOponente = esUltimoPokemon(
        gimnasios[gimnasioActual],
        combatienteActual,
        entrenadorActual,
        pokemonActual
      );
      
      if (esUltimoDelOponente) {
        // Es el último Pokémon, terminar combate completamente
        onVictoria();
      } else {
        // Hay más Pokémon, iniciar secuencia de transición con animación de pokeball
        const siguientePokemonNombre = combatienteActual === 'entrenador' 
          ? gimnasio.entrenadores[entrenadorActual].pokemon[pokemonActual + 1]
          : gimnasio.pokemon[pokemonActual + 1];
        
        setPokemonDerrotado(pokemonActualNombre);
        setSiguientePokemon(siguientePokemonNombre);
        setMostrarTransicion(true);
        setMostrarAnimacionPokeball(true);
        setFaseAnimacion(0);
        
        // Secuencia de animación de transición
        setTimeout(() => {
          // Fase 1: Lanzamiento de pokeball
          setFaseAnimacion(1);
        }, 1000);
        
        setTimeout(() => {
          // Fase 2: Aparición del nuevo Pokémon
          setFaseAnimacion(2);
        }, 2500);
        
        setTimeout(() => {
          // Fase 3: Cuenta regresiva para el nuevo combate
          setMostrarAnimacionPokeball(false);
          setMostrarTransicion(false);
          setFaseAnimacion(0);
          setMusicaVictoriaReproducida(false); // Reset para el próximo Pokémon
          
          // Iniciar cuenta regresiva para el siguiente combate
          iniciarCuentaRegresiva();
          
          // Después de la cuenta regresiva, continuar
          setTimeout(() => {
            onVolverAlGimnasio(); // Esto avanzará al siguiente Pokémon
          }, 4000); // 3 segundos de cuenta regresiva + 1 segundo extra
        }, 4000);
      }
    }, 2000); // Duración del "fainted"
  }, [combatienteActual, gimnasioActual, pokemonActual, entrenadorActual, gimnasios, onVictoria, onVolverAlGimnasio, musicaVictoriaReproducida]);

  // Derrota - useCallback para usar en useEffect
  const derrota = useCallback(async () => {
    limpiarTimers();
    playSoundEffect('error', 0.2);
    onDerrota();
  }, [onDerrota]);

  // Verificar victoria automáticamente cuando cambian los taps
  useEffect(() => {
    if (!combateEnCurso) return;
    
    const tapsObjetivo = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);
    
    if (tapsAcumulados >= tapsObjetivo) {
      limpiarTimers();
      setCombateEnCurso(false);
      victoria();
    }
  }, [tapsAcumulados, combateEnCurso, combatienteActual, gimnasioActual, pokemonActual, victoria]);

  // Manejar clics para sumar taps
  const handleTap = () => {
    if (!combateEnCurso) return;
    
    playSoundEffect('pop', 0.1);
    setTapsAcumulados(prev => prev + 1);
  };

  // Manejar touch events para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!combateEnCurso) return;
    handleTap();
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      limpiarTimers();
      limpiarAnimationTimeouts();
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

  // Pantalla de animación de Pokeball
  if (mostrarAnimacionPokeball) {
    const pokemonActualNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
    
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60] overflow-hidden">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes throwBall {
              0% { 
                transform: translate(0, 0) scale(0.5) rotate(0deg); 
                opacity: 0.8; 
              }
              50% { 
                transform: translate(200px, -150px) scale(1) rotate(360deg); 
                opacity: 1; 
              }
              100% { 
                transform: translate(400px, 0px) scale(1.2) rotate(720deg); 
                opacity: 1; 
              }
            }
            @keyframes openBall {
              0% { 
                transform: scale(1.2) rotate(0deg); 
                opacity: 1; 
              }
              50% { 
                transform: scale(1.5) rotate(180deg); 
                opacity: 0.8; 
              }
              100% { 
                transform: scale(2) rotate(360deg); 
                opacity: 0; 
              }
            }
            @keyframes appearPokemon {
              0% { 
                transform: scale(0) rotate(-180deg); 
                opacity: 0; 
              }
              50% { 
                transform: scale(1.3) rotate(-90deg); 
                opacity: 0.7; 
              }
              100% { 
                transform: scale(1) rotate(0deg); 
                opacity: 1; 
              }
            }
          `
        }} />
        <div className="text-center w-full">
          {faseAnimacion === 0 && (
            // Fase de lanzamiento - Solo animación, sin texto
            <div className="animate-in fade-in duration-300">
              <div className="relative flex justify-center">
                {/* Pokeball volando */}
                <div className="relative">
                  <img 
                    src="/pokeball.png" 
                    alt="Pokeball"
                    className="w-16 h-16"
                    style={{ 
                      imageRendering: 'pixelated',
                      animation: 'throwBall 1s ease-out forwards'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                        fallback.classList.add('w-16', 'h-16', 'bg-red-500', 'rounded-full', 'border-4', 'border-white', 'items-center', 'justify-center', 'text-white', 'font-bold');
                        fallback.textContent = '⚫';
                        fallback.style.animation = 'throwBall 1s ease-out forwards';
                      }
                    }}
                  />
                  <div className="hidden"></div>
                  {/* Efecto de rastro */}
                  <div className="absolute inset-0 w-16 h-16 bg-red-400/30 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          )}
          
          {faseAnimacion === 1 && (
            // Fase de apertura - Solo animación, sin texto
            <div className="animate-in fade-in duration-200">
              <div className="relative flex justify-center">
                <img 
                  src="/pokeball.png" 
                  alt="Pokeball"
                  className="w-20 h-20 relative z-10"
                  style={{ 
                    imageRendering: 'pixelated',
                    animation: 'openBall 0.8s ease-in-out forwards'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                      fallback.classList.add('w-20', 'h-20', 'bg-red-500', 'rounded-full', 'border-4', 'border-white', 'items-center', 'justify-center', 'text-white', 'font-bold', 'relative', 'z-10');
                      fallback.textContent = '⚫';
                      fallback.style.animation = 'openBall 0.8s ease-in-out forwards';
                    }
                  }}
                />
                <div className="hidden"></div>
                {/* Múltiples efectos de apertura */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-white/40 rounded-full animate-ping"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-blue-400/50 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-yellow-400/60 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
                </div>
                {/* Partículas brillantes */}
                <div className="absolute top-2 left-6 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.05s' }}></div>
                <div className="absolute top-4 right-8 w-1 h-1 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.25s' }}></div>
              </div>
            </div>
          )}
          
          {faseAnimacion === 2 && (
            // Fase de aparición del Pokémon - Solo animación, sin texto
            <div className="animate-in fade-in duration-300">
              <div className="mb-4 relative">
                <img 
                  src={getPokemonIconUrl(pokemonActualNombre)}
                  alt={pokemonActualNombre}
                  className="w-40 h-40 mx-auto relative z-10"
                  style={{ 
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.8))',
                    animation: 'appearPokemon 1.2s ease-out forwards'
                  }}
                  onError={(e) => {
                    const currentTarget = e.currentTarget as HTMLImageElement;
                    if (currentTarget.src.includes('animated')) {
                      currentTarget.src = getPokemonStaticIconUrl(pokemonActualNombre);
                    } else {
                      currentTarget.style.display = 'none';
                      const fallback = currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                        fallback.classList.add('w-40', 'h-40', 'mx-auto', 'relative', 'z-10', 'bg-gradient-to-br', 'from-purple-400', 'to-blue-500', 'rounded-lg', 'items-center', 'justify-center', 'text-6xl');
                        fallback.textContent = '❓';
                        fallback.style.animation = 'appearPokemon 1.2s ease-out forwards';
                      }
                    }
                  }}
                />
                <div className="hidden"></div>
                {/* Efecto de aparición brillante */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-r from-yellow-400/20 via-white/30 to-blue-400/20 rounded-full animate-ping"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 bg-white/20 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="mt-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-white text-lg font-bold">
                  ¡{pokemonActualNombre} apareció!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pantalla de Pokémon derrotado (fainted)
  if (pokemonFainted) {
    const pokemonActualNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60] overflow-hidden">
        <div className="text-center">
          {/* Sprite del Pokémon con animación de "fainted" */}
          <div className="mb-6 relative">
            <img 
              src={getPokemonIconUrl(pokemonActualNombre)}
              alt={pokemonActualNombre}
              className="w-32 h-32 mx-auto grayscale opacity-50 transform rotate-90 transition-all duration-1000"
              style={{ 
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6)) grayscale(100%)'
              }}
              onError={(e) => {
                const currentTarget = e.currentTarget as HTMLImageElement;
                if (currentTarget.src.includes('animated')) {
                  currentTarget.src = getPokemonStaticIconUrl(pokemonActualNombre);
                }
              }}
            />
            {/* Efecto de "knockout" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-bounce">💥</div>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-red-400 mb-4 drop-shadow-2xl text-shadow-xl animate-pulse">
            {pokemonActualNombre} se ha debilitado!
          </h2>
          <p className="text-xl text-white drop-shadow-lg">
            ¡Has derrotado a {pokemonActualNombre}!
          </p>
        </div>
      </div>
    );
  }

  // Pantalla de transición entre Pokémon
  if (mostrarTransicion) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60] overflow-hidden">
        <div className="text-center max-w-md mx-4">
          <div className="mb-6">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-green-400 mb-4 drop-shadow-2xl text-shadow-xl">
              ¡Has derrotado a {pokemonDerrotado}!
            </h2>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-xl text-white mb-4 drop-shadow-lg">
              {combatienteActual === 'entrenador' ? 'El entrenador' : 'El líder'} enviará a:
            </p>
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 drop-shadow-lg">
              {siguientePokemon}
            </h3>
            <p className="text-lg text-gray-300 drop-shadow-md">
              ¡Prepárate para el siguiente combate!
            </p>
          </div>
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
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60] overflow-hidden">
        <div className="text-white text-center">
          <div className="text-8xl font-bold animate-pulse drop-shadow-2xl text-shadow-lg">
            {cuentaRegresiva === 0 ? '¡AHORA!' : cuentaRegresiva}
          </div>
          <p className="text-xl mt-4 drop-shadow-lg text-gray-100">
            {cuentaRegresiva === 0 ? '¡Comienza la batalla!' : 'Preparándose para batalla...'}
          </p>
        </div>
      </div>
    );
  }

  // Pantalla principal de combate
  console.log('🎮 RENDERIZANDO BATALLA - Estados:', { 
    combateEnCurso, 
    mostrarCuentaRegresiva, 
    mostrarAnimacionPokeball,
    pokemonFainted,
    mostrarTransicion,
    estado 
  });
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center z-[60] text-white overflow-hidden">
      {/* Overlay adicional para asegurar contraste */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Contenido del combate con z-index relativo */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
        {/* Header con información del oponente */}
        <div className="flex items-center gap-4 mb-8 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <img 
            src={oponenteSprite} 
            alt={oponenteNombre}
            className="w-16 h-16 rounded-full bg-white/30 p-2 border-2 border-white/40"
          />
          <div className="text-shadow-lg">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{oponenteNombre}</h2>
            <p className="text-lg text-gray-100 drop-shadow-md">{pokemonNombre}</p>
            <p className="text-sm text-gray-200 drop-shadow-md">Tipo: {gimnasio.tipo}</p>
          </div>
        </div>

        {/* Sprite del Pokémon actual */}
        <div className="mb-6">
          <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <img 
              src={getPokemonIconUrl(pokemonNombre)}
              alt={pokemonNombre}
              className="w-32 h-32 mx-auto"
              style={{ 
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))'
              }}
              onError={(e) => {
                const currentTarget = e.currentTarget as HTMLImageElement;
                if (currentTarget.src.includes('animated')) {
                  currentTarget.src = getPokemonStaticIconUrl(pokemonNombre);
                }
              }}
            />
            <p className="text-center text-white font-bold mt-2 drop-shadow-md">{pokemonNombre}</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full max-w-md mb-4">
          <div className="flex justify-between text-sm mb-2 text-white drop-shadow-md">
            <span>Progreso: {tapsAcumulados}/{tapsObjetivo}</span>
            <span>Tiempo: {tiempoRestante}s</span>
          </div>
          <div className="w-full bg-gray-800/70 rounded-full h-6 border border-white/20">
            <div 
              className={`h-6 rounded-full transition-all duration-300 ${
                ataqueInminente ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : 'bg-green-500 shadow-lg shadow-green-500/50'
              }`}
              style={{ width: `${Math.min((tapsAcumulados / tapsObjetivo) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Área de tap */}
        <div className="mb-8">
          <button
            onClick={handleTap}
            onTouchStart={handleTouchStart}
            disabled={!combateEnCurso}
            className={`battle-tap-button w-32 h-32 rounded-full text-4xl font-bold transition-all duration-200 border-4 shadow-2xl ${
              combateEnCurso
                ? ataqueInminente
                  ? 'bg-red-500 hover:bg-red-400 animate-pulse border-red-300 shadow-red-500/50'
                  : 'bg-blue-500 hover:bg-blue-400 border-blue-300 shadow-blue-500/50'
                : 'bg-gray-500 cursor-not-allowed border-gray-400 shadow-gray-500/30'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {combateEnCurso ? '👊' : '🔄'}
          </button>
        </div>

        {/* Efectividad de tipo */}
        {combateEnCurso && (
          <div className="mt-4 text-center bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <p className="text-sm text-white drop-shadow-md">
              {tipoSeleccionado} vs {gimnasio.tipo}
            </p>
            <p className={`text-xs font-bold drop-shadow-md ${
              calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'fuerte' ? 'text-green-400' :
              calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'debil' ? 'text-red-400' :
              calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'inmune' ? 'text-gray-400' :
              'text-white'
            }`}>
              {calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'fuerte' ? 'Súper efectivo' :
               calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'debil' ? 'No muy efectivo' :
               calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'inmune' ? 'No tiene efecto' :
               'Efectividad normal'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleSystem;
