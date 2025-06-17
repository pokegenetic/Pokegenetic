import React, { useState, useEffect, useRef } from 'react';
import { playSoundEffect } from '@/lib/soundEffects';
import { getShowdownCryUrl } from '@/lib/getShowdownCryUrl';
import { BattleProps } from './battleTypes';
import { getPokemonIconUrl, getPokemonStaticIconUrl } from '../../utils/pokemonSprites';
import superpowerSound from '/src/sounds/sfx/superpower.mp3';
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
  
  // Estados para ataques críticos
  const [mostrarCritico, setMostrarCritico] = useState(false);
  const [mensajeCritico, setMensajeCritico] = useState('');
  
  // Estados para Ataque Cargado (cada 100 taps)
  const [superTapDisponible, setSuperTapDisponible] = useState(false);
  const [tapsHistoricos, setTapsHistoricos] = useState(0); // Contador total de taps
  const [mostrarSuperTap, setMostrarSuperTap] = useState(false);
  
  // Estados para las animaciones de batalla
  const [faseAnimacion, setFaseAnimacion] = useState('intro'); // 'intro', 'pokeball', 'pokemon', 'countdown', 'battle', 'victory', 'transition'
  const [cuentaRegresiva, setCuentaRegresiva] = useState(3);
  const [pokemonFainted, setPokemonFainted] = useState(false);
  const [trainerData, setTrainerData] = useState<any>(null);
  const [isLeaderBattle, setIsLeaderBattle] = useState(false);

  // Estados para diálogos de victoria
  const [mostrarDialogoVictoria, setMostrarDialogoVictoria] = useState(false);
  const [tipoDialogo, setTipoDialogo] = useState<'siguiente' | 'final'>('siguiente');
  const [mensajeDialogo, setMensajeDialogo] = useState('');
  
  // Estado para mensaje de Pokémon derrotado
  const [mostrarMensajeDerrota, setMostrarMensajeDerrota] = useState(false);
  const [pokemonDerrotadoNombre, setPokemonDerrotadoNombre] = useState('');
  
  // Estados para diálogo de derrota del usuario
  const [mostrarDialogoDerrota, setMostrarDialogoDerrota] = useState(false);
  const [mensajeDialogoDerrota, setMensajeDialogoDerrota] = useState('');

  // Referencias
  const tapsAcumuladosRef = useRef(tapsAcumulados);
  const combateEnCursoRef = useRef(combateEnCurso);
  const battleMusicRef = useRef<HTMLAudioElement | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar referencias
  useEffect(() => {
    tapsAcumuladosRef.current = tapsAcumulados;
    combateEnCursoRef.current = combateEnCurso;
  });

  // Función para limpiar timers
  const limpiarTimers = () => {
    if ((window as any).currentIntervals) {
      const { ataqueInterval, timerInterval } = (window as any).currentIntervals;
      if (ataqueInterval) clearInterval(ataqueInterval);
      if (timerInterval) clearInterval(timerInterval);
      (window as any).currentIntervals = null;
    }
    
    // Limpiar también el timer de cuenta regresiva si existe
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Frases aleatorias del entrenador
  const getTrainerPhrase = (isLeader: boolean) => {
    const frasesLider = [
      "¡No podrás contra mis Pokémon!",
      "¡Me he preparado mucho para convertirme en líder!",
      "¡Veamos si tienes lo necesario para obtener mi medalla!",
      "¡Soy el líder de este gimnasio, no será fácil vencerme!",
      "¡Mis Pokémon y yo somos invencibles!",
      "¡Demuestra que mereces mi respeto!",
      "¡Como líder, debo proteger el honor de este gimnasio!",
      "¡Años de entrenamiento me han llevado a este momento!",
      "¡Mi experiencia como líder será tu perdición!",
      "¡Los desafiantes como tú aparecen raramente por aquí!",
      "¡Espero que estés preparado para un verdadero desafío!",
      "¡Mi posición como líder no es solo para mostrar!",
      "¡Te mostraré por qué soy el guardián de esta medalla!",
      "¡Muchos han intentado vencerme, pero pocos lo han logrado!",
      "¡La responsabilidad de ser líder pesa sobre mis hombros!"
    ];
    
    const frasesEntrenador = [
      "¡No creas que será fácil!",
      "¡Mis Pokémon no se rendirán sin pelear!",
      "¡Veamos de qué estás hecho!",
      "¡Me he preparado mucho para este combate!",
      "¡Te arrepentirás de haberme desafiado!",
      "¡Prepárate para la derrota!",
      "¡He estado esperando un oponente como tú!",
      "¡Mis Pokémon están sedientos de batalla!",
      "¡No subestimes mi experiencia!",
      "¡Este será un combate que no olvidarás!",
      "¡He entrenado duro para este momento!",
      "¡Mi estrategia te sorprenderá!",
      "¡Prepárate para conocer el verdadero poder!",
      "¡Los débiles no tienen lugar aquí!",
      "¡Te mostraré lo que significa ser fuerte!",
      "¡Mis Pokémon y yo tenemos un vínculo inquebrantable!",
      "¡La victoria será mía, sin duda alguna!",
      "¡He derrotado a muchos antes que tú!"
    ];
    
    const frases = isLeader ? frasesLider : frasesEntrenador;
    return frases[Math.floor(Math.random() * frases.length)];
  };

  // Función para obtener mensajes de victoria parcial (cuando queda más Pokémon)
  const getMensajeVictoriaParcial = (isLeader: boolean) => {
    const mensajesEntrenador = [
      "¡Diablos! No pensé que lo derrotarías. ¡Voy con mi próximo Pokémon!",
      "¡Increíble! Pero aún no he perdido. ¡Sal, siguiente Pokémon!",
      "¡Qué fuerte eres! Pero tengo más Pokémon que te darán problemas.",
      "¡No puede ser! Bueno, veamos qué tal te vas contra mi siguiente compañero.",
      "¡Impresionante! Pero la batalla recién comienza. ¡Ve, Pokémon!",
      "¡Maldición! Subestimé tu fuerza. ¡Pero no me rendiré!",
      "¡Vaya sorpresa! Pero tengo más cartas bajo la manga.",
      "¡Qué técnica tan impresionante! Veamos si puedes repetirla.",
      "¡Has superado mis expectativas! Pero esto se pone interesante.",
      "¡Excelente combate! Ahora viene mi verdadero as bajo la manga.",
      "¡No está nada mal! Pero aún tengo Pokémon más fuertes.",
      "¡Me has tomado por sorpresa! Pero la batalla continúa.",
      "¡Qué estrategia tan brillante! Veamos cómo respondes a esto.",
      "¡Impresionante poder! Pero yo también tengo mis secretos."
    ];

    const mensajesLider = [
      "¡Excelente combate! Pero como líder de gimnasio, tengo más trucos bajo la manga.",
      "¡Impresionante! Veo que tienes verdadero potencial. ¡Continuemos!",
      "¡Fantástico! Un entrenador como tú merece enfrentar a todo mi equipo.",
      "¡Qué batalla tan emocionante! Pero aún no has visto mi mejor Pokémon.",
      "¡Wow, Increíble estrategia! Veamos si puedes mantener ese nivel.",
      "¡Magnífico! Hacía tiempo que no tenía un desafío tan bueno.",
      "¡Soberbio! Pero un líder de gimnasio nunca muestra todas sus cartas de una vez.",
      "¡Extraordinario! Pero la verdadera prueba apenas comienza.",
      "¡Qué técnica tan refinada! Veamos si puedes superar mi próximo desafío.",
      "¡Espléndido! Pero como líder, debo evaluar completamente tus habilidades.",
      "¡Brillante! Pero aún tengo Pokémon que no han mostrado su verdadero poder.",
      "¡Magistral! Un combate digno de un futuro campeón. ¡Continuemos!",
      "¡Fenomenal! Pero la responsabilidad de ser líder me obliga a dar todo.",
      "¡Excepcional! Veamos si puedes mantener este nivel hasta el final."
    ];

    const mensajes = isLeader ? mensajesLider : mensajesEntrenador;
    return mensajes[Math.floor(Math.random() * mensajes.length)];
  };

  // Función para obtener mensajes de victoria final
  const getMensajeVictoriaFinal = (isLeader: boolean, nombreGimnasio?: string) => {
    const mensajesEntrenador = [
      "¡Sí que eres fuerte! Entrenaré más duro a mis Pokémon.",
      "¡Increíble! Me has enseñado mucho con esta batalla.",
      "¡Qué derrota tan honrosa! Definitivamente tienes talento.",
      "¡Impresionante! Puedo ver por qué quieres desafiar a los líderes.",
      "¡Fantástico! Has demostrado ser un entrenador excepcional.",
      "¡Me has vencido completamente! Respeto tu fuerza.",
      "¡Qué batalla tan intensa! Realmente me has superado.",
      "¡Extraordinario! Tu técnica es verdaderamente impresionante.",
      "¡Has demostrado un nivel increíble! Me quito el sombrero ante ti.",
      "¡Magnífico combate! Tu determinación es admirable.",
      "¡Soberbio! Definitivamente tienes lo necesario para llegar lejos.",
      "¡Qué poder tan impresionante! Has ganado mi respeto total.",
      "¡Fenomenal! Será un honor haber luchado contra alguien como tú.",
      "¡Espléndido! Tu potencial es verdaderamente ilimitado."
    ];

    const mensajesLider = [
      `¡Extraordinario! Has demostrado ser digno de la medalla ${nombreGimnasio}. ¡Fue un combate increíble!`,
      `¡Qué batalla tan emocionante! Te mereces esta medalla ${nombreGimnasio}. ¡Úsala con orgullo!`,
      `¡Impresionante! Pocas veces he visto tanta determinación. La medalla ${nombreGimnasio} es tuya.`,
      `¡Magnífico combate! Has ganado mi respeto y la medalla ${nombreGimnasio}. ¡Sigue así!`,
      `¡Fantástico! Tu estrategia fue perfecta. Te otorgo la medalla ${nombreGimnasio}.`,
      `¡Increíble! Definitivamente mereces ser reconocido con la medalla ${nombreGimnasio}.`,
      `¡Soberbio! Como líder, es un honor otorgarte la medalla ${nombreGimnasio}.`,
      `¡Espléndido! Has demostrado un nivel digno de la medalla ${nombreGimnasio}.`,
      `¡Fenomenal! Tu poder merece ser reconocido con la medalla ${nombreGimnasio}.`,
      `¡Magistral! Pocos entrenadores han ganado la medalla ${nombreGimnasio} con tal brillantez.`,
      `¡Excepcional! La medalla ${nombreGimnasio} quedará perfecta en tu colección.`,
      `¡Brillante! Tu técnica ha sido digna de la medalla ${nombreGimnasio}.`,
      `¡Legendario! Este combate será recordado. La medalla ${nombreGimnasio} es tuya por derecho.`
    ];

    const mensajes = isLeader ? mensajesLider : mensajesEntrenador;
    return mensajes[Math.floor(Math.random() * mensajes.length)];
  };

  // Función para cerrar diálogo y continuar con el siguiente Pokémon
  const cerrarDialogoSiguiente = () => {
    setMostrarDialogoVictoria(false);
    setMensajeDialogo('');
    
    // Detener música de victoria si existe
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
      if (audio.src.includes('wintrainer') || 
          audio.src.includes('wingym') ||
          audio.src.includes('obtainbadge')) {
        console.log(`🔇 Deteniendo música de victoria: ${audio.src || audio.currentSrc}`);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        audio.muted = true;
        try {
          audio.remove();
        } catch (e) {
          console.log('No se pudo remover el audio, pero se silenció');
        }
      }
    });
    
    // Continuar sin música de victoria, solo al siguiente Pokémon
    console.log('🔄 Pokémon derrotado, continuando con el siguiente...');
    onVolverAlGimnasio();
  };

  // Función para cerrar diálogo final y proceder a recompensas
  const cerrarDialogoFinal = () => {
    console.log('🎁 CERRAR DIÁLOGO FINAL - INICIANDO...');
    setMostrarDialogoVictoria(false);
    setMensajeDialogo('');
    
    // Detener música de batalla primero
    detenerMusicaBatalla();
    console.log('🔇 Música de batalla detenida');
    
    // DETENER COMPLETAMENTE TODA LA MÚSICA DE COMBATE/VICTORIA
    const allAudios = document.querySelectorAll('audio');
    console.log(`🔊 Encontrados ${allAudios.length} elementos de audio`);
    allAudios.forEach((audio, index) => {
      const audioSrc = audio.src || audio.currentSrc || 'desconocido';
      console.log(`🔍 Audio ${index}: ${audioSrc}`);
      
      // Detener CUALQUIER audio que no sea explícitamente música de gimnasio
      if (audioSrc.includes('wintrainer') || 
          audioSrc.includes('wingym') ||
          audioSrc.includes('obtainbadge') ||
          audioSrc.includes('gymbattle') ||
          audioSrc.includes('trainerbattle') ||
          audioSrc.includes('victorygym')) {
        console.log(`🔇 DETENIENDO COMPLETAMENTE: ${audioSrc}`);
        
        // Detener agresivamente
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        audio.muted = true;
        audio.src = '';
        
        // Intentar remover completamente
        try {
          if (audio.parentNode) {
            audio.parentNode.removeChild(audio);
          }
        } catch (e) {
          console.log('No se pudo remover físicamente el audio, pero se limpió');
        }
      }
    });
    
    // Llamar a onVictoria() para que procese las recompensas y modal
    console.log('🎁 Cerrando diálogo de batalla...');
    console.log('📞 Llamando a onVictoria()...');
    onVictoria();
    console.log('✅ onVictoria() ejecutada');
  };

  // Función para iniciar/reiniciar la música de batalla
  const iniciarMusicaBatalla = (reiniciar: boolean = false, forceIsLeader?: boolean) => {
    // Usar el parámetro forzado si se proporciona, sino usar el estado
    const usarIsLeader = forceIsLeader !== undefined ? forceIsLeader : isLeaderBattle;
    const musicFile = usarIsLeader ? '/src/sounds/gymbattle.mp3' : '/src/sounds/trainerbattle.mp3';
    console.log(`🎵 ${reiniciar ? 'Reiniciando' : 'Iniciando'} música de batalla:`);
    console.log(`   - Tipo: ${usarIsLeader ? 'LÍDER' : 'ENTRENADOR'}`);
    console.log(`   - Archivo: ${musicFile}`);
    console.log(`   - forceIsLeader: ${forceIsLeader}, isLeaderBattle state: ${isLeaderBattle}`);
    
    // Detener música anterior si existe
    if (battleMusicRef.current) {
      battleMusicRef.current.pause();
      battleMusicRef.current.currentTime = 0;
      battleMusicRef.current.src = '';
      battleMusicRef.current = null;
    }
    
    // Crear nueva instancia
    battleMusicRef.current = new Audio(musicFile);
    battleMusicRef.current.volume = 0.1;
    battleMusicRef.current.loop = true;
    
    // Reproducir con delay si es reinicio para que se note el reinicio
    const delay = reiniciar ? 500 : 0;
    setTimeout(() => {
      if (battleMusicRef.current) {
        battleMusicRef.current.play().catch(console.error);
      }
    }, delay);
  };

  // Función para detener la música de batalla
  const detenerMusicaBatalla = () => {
    if (battleMusicRef.current) {
      battleMusicRef.current.pause();
      battleMusicRef.current.currentTime = 0;
      console.log('🎵 Música de batalla detenida manualmente');
    }
  };

  // Función para reproducir el cry del Pokémon
  const reproducirCryPokemon = (pokemonName: string, volume: number = 0.3) => {
    try {
      const cryUrl = getShowdownCryUrl(pokemonName);
      if (cryUrl) {
        const audio = new Audio(cryUrl);
        audio.volume = volume;
        audio.play().catch(error => {
          console.log('🔊 No se pudo reproducir el cry de', pokemonName, ':', error);
        });
      }
    } catch (error) {
      console.log('🔊 Error al reproducir cry de', pokemonName, ':', error);
    }
  };

  // Función de efectividad de tipos
  const calcularEfectividad = (tipoAtacante: string, tipoDefensor: string): 'fuerte' | 'debil' | 'inmune' | 'normal' => {
    const efectividades: Record<string, { fuerte: string[]; debil: string[]; inmune: string[] }> = {
      'Normal': { fuerte: [], debil: ['Roca', 'Acero'], inmune: ['Fantasma'] },
      'Fuego': { fuerte: ['Planta', 'Hielo', 'Bicho', 'Acero'], debil: ['Fuego', 'Agua', 'Roca', 'Dragón'], inmune: [] },
      'Agua': { fuerte: ['Fuego', 'Tierra', 'Roca'], debil: ['Agua', 'Planta', 'Dragón'], inmune: [] },
      'Eléctrico': { fuerte: ['Agua', 'Volador'], debil: ['Eléctrico', 'Planta', 'Dragón'], inmune: ['Tierra'] },
      'Planta': { fuerte: ['Agua', 'Tierra', 'Roca'], debil: ['Fuego', 'Planta', 'Veneno', 'Volador', 'Bicho', 'Dragón', 'Acero'], inmune: [] },
      'Roca': { fuerte: ['Fuego', 'Hielo', 'Volador', 'Bicho'], debil: ['Lucha', 'Tierra', 'Acero'], inmune: [] }
    };

    const tipoData = efectividades[tipoAtacante];
    if (!tipoData) return 'normal';

    if (tipoData.inmune.includes(tipoDefensor)) return 'inmune';
    if (tipoData.fuerte.includes(tipoDefensor)) return 'fuerte';
    if (tipoData.debil.includes(tipoDefensor)) return 'debil';
    return 'normal';
  };

  // Inicializar batalla cuando se monta el componente - SOLO UNA VEZ
  useEffect(() => {
    console.log('🎮 BattleSystem montado - Iniciando secuencia de batalla');
    
    // Limpiar timers previos
    limpiarTimers();
    
    // Determinar si es líder o entrenador
    const isLeader = combatienteActual === 'lider';
    setIsLeaderBattle(isLeader);
    console.log(`🎵 Tipo de combate: ${isLeader ? 'LÍDER (gymbattle.mp3)' : 'ENTRENADOR (trainerbattle.mp3)'}`);
    console.log(`🎯 combatienteActual: ${combatienteActual}`);
    
    // Obtener datos del entrenador
    const gimnasio = gimnasios[gimnasioActual];
    const currentTrainer = isLeader ? 
      { nombre: gimnasio.nombre, sprite: gimnasio.sprite } :
      gimnasio.entrenadores[entrenadorActual];
    
    setTrainerData(currentTrainer);
    
    // Pasar directamente el valor isLeader para evitar problemas de estado asíncrono
    iniciarSecuenciaBatalla(isLeader);
  }, []); // Dependencias vacías para que solo se ejecute una vez

  // Reiniciar secuencia cuando cambia el pokemonActual (para múltiples Pokémon)
  useEffect(() => {
    if (pokemonActual > 0) {
      console.log(`🔄 Pokémon cambió a: ${pokemonActual}, reiniciando secuencia...`);
      
      // La música de batalla debe CONTINUAR sonando durante todo el combate
      // NO detener ni reiniciar la música aquí
      console.log('🎵 La música de batalla continúa para el siguiente Pokémon');
      
      // Resetear estados
      setTapsAcumulados(0);
      setTiempoRestante(0);
      setCombateEnCurso(false);
      setAtaqueInminente(false);
      setPokemonFainted(false);
      setMostrarCritico(false);
      setMensajeCritico('');
      setMostrarSuperTap(false);
      // Nota: NO resetear tapsHistoricos ni superTapDisponible para mantener progreso entre pokémon
      
      // Mostrar secuencia abreviada para el segundo Pokémon (sin intro del entrenador)
      setFaseAnimacion('pokeball');
      // Reproducir sonido de pokeball al lanzarla
      playSoundEffect('pokeballthrow', 0.5);
      
      setTimeout(() => {
        setFaseAnimacion('pokemon');
        // Reproducir sonido de pokeball explotando/abriéndose
        playSoundEffect('pokeballexplode', 0.5);
        
        // Reproducir cry del Pokémon cuando aparece
        const gimnasio = gimnasios[gimnasioActual];
        const pokemonActualNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
        reproducirCryPokemon(pokemonActualNombre, 0.4);
        
        setTimeout(() => {
          setFaseAnimacion('countdown');
          iniciarCuentaRegresiva();
        }, 1500);
      }, 2000);
    }
  }, [pokemonActual]);

  // Función principal para iniciar la secuencia de batalla
  const iniciarSecuenciaBatalla = (isLeaderOverride?: boolean) => {
    console.log('🚀 Iniciando secuencia de batalla completa');
    
    // PASO 1: Detener música de batalla anterior
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
      if (audio.src.includes('trainerbattle') || 
          audio.src.includes('gymbattle')) {
        console.log(`🔇 Deteniendo música: ${audio.src || audio.currentSrc}`);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
        audio.muted = true;
        // Intentar remover el elemento si es posible
        try {
          audio.remove();
        } catch (e) {
          console.log('No se pudo remover el audio, pero se silenció');
        }
      }
    });

    
    // PASO 2: Reproducir música de batalla según el tipo de oponente
    iniciarMusicaBatalla(false, isLeaderOverride);
    
    // Fase 1: Mostrar entrenador y diálogo (3 segundos)
    setFaseAnimacion('intro');
    
    setTimeout(() => {
      // Fase 2: Animación de pokeball desde la mano del entrenador (2 segundos)
      setFaseAnimacion('pokeball');
      // Reproducir sonido de pokeball al lanzarla
      playSoundEffect('pokeballthrow', 0.5);
      
      setTimeout(() => {
        // Fase 3: Aparición del pokemon con efecto (1.5 segundos)
        setFaseAnimacion('pokemon');
        // Reproducir sonido de pokeball explotando/abriéndose
        playSoundEffect('pokeballexplode', 0.5);
        
        // Reproducir cry del Pokémon cuando aparece por primera vez
        const gimnasio = gimnasios[gimnasioActual];
        const pokemonActualNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
        reproducirCryPokemon(pokemonActualNombre, 0.4);
        
        setTimeout(() => {
          // Fase 4: Cuenta regresiva (4 segundos total)
          setFaseAnimacion('countdown');
          iniciarCuentaRegresiva();
        }, 1500);
      }, 2000);
    }, 3000);
  };

  // Función de cuenta regresiva
  const iniciarCuentaRegresiva = () => {
    console.log('⏱️ Iniciando cuenta regresiva desde 3');
    
    // Limpiar cualquier cuenta regresiva anterior
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    setCuentaRegresiva(3);
    
    countdownIntervalRef.current = setInterval(() => {
      setCuentaRegresiva(prev => {
        console.log(`⏱️ Cuenta regresiva: ${prev} -> ${prev - 1}`);
        
        if (prev <= 1) {
          console.log('⚔️ ¡CUENTA REGRESIVA TERMINADA - INICIANDO COMBATE!');
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          playSoundEffect('notification', 0.3); // Sonido especial para "¡COMBATE!"
          setFaseAnimacion('battle');
          iniciarCombateReal();
          return 0;
        }
        playSoundEffect('notification', 0.2); // Sonido para cada número
        return prev - 1;
      });
    }, 1000);
  };

  // Función para iniciar el combate real
  const iniciarCombateReal = () => {
    // Verificar que no hay otro combate ya iniciado
    if ((window as any).currentIntervals) {
      console.log('� Combate ya iniciado, cancelando duplicado');
      return;
    }
    
    console.log('�🔥 COMBATE REAL INICIADO - AHORA SÍ INICIA EL TIMER');
    
    const gimnasio = gimnasios[gimnasioActual];
    const tiempoBase = calcularTiempoBase(combatienteActual, gimnasioActual);

    // IMPORTANTE: Resetear completamente el estado del combate
    setTapsAcumulados(0);
    setTiempoRestante(tiempoBase);
    setCombateEnCurso(true); // ¡Esto es crucial!
    setAtaqueInminente(false);
    setMostrarCritico(false);
    setMensajeCritico('');
    setMostrarSuperTap(false);
    // Nota: NO resetear tapsHistoricos ni superTapDisponible para mantener progreso

    // Sonido de inicio del combate
    playSoundEffect('notification', 0.2);

    console.log(`⏰ Timer iniciado: ${tiempoBase} segundos`);
    console.log(`🎯 Taps objetivo: ${calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual)}`);

    // Ataques del oponente
    const intervaloBase = combatienteActual === 'entrenador' ? 2000 : 1200;
    const intervaloAtaque = Math.max(intervaloBase - (gimnasioActual * 100), 800);
    
    const ataqueInterval = setInterval(() => {
      if (!combateEnCursoRef.current) {
        clearInterval(ataqueInterval);
        return;
      }
      
      setAtaqueInminente(true);
      
      setTimeout(() => {
        if (!combateEnCursoRef.current) return;
        
        setTapsAcumulados(prev => {
          const efectividad = calcularEfectividad(tipoSeleccionado, gimnasio.tipo);
          // Reducir el daño base del rival para mejor balance
          let tapsPerdidos = combatienteActual === 'entrenador' ? 2 : 3; // Reducido de 3/5 a 2/3
          
          // Ajustar efectividad más favorable al usuario
          if (efectividad === 'fuerte') tapsPerdidos = Math.ceil(tapsPerdidos * 0.5); // Más favorable
          else if (efectividad === 'debil') tapsPerdidos = Math.ceil(tapsPerdidos * 1.2); // Menos penalización
          else if (efectividad === 'inmune') tapsPerdidos = Math.ceil(tapsPerdidos * 1.3); // Menos penalización

          const nuevoTaps = Math.max(0, prev - tapsPerdidos);
          return nuevoTaps;
        });
        setAtaqueInminente(false);
      }, 1500);
    }, intervaloAtaque);

    // Timer del combate - UN SOLO TIMER
    const timerInterval = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(ataqueInterval);
          clearInterval(timerInterval);
          (window as any).currentIntervals = null;
          
          const tapsObjetivoFinal = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);

          setTimeout(() => {
            if (tapsAcumuladosRef.current >= tapsObjetivoFinal) {
              victoria();
            } else {
              derrota();
            }
          }, 100);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Guardar intervalos para limpieza
    (window as any).currentIntervals = { ataqueInterval, timerInterval };
  };

  // Victoria contra un Pokémon
  const victoria = () => {
    console.log('🎉 Victoria!');
    limpiarTimers();
    setCombateEnCurso(false);
    
    const gimnasio = gimnasios[gimnasioActual];
    const pokemonActualNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
    
    // Mostrar animación de "fainted" y reproducir cry de derrota
    setPokemonFainted(true);
    
    // Reproducir sonido de Pokéball regresando cuando el Pokémon es derrotado
    playSoundEffect('pokeballreturn', 0.3);
    
    // Reproducir cry del Pokémon derrotado con volumen más bajo
    reproducirCryPokemon(pokemonActualNombre, 0.25);
    
    setTimeout(() => {
      setPokemonFainted(false);
      
      // Mostrar mensaje de Pokémon derrotado primero
      setPokemonDerrotadoNombre(pokemonActualNombre);
      setMostrarMensajeDerrota(true);
      
      // Después de 2 segundos, proceder con el diálogo del entrenador
      setTimeout(() => {
        setMostrarMensajeDerrota(false);
        
        const esUltimoDelOponente = esUltimoPokemon(
          gimnasios[gimnasioActual],
          combatienteActual,
          entrenadorActual,
          pokemonActual
        );
        
        if (esUltimoDelOponente) {
          // Es el último Pokémon - AHORA SÍ detener música de batalla
          console.log('🏆 ÚLTIMO POKÉMON DERROTADO - VICTORIA COMPLETA!');
          console.log('   - isLeaderBattle:', isLeaderBattle);
          
          const nombreGimnasio = gimnasios[gimnasioActual].nombre;
          console.log('   - nombreGimnasio:', nombreGimnasio);
          
          detenerMusicaBatalla();
          
          // Reproducir música de victoria y mostrar diálogo final
          const victorySoundFile = isLeaderBattle ? 'wingym' : 'wintrainer';
          console.log(`🎵 Victoria completa! Reproduciendo: ${victorySoundFile}`);
          playSoundEffect(victorySoundFile, 0.4);
      
          const mensaje = getMensajeVictoriaFinal(isLeaderBattle, nombreGimnasio);
          console.log('📝 Mensaje de victoria final:', mensaje);
          setMensajeDialogo(mensaje);
          setTipoDialogo('final');
          setMostrarDialogoVictoria(true);
          console.log('✅ Diálogo de victoria final activado');
        } else {
          // Hay más Pokémon - NO detener música de batalla, solo mostrar diálogo
          console.log('🎵 Manteniendo música de batalla - quedan más Pokémon');
          const mensaje = getMensajeVictoriaParcial(isLeaderBattle);
          setMensajeDialogo(mensaje);
          setTipoDialogo('siguiente');
          setMostrarDialogoVictoria(true);
        }
      }, 2000);
    }, 2000);
  };

  // Derrota
  const derrota = () => {
    console.log('💀 Derrota');
    limpiarTimers();
    setCombateEnCurso(false);
    
    // Detener inmediatamente la música de batalla
    detenerMusicaBatalla();
    
    playSoundEffect('error', 0.2);
    
    // Mostrar diálogo de derrota del entrenador/líder
    const gimnasio = gimnasios[gimnasioActual];
    const mensaje = getMensajeDerrota(isLeaderBattle, gimnasio.nombre);
    setMensajeDialogoDerrota(mensaje);
    setMostrarDialogoDerrota(true);
    
    // Después de mostrar el diálogo, regresar a la liga
    setTimeout(() => {
      setMostrarDialogoDerrota(false);
      onDerrota();
    }, 4000); // 4 segundos para leer el mensaje
  };

  // Función para obtener mensajes de derrota (cuando el usuario pierde)
  const getMensajeDerrota = (isLeader: boolean, nombreGimnasio?: string) => {
    const mensajesEntrenador = [
      "¡Ja, ja, ja! ¡Sabía que no podrías contra mis Pokémon!",
      "¡Te dije que me había preparado mucho! ¡Mejor suerte la próxima vez!",
      "¡Mis Pokémon son demasiado fuertes para ti! ¡Entrena más!",
      "¡No subestimes a un entrenador experimentado como yo!",
      "¡Eso es lo que pasa cuando desafías a alguien fuera de tu liga!",
      "¡Jajaja! ¡Deberías entrenar más antes de enfrentarme otra vez!",
      "¡Mis años de experiencia han valido la pena! ¡Hasta la vista!",
      "¡No esperaba menos! ¡Mis Pokémon y yo somos imparables!",
      "¡Te falta mucho camino por recorrer, jovencito!",
      "¡La experiencia no se improvisa! ¡Vuelve cuando seas más fuerte!",
      "¡Qué ingenuo pensar que podrías vencerme tan fácilmente!",
      "¡Mis estrategias son el resultado de años de entrenamiento!",
      "¡Los novatos como tú necesitan más práctica!",
      "¡Te lo advertí, pero no me escuchaste! ¡Ja, ja, ja!",
      "¡Mis Pokémon y yo tenemos una sincronización perfecta!"
    ];

    const mensajesLider = [
      `¡Como líder del Gimnasio de ${nombreGimnasio || 'este gimnasio'}, no puedo permitir que pases sin demostrar tu valía!`,
      "¡Los líderes de gimnasio no llegamos aquí por casualidad! ¡Entrena más y regresa!",
      "¡Pensaste que sería fácil obtener una medalla? ¡Los desafíos reales apenas comienzan!",
      "¡Un verdadero líder de gimnasio nunca se rinde! ¡Esa es la diferencia entre tú y yo!",
      "¡La responsabilidad de proteger este gimnasio no es algo que tome a la ligera!",
      "¡Muchos entrenadores han intentado vencerme, pero pocos lo han logrado! ¡Sigue entrenando!",
      "¡Como líder, debo mantener el honor de este gimnasio! ¡Regresa cuando seas más fuerte!",
      "¡Los líderes de gimnasio somos la prueba definitiva! ¡No te rindas y sigue mejorando!",
      "¡Mi posición como líder no es solo decorativa! ¡Demuestra que lo entiendes!",
      "¡Años de experiencia como líder me han preparado para esto!",
      "¡La medalla de este gimnasio no se entrega a cualquiera!",
      "¡Un líder debe ser un ejemplo de fuerza y determinación!",
      "¡Mi deber como guardián de esta medalla es absoluto!",
      "¡Los verdaderos campeones se forjan enfrentando adversidades como esta!",
      "¡Como líder, debo asegurarme de que solo los dignos obtengan mi medalla!"
    ];

    const mensajes = isLeader ? mensajesLider : mensajesEntrenador;
    return mensajes[Math.floor(Math.random() * mensajes.length)];
  };

  // Manejar clics para sumar taps
  const handleTap = () => {
    if (!combateEnCurso) return;
    
    // Calcular si es un ataque crítico (2% de probabilidad)
    const esCritico = Math.random() < 0.02; // 2% de probabilidad
    
    if (esCritico) {
      // Ataque crítico: multiplicador equilibrado
      playSoundEffect('notification', 0.3); // Sonido especial para crítico
      setTapsAcumulados(prev => prev + 4); // x4 taps - balance entre ventaja y equilibrio
      setTapsHistoricos(prev => prev + 4);
      
      // Mostrar mensaje de crítico
      setMensajeCritico('¡GOLPE CRÍTICO!');
      setMostrarCritico(true);
      
      // Ocultar mensaje después de 1.0 segundos
      setTimeout(() => {
        setMostrarCritico(false);
      }, 1500);
    } else {
      // Ataque normal
      playSoundEffect('pop', 0.1);
      setTapsAcumulados(prev => prev + 1);
      setTapsHistoricos(prev => prev + 1);
    }
  };

  // Manejar Ataque Cargado (botón separado)
  const handleSuperTap = () => {
    if (!combateEnCurso || !superTapDisponible) return;
    
    // Ataque Cargado: 20 taps de una vez
    playSoundEffect('superpower', 0.9); // Sonido especial para Ataque Cargado
    setTapsAcumulados(prev => prev + 20);
    setTapsHistoricos(prev => prev + 20);
    
    // Mostrar mensaje de Ataque Cargado
    setMensajeCritico('¡ATAQUE CARGADO!');
    setMostrarSuperTap(true);
    setSuperTapDisponible(false); // Consumir el Ataque Cargado
    
    // Ocultar mensaje después de 2 segundos
    setTimeout(() => {
      setMostrarSuperTap(false);
    }, 2000);
  };

  // Verificar victoria automáticamente
  useEffect(() => {
    if (!combateEnCurso) return;
    
    const tapsObjetivo = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);
    
    if (tapsAcumulados >= tapsObjetivo) {
      limpiarTimers();
      setCombateEnCurso(false);
      victoria();
    }
  }, [tapsAcumulados, combateEnCurso]);

  // Verificar Ataque Cargado cada 100 taps históricos
  useEffect(() => {
    if (tapsHistoricos > 0 && tapsHistoricos % 100 === 0 && !superTapDisponible) {
      setSuperTapDisponible(true);
      playSoundEffect('notification', 0.4); // Sonido de activación del Ataque Cargado
      console.log(`⚡ Ataque Cargado activado! Taps históricos: ${tapsHistoricos}`);
    }
  }, [tapsHistoricos, superTapDisponible]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      console.log('🔇 Limpiando BattleSystem al desmontar');
      limpiarTimers();
      // Limpiar música de batalla al desmontar
      if (battleMusicRef.current) {
        console.log('🔇 Limpiando música de batalla al desmontar');
        battleMusicRef.current.pause();
        battleMusicRef.current.currentTime = 0;
        battleMusicRef.current = null;
      }
    };
  }, []);

  // Variables para el render
  const gimnasio = gimnasios[gimnasioActual];
  const pokemonNombre = obtenerPokemonActual(gimnasio, combatienteActual, entrenadorActual, pokemonActual);
  const oponenteNombre = obtenerNombreOponente(gimnasio, combatienteActual, entrenadorActual);
  const tapsObjetivo = calcularTapsObjetivo(combatienteActual, gimnasioActual, pokemonActual);

  // Mensaje de Pokémon derrotado (aparece antes del diálogo del entrenador)
  if (mostrarMensajeDerrota) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[80] overflow-hidden">
        <div className="text-center animate-in fade-in duration-500">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 max-w-md mx-4 border border-red-500/50 shadow-2xl">
            <div className="text-6xl mb-4">💨</div>
            <h2 className="text-3xl font-bold text-red-400 mb-4 drop-shadow-xl">
              ¡{pokemonDerrotadoNombre} fue derrotado!
            </h2>
            <p className="text-lg text-white/80 text-center leading-relaxed">
              {pokemonDerrotadoNombre} ya no puede continuar luchando...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Diálogo de victoria después de derrotar un Pokémon
  if (mostrarDialogoVictoria) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[80] overflow-hidden">
        <div className="text-center animate-in fade-in duration-500">
          <div className="mb-8">
            <img 
              src={trainerData?.sprite} 
              alt={trainerData?.nombre}
              className="w-48 mx-auto rounded-lg border-4 border-white/30 shadow-2xl"
              style={{ 
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.7))',
                aspectRatio: 'auto',
                maxHeight: '192px',
                objectFit: 'contain'
              }}
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-2xl">
            {isLeaderBattle ? `Líder ${trainerData?.nombre}` : trainerData?.nombre}
          </h2>
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-lg mx-4 border border-white/20 shadow-2xl">
            <p className="text-xl text-white text-center leading-relaxed drop-shadow-lg mb-6">
              {mensajeDialogo}
            </p>
            <button
              onClick={tipoDialogo === 'final' ? cerrarDialogoFinal : cerrarDialogoSiguiente}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {tipoDialogo === 'final' ? '¡Obtener Recompensas!' : '¡Siguiente Pokémon!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Diálogo de derrota del entrenador/líder
  if (mostrarDialogoDerrota) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[80] overflow-hidden">
        <div className="text-center animate-in fade-in duration-500">
          <div className="mb-8">
            <img 
              src={trainerData?.sprite} 
              alt={trainerData?.nombre}
              className="w-48 mx-auto rounded-lg border-4 border-red-500/50 shadow-2xl"
              style={{ 
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 10px 20px rgba(220,0,0,0.7))',
                aspectRatio: 'auto',
                maxHeight: '192px',
                objectFit: 'contain'
              }}
            />
          </div>
          <h2 className="text-4xl font-bold text-red-400 mb-4 drop-shadow-2xl">
            {isLeaderBattle ? `Líder ${trainerData?.nombre}` : trainerData?.nombre}
          </h2>
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-lg mx-4 border border-red-500/30 shadow-2xl">
            <p className="text-xl text-white text-center leading-relaxed drop-shadow-lg mb-6">
              {mensajeDialogoDerrota}
            </p>
            <div className="text-center">
              <div className="text-red-400 text-lg mb-4 font-bold">
                ¡Has sido derrotado!
              </div>
              <div className="text-sm text-gray-400">
                Regresando a la liga...
              </div>
            </div>
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
            No has podido contra {pokemonNombre}
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

  // Animación de pokémon derrotado
  if (pokemonFainted) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pokemonFaint {
              0% { 
                transform: scale(1) rotate(0deg); 
                opacity: 1; 
                filter: brightness(1) grayscale(0); 
              }
              30% { 
                transform: scale(1.1) rotate(-5deg); 
                opacity: 0.8; 
                filter: brightness(1.2) grayscale(0.3); 
              }
              60% { 
                transform: scale(0.9) rotate(5deg); 
                opacity: 0.6; 
                filter: brightness(0.8) grayscale(0.6); 
              }
              100% { 
                transform: scale(0.8) rotate(90deg); 
                opacity: 0.3; 
                filter: brightness(0.4) grayscale(1); 
              }
            }
            
            @keyframes defeatExplosion {
              0% { 
                transform: scale(0); 
                opacity: 1; 
              }
              50% { 
                transform: scale(1.5); 
                opacity: 0.8; 
              }
              100% { 
                transform: scale(3); 
                opacity: 0; 
              }
            }
            
            @keyframes victoryText {
              0% { 
                transform: translateY(50px) scale(0.5); 
                opacity: 0; 
              }
              50% { 
                transform: translateY(-10px) scale(1.1); 
                opacity: 1; 
              }
              100% { 
                transform: translateY(0) scale(1); 
                opacity: 1; 
              }
            }
          `
        }} />
        
        <div className="text-center relative">
          {/* Pokémon cayendo */}
          <div className="mb-8 relative">
            <img 
              src={getPokemonIconUrl(pokemonNombre)}
              alt={pokemonNombre}
              className="w-40 mx-auto transition-all duration-2000"
              style={{ 
                imageRendering: 'pixelated',
                animation: 'pokemonFaint 2s ease-out',
                aspectRatio: 'auto',
                maxHeight: '160px',
                objectFit: 'contain'
              }}
            />
            
            {/* Efectos de explosión */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-20 h-20 bg-yellow-400 rounded-full opacity-80"
                style={{ animation: 'defeatExplosion 1s ease-out' }}
              />
            </div>
            
            {/* Partículas de derrota */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-red-400 rounded-full"
                style={{
                  left: `${50 + 25 * Math.cos((i * Math.PI * 2) / 8)}%`,
                  top: `${50 + 25 * Math.sin((i * Math.PI * 2) / 8)}%`,
                  animation: `sparkle 1.5s ease-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          
          {/* Texto de victoria */}
          <div style={{ animation: 'victoryText 1s ease-out 0.5s both' }}>
            <h2 className="text-5xl font-bold text-red-400 mb-4 drop-shadow-2xl">
              ¡{pokemonNombre} se ha debilitado!
            </h2>
            
            <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto border border-red-400/30 shadow-2xl">
              <p className="text-white text-xl mb-2">
                🎉 ¡Victoria!
              </p>
              <p className="text-gray-300 text-lg">
                Has derrotado a {pokemonNombre}
              </p>
            </div>
          </div>
          
          {/* Rayos de victoria */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 bg-gradient-to-t from-yellow-400 to-transparent"
                style={{
                  left: `${20 + i * 12}%`,
                  height: '100%',
                  opacity: 0.6,
                  animation: `ping 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fase de introducción - Entrenador hablando
  if (faseAnimacion === 'intro' && trainerData) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]">
        <div className="text-center animate-in fade-in duration-500">
          <div className="mb-8">
            <img 
              src={trainerData.sprite} 
              alt={trainerData.nombre}
              className="w-48 mx-auto rounded-lg border-4 border-white/30 shadow-2xl"
              style={{ 
                imageRendering: 'pixelated',
                aspectRatio: 'auto',
                maxHeight: '192px',
                objectFit: 'contain'
              }}
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-2xl">
            {isLeaderBattle ? `Líder ${trainerData.nombre}` : trainerData.nombre}
          </h2>
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto border border-white/20 shadow-2xl">
            <p className="text-xl text-white text-center leading-relaxed drop-shadow-lg">
              {getTrainerPhrase(isLeaderBattle)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fase de pokeball
  if (faseAnimacion === 'pokeball') {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes throwBall {
              0% { 
                transform: translate(-300px, 150px) scale(0.3) rotate(0deg); 
                opacity: 1; 
              }
              30% { 
                transform: translate(-100px, -80px) scale(0.7) rotate(180deg); 
                opacity: 1; 
              }
              70% { 
                transform: translate(100px, -40px) scale(1.1) rotate(360deg); 
                opacity: 1; 
              }
              100% { 
                transform: translate(0px, 0px) scale(1.5) rotate(540deg); 
                opacity: 0.8; 
              }
            }
            
            @keyframes trainerPoint {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `
        }} />
        
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Entrenador en la esquina señalando */}
          <div className="absolute left-10 bottom-10 z-10">
            <div style={{ animation: 'trainerPoint 2s ease-in-out infinite' }}>
              <img 
                src={trainerData?.sprite} 
                alt="Entrenador"
                className="w-32 opacity-60 drop-shadow-2xl"
                style={{ 
                  imageRendering: 'pixelated',
                  aspectRatio: 'auto',
                  maxHeight: '128px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div className="absolute -top-8 left-16 text-white text-lg font-bold animate-pulse">
              ¡Ve, {obtenerPokemonActual(gimnasios[gimnasioActual], combatienteActual, entrenadorActual, pokemonActual)}!
            </div>
          </div>
          
          {/* Poké Ball volando */}
          <div 
            className="w-20 h-20 z-20"
            style={{ animation: 'throwBall 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite' }}
          >
            <img 
              src="/pokeball.png" 
              alt="Pokeball"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                  fallback.classList.add('w-20', 'h-20', 'bg-red-500', 'rounded-full', 'border-4', 'border-white', 'items-center', 'justify-center', 'text-2xl');
                  fallback.textContent = '⚫';
                }
              }}
            />
            <div className="hidden text-white"></div>
          </div>
          
          {/* Efectos de partículas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-40"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fase de aparición del pokémon
  if (faseAnimacion === 'pokemon') {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes appearPokemon {
              0% { 
                transform: scale(0) rotate(-180deg); 
                opacity: 0; 
                filter: brightness(0); 
              }
              30% { 
                transform: scale(1.3) rotate(-90deg); 
                opacity: 0.3; 
                filter: brightness(0.5); 
              }
              70% { 
                transform: scale(1.1) rotate(-30deg); 
                opacity: 0.8; 
                filter: brightness(1.2); 
              }
              100% { 
                transform: scale(1) rotate(0deg); 
                opacity: 1; 
                filter: brightness(1); 
              }
            }
            
            @keyframes pokemonGlow {
              0%, 100% { 
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); 
              }
              50% { 
                box-shadow: 0 0 40px rgba(255, 255, 255, 0.6); 
              }
            }
            
            @keyframes sparkle {
              0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
              50% { opacity: 1; transform: scale(1) rotate(180deg); }
            }
          `
        }} />
        <div className="text-center relative">
          <div 
            className="mb-6 relative inline-block rounded-full"
            style={{ 
              animation: 'appearPokemon 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), pokemonGlow 2s ease-in-out infinite' 
            }}
          >
            <img 
              src={getPokemonIconUrl(pokemonNombre)}
              alt={pokemonNombre}
              className="w-56 mx-auto drop-shadow-2xl"
              style={{ 
                imageRendering: 'pixelated',
                aspectRatio: 'auto',
                maxHeight: '224px',
                objectFit: 'contain'
              }}
            />
            
            {/* Efectos de brillo alrededor del Pokémon */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-yellow-300 rounded-full"
                style={{
                  left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                  top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                  animation: `sparkle 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          
          <div className="bg-black/70 backdrop-blur-sm rounded-xl p-6 max-w-sm mx-auto border border-white/30 shadow-2xl">
            <p className="text-white text-2xl font-bold mb-2 animate-pulse">
              ¡{pokemonNombre} apareció!
            </p>
            <p className="text-gray-300 text-lg">
              Un {gimnasios[gimnasioActual].tipo} salvaje
            </p>
          </div>
          
          {/* Ondas de impacto */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 border-4 border-white/20 rounded-full"
                style={{
                  animation: `ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fase de cuenta regresiva
  if (faseAnimacion === 'countdown') {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[60]">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes countdownPulse {
              0% { 
                transform: scale(0.8); 
                opacity: 0.3; 
                filter: brightness(0.5); 
              }
              50% { 
                transform: scale(1.2); 
                opacity: 1; 
                filter: brightness(1.5); 
              }
              100% { 
                transform: scale(1); 
                opacity: 0.8; 
                filter: brightness(1); 
              }
            }
            
            @keyframes battleIntro {
              0% { 
                transform: scale(0.5) rotate(-10deg); 
                opacity: 0; 
              }
              50% { 
                transform: scale(1.3) rotate(5deg); 
                opacity: 0.7; 
              }
              100% { 
                transform: scale(1) rotate(0deg); 
                opacity: 1; 
              }
            }
            
            @keyframes energyWave {
              0% { 
                transform: scale(0); 
                opacity: 1; 
              }
              100% { 
                transform: scale(3); 
                opacity: 0; 
              }
            }
          `
        }} />
        
        <div className="text-white text-center relative">
          {cuentaRegresiva > 0 ? (
            <>
              <div 
                className="text-[12rem] font-bold mb-8 select-none"
                style={{ 
                  animation: 'countdownPulse 1s ease-out',
                  textShadow: '0 0 30px rgba(255, 255, 255, 0.8)',
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {cuentaRegresiva}
              </div>
              
              <p className="text-3xl font-semibold animate-pulse">
                Preparándose para batalla...
              </p>
              
              {/* Ondas de energía */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 border-4 border-blue-400/30 rounded-full"
                    style={{
                      animation: `energyWave 1s ease-out infinite`,
                      animationDelay: `${i * 0.25}s`
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div 
                className="text-[8rem] font-bold mb-6 select-none"
                style={{ 
                  animation: 'battleIntro 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  textShadow: '0 0 40px rgba(255, 215, 0, 1)',
                  background: 'linear-gradient(45deg, #ffd700, #ff4757, #ff6b6b)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                ¡COMBATE!
              </div>
              
              <p className="text-4xl font-bold animate-bounce text-yellow-300">
                ¡La batalla comienza!
              </p>
              
              {/* Explosión de efectos */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                    style={{
                      left: `${50 + 30 * Math.cos((i * Math.PI * 2) / 12)}%`,
                      top: `${50 + 30 * Math.sin((i * Math.PI * 2) / 12)}%`,
                      animation: `sparkle 1s ease-out infinite`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Pantalla principal de combate (faseAnimacion === 'battle')
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center z-[60] text-white">
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
        {/* Header con información del oponente */}
        <div className="flex items-center gap-4 mb-8 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/20">
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
              className="w-32 mx-auto"
              style={{ 
                imageRendering: 'pixelated',
                aspectRatio: 'auto',
                maxHeight: '128px',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>

        {/* Barras de progreso */}
        <div className="mb-6 w-full max-w-md space-y-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex justify-between text-sm text-gray-200 mb-2">
              <span>Progreso: {tapsAcumulados}/{tapsObjetivo}</span>
              <span>Tiempo: {tiempoRestante}s</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3 mb-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300 shadow-lg"
                style={{ width: `${Math.min((tapsAcumulados / tapsObjetivo) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(tiempoRestante / calcularTiempoBase(combatienteActual, gimnasioActual)) * 100}%` }}
              ></div>
            </div>
            
            {/* Barra de progreso del Ataque Cargado */}
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Ataque Cargado</span>
                <span>{tapsHistoricos % 100}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    superTapDisponible 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' 
                      : 'bg-gradient-to-r from-purple-400 to-pink-500'
                  }`}
                  style={{ width: `${superTapDisponible ? 100 : (tapsHistoricos % 100)}%` }}
                ></div>
              </div>
              {superTapDisponible && (
                <div className="text-center text-yellow-300 text-xs font-bold mt-1 animate-pulse">
                  ⚡ ¡ATAQUE CARGADO LISTO! ⚡
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Área de tap */}
        <div className="mb-8 relative flex gap-6 items-center justify-center">
          {/* Botón de tap normal */}
          <div className="relative">
            <button
              onClick={handleTap}
              disabled={!combateEnCurso}
              className={`relative z-10 w-32 h-32 rounded-full text-4xl font-bold transition-all duration-200 border-4 shadow-2xl ${
                combateEnCurso
                  ? ataqueInminente
                    ? 'bg-red-500 hover:bg-red-400 animate-pulse border-red-300 shadow-red-500/50'
                    : 'bg-blue-500 hover:bg-blue-400 border-blue-300 shadow-blue-500/50'
                  : 'bg-gray-500 cursor-not-allowed border-gray-400 shadow-gray-500/30'
              }`}
            >
              {combateEnCurso ? '👊' : '🔄'}
            </button>
            
            {/* Etiqueta del botón normal */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <span className="text-white text-sm font-bold">Tap Normal</span>
            </div>
          </div>
          
          {/* Botón de Ataque Cargado - SOLO aparece cuando está disponible */}
          {superTapDisponible && (
            <div className="relative animate-in fade-in slide-in-from-right-5 duration-500">
              {/* Efectos de brillo para Ataque Cargado - DETRÁS del botón */}
              <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-30 animate-ping pointer-events-none"></div>
              <div className="absolute -inset-2 rounded-full bg-yellow-400 opacity-20 animate-pulse pointer-events-none"></div>
              <div className="absolute -inset-4 rounded-full bg-orange-400 opacity-10 animate-bounce pointer-events-none"></div>
              
              <button
                onClick={handleSuperTap}
                disabled={!combateEnCurso}
                className="relative z-10 w-32 h-32 rounded-full text-4xl font-bold transition-all duration-200 border-4 shadow-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 animate-pulse border-yellow-300 shadow-yellow-500/50 text-black"
              >
                ⚡
              </button>
              
              {/* Etiqueta del botón Ataque Cargado */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <span className="text-yellow-300 text-sm font-bold animate-pulse">
                  Ataque Cargado
                </span>
              </div>
            </div>
          )}
          
          {/* Mensaje de crítico normal */}
          {mostrarCritico && !mostrarSuperTap && (
            <div className="absolute -top-20 -left-32 transform z-20 pointer-events-none">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-3 rounded-lg shadow-2xl border-2 border-yellow-300 animate-bounce">
                <div className="text-lg font-extrabold drop-shadow-md whitespace-nowrap">
                  {mensajeCritico}
                </div>
                <div className="text-sm font-bold text-center">
                  ¡x4 Daño!
                </div>
              </div>
              {/* Efectos de brillo */}
              <div className="absolute inset-0 bg-yellow-300 rounded-lg opacity-50 animate-ping pointer-events-none"></div>
              <div className="absolute -inset-2 bg-yellow-400 rounded-lg opacity-30 animate-pulse pointer-events-none"></div>
            </div>
          )}
          
          {/* Mensaje de Ataque Cargado */}
          {mostrarSuperTap && (
            <div className="absolute -top-24 -left-36 transform z-20 pointer-events-none">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-4 rounded-lg shadow-2xl border-2 border-purple-300 animate-bounce">
                <div className="text-xl font-extrabold drop-shadow-md whitespace-nowrap">
                  ⚡ {mensajeCritico} ⚡
                </div>
                <div className="text-sm font-bold text-center">
                  ¡+20 Taps!
                </div>
              </div>
              {/* Efectos de brillo más intensos */}
              <div className="absolute inset-0 bg-purple-300 rounded-lg opacity-50 animate-ping pointer-events-none"></div>
              <div className="absolute -inset-3 bg-pink-400 rounded-lg opacity-30 animate-pulse pointer-events-none"></div>
              <div className="absolute -inset-5 bg-yellow-400 rounded-lg opacity-20 animate-bounce pointer-events-none"></div>
            </div>
          )}
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
              'text-white'
            }`}>
              {calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'fuerte' ? 'Súper efectivo' :
               calcularEfectividad(tipoSeleccionado, gimnasio.tipo) === 'debil' ? 'No muy efectivo' :
               'Efectividad normal'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleSystem;
