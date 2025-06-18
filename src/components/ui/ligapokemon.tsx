import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playSoundEffect, isAudioReady, forceAudioInitialization, getPendingAudioCount } from '@/lib/soundEffects';

// Función para obtener URL de audio desde soundEffects
const getAudioUrl = (key: string): string | null => {
  const soundEffectUrls: Record<string, string> = {
    pokemongym: 'https://www.dropbox.com/scl/fi/qqo6mosag3s7rwukfnla9/pokemongym.mp3?rlkey=rp0zp5oaddnh0np06qtez9gbx&st=pmao4i07&dl=1',
  };
  return soundEffectUrls[key] || null;
};
import { useUser } from '../../context/UserContext';
import { addPokemonToTeam } from '@/lib/equipoStorage';
import { updateUserPokeballs, updateUserFichas } from '@/lib/userData';
import LoginRequired from './LoginRequired';
import BattleSystem from './BattleSystem';
import { EstadoLiga, CombatienteActual } from './battleTypes';
import { REGION_KANTO, TIPOS_JUGADOR, LEGENDARIOS_FINALES } from '../../data/ligaPokemon';
import { MedallaBadge } from '../ligaPokemon/MedallaBadge';
import { TipoSelector } from '../ligaPokemon/TipoSelector';
import { generateEggForType } from '../../utils/ligaPokemon';
import { getPokemonIconUrl, getPokemonStaticIconUrl } from '../../utils/pokemonSprites';



export default function LigaPokemon() {
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useUser();
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [gimnasioActual, setGimnasioActual] = useState(0);
  const [entrenadorActual, setEntrenadorActual] = useState(0);
  const [pokemonActual, setPokemonActual] = useState(0);
  const [estado, setEstado] = useState<EstadoLiga>('seleccion');
  const [combatienteActual, setCombatienteActual] = useState<CombatienteActual>('entrenador');
  const [medallasObtenidas, setMedallasObtenidas] = useState<number[]>([]);
  const [entrenadoresVencidos, setEntrenadoresVencidos] = useState<{[key: string]: boolean}>({});
  const [legendarioSeleccionado, setLegendarioSeleccionado] = useState('');
  const [regionExpanded, setRegionExpanded] = useState<{ [key: string]: boolean }>({ 'Kanto': false });
  const [mostrarModalVictoria, setMostrarModalVictoria] = useState(false);
  const [datosVictoria, setDatosVictoria] = useState<{tipo: 'entrenador' | 'lider', nombre: string, recompensas: any} | null>(null);
  const [carruselIndex, setCarruselIndex] = useState(0);

  // Estados para la animación de introducción
  const [showIntro, setShowIntro] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLiga, setShowLiga] = useState(false);
  const [showPokeball, setShowPokeball] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const fullIntroTitle = "¡Bienvenido a la Liga Pokémon!";
  
  // Referencia para el audio del gimnasio
  const gymAudioRef = useRef<HTMLAudioElement | null>(null);

  // Limpieza inicial al montar el componente
  useEffect(() => {
    // Limpiar cualquier audio de batalla o victoria previo
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
      if (audio.src.includes('trainerbattle') || 
          audio.src.includes('gymbattle') || 
          audio.src.includes('wintrainer') || 
          audio.src.includes('victorygym') || 
          audio.src.includes('wingym')) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.load();
      }
    });

    // Reproducir música de gimnasio al entrar usando elemento HTML audio nativo
    if (gymAudioRef.current && getAudioUrl('pokemongym')) {
      gymAudioRef.current.src = getAudioUrl('pokemongym')!;
      gymAudioRef.current.volume = 0.1;
      gymAudioRef.current.loop = true;
      gymAudioRef.current.play().catch(console.error);
    }
  }, []);

  // Función para detener la música del gimnasio cuando entra en combate
  const detenerMusicaGimnasio = useCallback(() => {
    if (gymAudioRef.current) {
      gymAudioRef.current.pause();
      gymAudioRef.current.currentTime = 0;
    }
  }, []);

  // Función para restaurar la música del gimnasio cuando sale del combate
  const restaurarMusicaGimnasio = useCallback(() => {
    // Detener cualquier música de victoria que pueda estar sonando
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
      if (audio.src.includes('wintrainer') || audio.src.includes('victorygym') || audio.src.includes('wingym')) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.load();
      }
    });
    
    // Restaurar música del gimnasio
    if (gymAudioRef.current) {
      gymAudioRef.current.currentTime = 0;
      gymAudioRef.current.play().catch(console.error);
    }
  }, []);

  // Cargar progreso al montar el componente y manejar cleanup
  useEffect(() => {
    return () => {
      // Cleanup cuando el componente se desmonta - solo limpiar música de gimnasio
      if (gymAudioRef.current) {
        gymAudioRef.current.pause();
        gymAudioRef.current.currentTime = 0;
        gymAudioRef.current.src = '';
        gymAudioRef.current = null;
      }
    };
  }, []);

  // Animación de introducción
  useEffect(() => {
    if (showIntro) {
      // Secuencia simple y elegante
      setTimeout(() => {
        setShowWelcome(true);
      }, 500);
      
      setTimeout(() => {
        setShowLiga(true);
      }, 1500);
      
      setTimeout(() => {
        setShowPokeball(true);
      }, 2500);
      
      setTimeout(() => {
        setFadeOut(true);
      }, 4000);
      
      setTimeout(() => {
        setShowIntro(false);
      }, 5000);
    }
  }, [showIntro]);

  // Cargar progreso e inicializar tipo por defecto
  useEffect(() => {
    const progreso = localStorage.getItem('ligaPokemonProgreso');
    if (progreso) {
      try {
        const data = JSON.parse(progreso);
        setMedallasObtenidas(data.medallasObtenidas || []);
        setEntrenadoresVencidos(data.entrenadoresVencidos || {});
      } catch (error) {
        console.error('Error cargando progreso:', error);
      }
    }
    
    if (!tipoSeleccionado && TIPOS_JUGADOR.length > 0) {
      setTipoSeleccionado(TIPOS_JUGADOR[0].nombre);
    }
  }, []);

  // Guardar progreso
  const guardarProgreso = (medallas: number[], entrenadoresVencidosData?: {[key: string]: boolean}) => {
    localStorage.setItem('ligaPokemonProgreso', JSON.stringify({
      medallasObtenidas: medallas,
      entrenadoresVencidos: entrenadoresVencidosData || entrenadoresVencidos
    }));
  };

  // Dar recompensas del gimnasio
  const darRecompensas = async (gimnasioIndex: number) => {
    const gimnasio = REGION_KANTO.gimnasios[gimnasioIndex];
    
    try {
      const MAX_EGGS = 8;
      const currentIncubadoras = user?.profile?.incubadoras || [];
      const currentPokeballs = user?.profile?.pokeballs || 0;
      const currentFichas = user?.profile?.fichas || 0;
      
      const newPokeballs = currentPokeballs + gimnasio.recompensas.pokeballs;
      const newFichas = currentFichas + gimnasio.recompensas.fichas;
      
      await updateUserPokeballs(user.uid, user.email || '', newPokeballs);
      await updateUserFichas(user.uid, user.email || '', newFichas);
      
      if (user.profile) {
        user.profile.pokeballs = newPokeballs;
        user.profile.fichas = newFichas;
        if (currentIncubadoras.length < MAX_EGGS) {
          user.profile.incubadoras = [...currentIncubadoras, generateEggForType(gimnasio.tipo)];
        }
      }
      
      console.log(`🎉 Recompensas del Gimnasio ${gimnasio.nombre} entregadas:`, {
        pokeballs: gimnasio.recompensas.pokeballs,
        fichas: gimnasio.recompensas.fichas,
        huevo: `Huevo tipo ${gimnasio.tipo}`
      });
      
    } catch (error) {
      console.error('Error entregando recompensas:', error);
    }
  };

  // Dar recompensas por vencer a un entrenador individual
  const darRecompensasEntrenador = async (gimnasioIndex: number, entrenadorIndex: number) => {
    try {
      const gimnasio = REGION_KANTO.gimnasios[gimnasioIndex];
      const entrenador = gimnasio.entrenadores[entrenadorIndex];
      
      const currentPokeballs = user?.profile?.pokeballs || 0;
      const currentFichas = user?.profile?.fichas || 0;
      
      // Recompensas menores por vencer entrenadores (la mitad que el gimnasio)
      const recompensasPokeballs = Math.ceil(gimnasio.recompensas.pokeballs / 2);
      const recompensasFichas = Math.ceil(gimnasio.recompensas.fichas / 2);
      
      const newPokeballs = currentPokeballs + recompensasPokeballs;
      const newFichas = currentFichas + recompensasFichas;
      
      await updateUserPokeballs(user.uid, user.email || '', newPokeballs);
      await updateUserFichas(user.uid, user.email || '', newFichas);
      
      if (user.profile) {
        user.profile.pokeballs = newPokeballs;
        user.profile.fichas = newFichas;
      }
      
      console.log(`🎉 Recompensas por vencer a ${entrenador.nombre}:`, {
        pokeballs: recompensasPokeballs,
        fichas: recompensasFichas
      });
      
    } catch (error) {
      console.error('Error entregando recompensas del entrenador:', error);
    }
  };

  // Continuar al siguiente gimnasio/Pokémon
  const continuar = async () => {
    playSoundEffect('notification', 0.2);
    
    if (combatienteActual === 'entrenador') {
      const gimnasio = REGION_KANTO.gimnasios[gimnasioActual];
      
      if (pokemonActual < gimnasio.entrenadores[entrenadorActual].pokemon.length - 1) {
        setPokemonActual(prev => prev + 1);
        setEstado('entrenador');
        return;
      } else {
        // Victoria completa contra el entrenador
        const entrenadorKey = `gym${gimnasioActual}_trainer${entrenadorActual}`;
        setEntrenadoresVencidos(prev => ({...prev, [entrenadorKey]: true}));
        
        // Dar recompensas del entrenador
        await darRecompensasEntrenador(gimnasioActual, entrenadorActual);
        
        // Mostrar modal de victoria
        const entrenador = gimnasio.entrenadores[entrenadorActual];
        const recompensasPokeballs = Math.ceil(gimnasio.recompensas.pokeballs / 2);
        const recompensasFichas = Math.ceil(gimnasio.recompensas.fichas / 2);
        
        setDatosVictoria({
          tipo: 'entrenador',
          nombre: entrenador.nombre,
          recompensas: {
            pokeballs: recompensasPokeballs,
            fichas: recompensasFichas
          }
        });
        setMostrarModalVictoria(true);
        
        return;
      }
    } else {
      if (pokemonActual < REGION_KANTO.gimnasios[gimnasioActual].pokemon.length - 1) {
        setPokemonActual(prev => prev + 1);
        setEstado('lider');
        return;
      } else {
        // Victoria contra el líder - marcar líder como vencido también
        const liderKey = `gym${gimnasioActual}_leader`;
        setEntrenadoresVencidos(prev => ({...prev, [liderKey]: true}));
        
        const nuevasMedallas = [...medallasObtenidas, gimnasioActual];
        setMedallasObtenidas(nuevasMedallas);
        guardarProgreso(nuevasMedallas);
        
        await darRecompensas(gimnasioActual);
        
        // Mostrar modal de victoria para líder
        const gimnasio = REGION_KANTO.gimnasios[gimnasioActual];
        setDatosVictoria({
          tipo: 'lider',
          nombre: gimnasio.nombre,
          recompensas: {
            pokeballs: gimnasio.recompensas.pokeballs,
            fichas: gimnasio.recompensas.fichas,
            medalla: gimnasio.medalla.nombre
          }
        });
        setMostrarModalVictoria(true);
        
        if (gimnasioActual === 7) {
          setEstado('final');
        } else {
          setGimnasioActual(prev => prev + 1);
          setEntrenadorActual(0);
          setPokemonActual(0);
          setCombatienteActual('entrenador');
          // No cambiar estado aquí, se cambiará cuando se cierre el modal
        }
      }
    }
  };

  // Volver al gimnasio
  const reintentar = () => {
    playSoundEffect('notification', 0.2);
    setEstado('seleccion');
  };

  // Volver al menú
  const volverAlMenu = () => {
    playSoundEffect('notification', 0.2);
    navigate('/minigames');
  };

  // Seleccionar legendario final
  const seleccionarLegendario = async (legendario: any) => {
    playSoundEffect('notification', 0.2);
    try {
      const pokemonData = {
        name: legendario.nombre,
        species: legendario.nombre,
        gender: 'N' as const,
        item: '',
        ability: 'Air Lock',
        isShiny: true,
        isHO: false,
        teraType: 'Dragon',
        EVs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        IVs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        nature: 'Adamant',
        moves: ['-', '-', '-', '-'],
        level: 50,
        types: ['Dragon', 'Flying'],
        caught: true,
        price: 0
      };

      await addPokemonToTeam(pokemonData);
      setLegendarioSeleccionado(legendario.nombre);
      
      playSoundEffect('catchmusic', 0.5);
      
      setTimeout(() => {
        alert(`🎉 ¡${legendario.nombre} Shiny ha sido agregado a tu equipo!\n\n✨ Has completado la Liga Pokémon como un verdadero Maestro Pokémon!`);
      }, 100);
      
    } catch (error) {
      console.error('Error agregando legendario al equipo:', error);
      alert('Hubo un error al agregar el Pokémon a tu equipo. Por favor, inténtalo de nuevo.');
    }
  };

  // Función para verificar si un entrenador está desbloqueado
  const isEntrenadorDesbloqueado = (gimnasioIndex: number, entrenadorIndex: number) => {
    // El primer entrenador siempre está desbloqueado
    if (entrenadorIndex === 0) return true;
    
    // Para los siguientes entrenadores, verificar que todos los anteriores estén vencidos
    for (let i = 0; i < entrenadorIndex; i++) {
      const entrenadorKey = `gym${gimnasioIndex}_trainer${i}`;
      if (!entrenadoresVencidos[entrenadorKey]) {
        return false;
      }
    }
    return true;
  };

  // Función para obtener el próximo entrenador disponible (desbloqueado y no vencido)
  const getProximoEntrenadorDisponible = (gimnasioIndex: number) => {
    const gimnasio = REGION_KANTO.gimnasios[gimnasioIndex];
    
    // Buscar el primer entrenador no vencido
    for (let i = 0; i < gimnasio.entrenadores.length; i++) {
      const entrenadorKey = `gym${gimnasioIndex}_trainer${i}`;
      const isVencido = entrenadoresVencidos[entrenadorKey];
      const isDesbloqueado = isEntrenadorDesbloqueado(gimnasioIndex, i);
      
      if (!isVencido && isDesbloqueado) {
        return i;
      }
    }
    
    // Si todos los entrenadores están vencidos, devolver -1 (líder disponible)
    return -1;
  };

  // Función para navegar en el carrusel
  const navegarCarrusel = (direccion: 'prev' | 'next') => {
    const gimnasio = REGION_KANTO.gimnasios[gimnasioActual];
    const totalItems = gimnasio.entrenadores.length + 1; // +1 para el líder
    
    if (direccion === 'next') {
      setCarruselIndex(prev => (prev + 1) % totalItems);
    } else {
      setCarruselIndex(prev => (prev - 1 + totalItems) % totalItems);
    }
    playSoundEffect('pop', 0.1);
  };

  // Función para resetear el carrusel al cambiar de gimnasio
  const resetCarrusel = () => {
    const proximoIndex = getProximoEntrenadorDisponible(gimnasioActual);
    setCarruselIndex(proximoIndex === -1 ? REGION_KANTO.gimnasios[gimnasioActual].entrenadores.length : proximoIndex);
  };

  // Efecto para resetear carrusel cuando cambia el gimnasio
  useEffect(() => {
    resetCarrusel();
  }, [gimnasioActual, entrenadoresVencidos]);

  // Efecto para controlar la música del gimnasio según el estado de combate
  useEffect(() => {
    if (estado === 'entrenador' || estado === 'lider' || estado === 'elite' || estado === 'campeon') {
      // Entrar en combate - detener música de gimnasio
      detenerMusicaGimnasio();
    } else if (estado === 'seleccion' || estado === 'victoria' || estado === 'derrota') {
      // Fuera de combate - restaurar música de gimnasio
      restaurarMusicaGimnasio();
    }
  }, [estado, detenerMusicaGimnasio, restaurarMusicaGimnasio]);

  // Función para cerrar el modal de victoria
  const cerrarModalVictoria = () => {
    // Detener audios de victoria específicos al cerrar el modal
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
      const audioSrc = audio.src || audio.currentSrc || '';
      if (audioSrc.includes('wintrainer') || audioSrc.includes('wingym')) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      }
    });
    
    // También buscar en instancias globales de Audio
    if (typeof window !== 'undefined' && (window as any).currentVictoryAudio) {
      const victoryAudio = (window as any).currentVictoryAudio;
      victoryAudio.pause();
      victoryAudio.currentTime = 0;
      victoryAudio.volume = 0;
      (window as any).currentVictoryAudio = null;
    }
    
    setMostrarModalVictoria(false);
    setDatosVictoria(null);
    setEstado('seleccion');
    setPokemonActual(0);
    setCombatienteActual('entrenador');
    // Si quieres también resetear al primer entrenador disponible:
    const proximoEntrenador = getProximoEntrenadorDisponible(gimnasioActual);
    setEntrenadorActual(proximoEntrenador === -1 ? 0 : proximoEntrenador);
    playSoundEffect('notification', 0.2);
  };

  // Callbacks para BattleSystem
  const handleVictoria = async () => {
    // Restaurar música del gimnasio cuando sale del combate
    restaurarMusicaGimnasio();
    // Ejecutar la lógica de avance y recompensas igual que en 'continuar'
    if (combatienteActual === 'entrenador') {
      const gimnasio = REGION_KANTO.gimnasios[gimnasioActual];
      if (pokemonActual < gimnasio.entrenadores[entrenadorActual].pokemon.length - 1) {
        setPokemonActual(prev => prev + 1);
        setEstado('entrenador');
        return;
      } else {
        // Victoria completa contra el entrenador
        const entrenadorKey = `gym${gimnasioActual}_trainer${entrenadorActual}`;
        setEntrenadoresVencidos(prev => ({...prev, [entrenadorKey]: true}));
        await darRecompensasEntrenador(gimnasioActual, entrenadorActual);
        const entrenador = gimnasio.entrenadores[entrenadorActual];
        const recompensasPokeballs = Math.ceil(gimnasio.recompensas.pokeballs / 2);
        const recompensasFichas = Math.ceil(gimnasio.recompensas.fichas / 2);
        setDatosVictoria({
          tipo: 'entrenador',
          nombre: entrenador.nombre,
          recompensas: {
            pokeballs: recompensasPokeballs,
            fichas: recompensasFichas
          }
        });
        setMostrarModalVictoria(true);
        setEstado('seleccion'); // Cambiar a selección para ocultar BattleSystem
        return;
      }
    } else {
      if (pokemonActual < REGION_KANTO.gimnasios[gimnasioActual].pokemon.length - 1) {
        setPokemonActual(prev => prev + 1);
        setEstado('lider');
        return;
      } else {
        // Victoria contra el líder - marcar líder como vencido también
        const liderKey = `gym${gimnasioActual}_leader`;
        setEntrenadoresVencidos(prev => ({...prev, [liderKey]: true}));
        const nuevasMedallas = [...medallasObtenidas, gimnasioActual];
        setMedallasObtenidas(nuevasMedallas);
        guardarProgreso(nuevasMedallas);
        await darRecompensas(gimnasioActual);
        const gimnasio = REGION_KANTO.gimnasios[gimnasioActual];
        setDatosVictoria({
          tipo: 'lider',
          nombre: gimnasio.nombre,
          recompensas: {
            pokeballs: gimnasio.recompensas.pokeballs,
            fichas: gimnasio.recompensas.fichas,
            medalla: gimnasio.medalla.nombre
          }
        });
        setMostrarModalVictoria(true);
        if (gimnasioActual === 7) {
          setEstado('final');
        } else {
          setGimnasioActual(prev => prev + 1);
          setEntrenadorActual(0);
          setPokemonActual(0);
          setCombatienteActual('entrenador');
          setEstado('seleccion'); // Cambiar a selección para ocultar BattleSystem
        }
      }
    }
  };

  const handleDerrota = () => {
    // Restaurar música del gimnasio cuando sale del combate
    restaurarMusicaGimnasio();
    setEstado('derrota');
  };

  // Función para manejar la transición automática al siguiente Pokémon
  const avanzarAlSiguientePokemon = () => {
    if (combatienteActual === 'entrenador') {
      const gimnasio = REGION_KANTO.gimnasios[gimnasioActual];
      
      if (pokemonActual < gimnasio.entrenadores[entrenadorActual].pokemon.length - 1) {
        // No es el último Pokémon del entrenador, continuar automáticamente
        setPokemonActual(prev => prev + 1);
        setEstado('entrenador');
        playSoundEffect('notification', 0.2);
      }
    } else {
      // Para líderes, la lógica es similar
      if (pokemonActual < REGION_KANTO.gimnasios[gimnasioActual].pokemon.length - 1) {
        setPokemonActual(prev => prev + 1);
        setEstado('lider');
        playSoundEffect('notification', 0.2);
      }
    }
  };

  const handleVolverAlGimnasio = async () => {
    if (estado === 'victoria') {
      // Ejecutar la lógica de recompensas/modal tras victoria completa
      if (combatienteActual === 'entrenador') {
        const gimnasio = REGION_KANTO.gimnasios[gimnasioActual];
        if (pokemonActual < gimnasio.entrenadores[entrenadorActual].pokemon.length - 1) {
          setPokemonActual(prev => prev + 1);
          setEstado('entrenador');
          return;
        } else {
          // Victoria completa contra el entrenador
          const entrenadorKey = `gym${gimnasioActual}_trainer${entrenadorActual}`;
          setEntrenadoresVencidos(prev => ({...prev, [entrenadorKey]: true}));
          await darRecompensasEntrenador(gimnasioActual, entrenadorActual);
          const entrenador = gimnasio.entrenadores[entrenadorActual];
          const recompensasPokeballs = Math.ceil(gimnasio.recompensas.pokeballs / 2);
          const recompensasFichas = Math.ceil(gimnasio.recompensas.fichas / 2);
          setDatosVictoria({
            tipo: 'entrenador',
            nombre: entrenador.nombre,
            recompensas: {
              pokeballs: recompensasPokeballs,
              fichas: recompensasFichas
            }
          });
          setMostrarModalVictoria(true);
          return;
        }
      } else {
        if (pokemonActual < REGION_KANTO.gimnasios[gimnasioActual].pokemon.length - 1) {
          setPokemonActual(prev => prev + 1);
          setEstado('lider');
          return;
        } else {
          // Victoria contra el líder - marcar líder como vencido también
          const liderKey = `gym${gimnasioActual}_leader`;
          setEntrenadoresVencidos(prev => ({...prev, [liderKey]: true}));
          const nuevasMedallas = [...medallasObtenidas, gimnasioActual];
          setMedallasObtenidas(nuevasMedallas);
          guardarProgreso(nuevasMedallas);
          await darRecompensas(gimnasioActual);
          const gimnasio = REGION_KANTO.gimnasios[gimnasioActual];
          setDatosVictoria({
            tipo: 'lider',
            nombre: gimnasio.nombre,
            recompensas: {
              pokeballs: gimnasio.recompensas.pokeballs,
              fichas: gimnasio.recompensas.fichas,
              medalla: gimnasio.medalla.nombre
            }
          });
          setMostrarModalVictoria(true);
          if (gimnasioActual === 7) {
            setEstado('final');
          } else {
            setGimnasioActual(prev => prev + 1);
            setEntrenadorActual(0);
            setPokemonActual(0);
            setCombatienteActual('entrenador');
            // No cambiar estado aquí, se cambiará cuando se cierre el modal
          }
        }
      }
    } else {
      // Si no es victoria, pueden ser dos casos:
      // 1. Transición automática al siguiente Pokémon (desde BattleSystem)
      // 2. Volver a la selección por derrota
      if (estado === 'entrenador' || estado === 'lider') {
        // Es una transición automática, avanzar al siguiente Pokémon
        avanzarAlSiguientePokemon();
      } else {
        // Es una vuelta por derrota, ir a selección
        setEstado('seleccion');
      }
    }
  };

  // Renderizado principal
  return (
    <>
      {/* Animación de introducción */}
      {showIntro && (
        <div className={`fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* Bienvenido */}
          <div className={`mb-4 transition-all duration-800 ease-out transform ${
            showWelcome 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-150'
          }`}>
            <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
              ¡Bienvenido
            </h1>
          </div>

          {/* a la Liga Pokémon */}
          <div className={`mb-8 transition-all duration-800 ease-out transform ${
            showLiga 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-150'
          }`}>
            <h2 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
              a la Liga Pokémon!
            </h2>
          </div>

          {/* Pokeball */}
          <div className={`transition-all duration-1000 ease-out transform ${
            showPokeball 
              ? 'opacity-100 translate-y-0 scale-100 rotate-0' 
              : 'opacity-0 translate-y-12 scale-50 rotate-180'
          }`}>
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-white rounded-full blur-xl opacity-50 animate-pulse w-32 h-32"></div>
              <img
                src="/pokeball.png"
                alt="Pokeball"
                className="relative z-10 w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-8 p-4 pb-32 min-h-screen">
        {/* Verificación de login */}
        {!user ? (
          <LoginRequired 
            feature="Liga Pokémon" 
              onLogin={loginWithGoogle}
            />
          ) : (
            <>
              {/* Header con información del usuario */}
              <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 md:p-6 border border-slate-200/60 mb-6">
                {/* Título principal */}
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Liga Pokémon
                  </h1>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs md:text-sm text-gray-600">Entrenador:</p>
                      <p className="font-semibold text-sm md:text-base truncate max-w-[160px] md:max-w-[200px]">{user.email}</p>
                    </div>
                    <img 
                      src={user.photoURL || '/default-avatar.png'} 
                      alt="Avatar" 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-blue-300 flex-shrink-0"
                    />
                  </div>
                </div>

                {/* Región Kanto */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setRegionExpanded(prev => ({ ...prev, 'Kanto': !prev['Kanto'] }))}
                      className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-between"
                    >
                      <span>Kanto</span>
                      <svg 
                        className={`w-5 h-5 transform transition-transform duration-300 ${regionExpanded['Kanto'] ? 'rotate-90' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Vista expandida - Mapa de niveles compacto estilo Candy Crush */}
                  {regionExpanded['Kanto'] && (
                    <div className="mt-4 animate-[slideDown_0.3s_ease-out]">
                      <style dangerouslySetInnerHTML={{
                        __html: `
                          @keyframes slideDown {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                          }
                          @keyframes levelPulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.1); }
                          }
                          @keyframes pathGlow {
                            0%, 100% { opacity: 0.3; }
                            50% { opacity: 0.7; }
                          }
                        `
                      }} />                        {/* Mapa de gimnasios tipo videojuego con identidad Pokémon */}
                        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200 shadow-xl overflow-hidden">
                          {/* Efectos de fondo temáticos Pokémon */}
                          <div className="absolute top-2 left-4 w-8 h-8 bg-red-400 rounded-full opacity-20 animate-bounce flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                          </div>
                          <div className="absolute bottom-3 right-6 w-6 h-6 bg-yellow-400 rounded-full opacity-30 animate-bounce delay-500">
                            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-yellow-600 rounded-full"></div>
                            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-yellow-600 rounded-full"></div>
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-yellow-600 rounded-full"></div>
                          </div>
                          <div className="absolute top-1/2 right-1/4 w-5 h-5 bg-blue-300 rounded-full opacity-25 animate-bounce delay-1000">
                            <div className="absolute inset-1 bg-blue-500 rounded-full"></div>
                          </div>
                          
                          {/* Patrones de circuitos Pokémon en el fondo */}
                          <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-4 left-8 w-16 h-0.5 bg-blue-400 rotate-45"></div>
                            <div className="absolute bottom-6 right-12 w-12 h-0.5 bg-purple-400 -rotate-45"></div>
                            <div className="absolute top-1/3 left-1/4 w-8 h-0.5 bg-indigo-400"></div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-sm text-indigo-800 flex items-center bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-indigo-200">
                              Aventura
                            </h4>
                            <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg border-2 border-yellow-300 flex items-center space-x-1">
                              <span className="animate-pulse">⚡</span>
                              <span>{medallasObtenidas.length}/8</span>
                              <span className="animate-bounce">🏆</span>
                            </div>
                          </div>
                        
                        {/* Camino ordenado 4x2 con líneas limpias */}
                        <div className="relative">
                          {/* Primera fila - Gimnasios 1-4 */}
                          <div className="grid grid-cols-4 gap-4 mb-6">
                            {REGION_KANTO.gimnasios.slice(0, 4).map((gimnasio, gymIndex) => {
                              const isCompleted = medallasObtenidas.includes(gymIndex);
                              const isCurrent = gymIndex === gimnasioActual;
                              const isLocked = gymIndex > gimnasioActual && !isCompleted;
                              
                              return (
                                <div key={gymIndex} className="flex flex-col items-center relative">
                                  {/* Línea horizontal entre gimnasios con estilo Pokémon */}
                                  {gymIndex < 3 && (
                                    <div className={`absolute top-6 left-full w-4 h-1 ${
                                      isCompleted ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-md' : 'bg-gradient-to-r from-gray-300 to-gray-400'
                                    } transition-all duration-500 rounded-full`}></div>
                                  )}
                                  
                                  {/* Línea vertical al final de la primera fila (conecta con gimnasio 5) */}
                                  {gymIndex === 3 && (
                                    <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-6 ${
                                      medallasObtenidas.includes(3) ? 'bg-gradient-to-b from-yellow-400 to-amber-500 shadow-lg' : 'bg-gradient-to-b from-gray-300 to-gray-400'
                                    } transition-all duration-500 rounded-full`}></div>
                                  )}
                                  
                                  {/* Nodo del gimnasio con diseño Pokémon */}
                                  <div className={`relative w-12 h-12 rounded-full border-3 flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-lg z-10 ${
                                    isCompleted
                                      ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 border-yellow-200 scale-110 shadow-yellow-400/50'
                                      : isCurrent
                                      ? 'bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 border-cyan-200 animate-[levelPulse_2s_infinite] shadow-blue-400/50'
                                      : isLocked
                                      ? 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-300 opacity-60'
                                      : 'bg-gradient-to-br from-white to-gray-100 border-blue-300 hover:scale-105 shadow-blue-200/50'
                                  }`}>
                                    
                                    {/* Contenido del nodo */}
                                    <div className="relative w-full h-full flex items-center justify-center">
                                      <img 
                                        src={gimnasio.medalla.sprite}
                                        alt={gimnasio.medalla.nombre}
                                        className={`w-7 h-7 filter drop-shadow-lg transition-all duration-300 ${
                                          isCompleted ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' : 'grayscale opacity-70'
                                        }`}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                          if (fallback) fallback.style.display = 'flex';
                                        }}
                                      />
                                      <span className="hidden text-xs">
                                        {gimnasio.medalla.emoji}
                                      </span>
                                    </div>
                                    
                                    {/* Efectos visuales */}
                                    {isCurrent && (
                                      <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-25"></div>
                                    )}
                                    {isCompleted && (
                                      <>
                                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs">✓</span>
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-yellow-400 animate-pulse opacity-20"></div>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Etiqueta del gimnasio */}
                                  <div className="mt-1 text-center">
                                    <span className={`text-xs font-medium block ${
                                      isCompleted ? 'text-yellow-700' : isCurrent ? 'text-blue-700' : 'text-gray-600'
                                    }`}>
                                      {gimnasio.nombre}
                                    </span>
                                    
                                    {/* Mini progreso */}
                                    {isCurrent && (
                                      <div className="flex justify-center space-x-1 mt-1">
                                        {[0, 1].map(trainIndex => (
                                          <div key={trainIndex} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            combatienteActual === 'entrenador' && entrenadorActual > trainIndex
                                              ? 'bg-green-400 shadow-sm'
                                              : combatienteActual === 'entrenador' && entrenadorActual === trainIndex
                                              ? 'bg-blue-400 animate-pulse shadow-md'
                                              : combatienteActual === 'lider'
                                              ? 'bg-green-400 shadow-sm'
                                              : 'bg-gray-300'
                                          }`}></div>
                                        ))}
                                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                          combatienteActual === 'lider' ? 'bg-blue-400 animate-pulse shadow-md' : 'bg-gray-300'
                                        }`}></div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Segunda fila - Gimnasios 5-8 con ruta limpia */}
                          <div className="grid grid-cols-4 gap-4">
                            {REGION_KANTO.gimnasios.slice(4, 8).map((gimnasio, localIndex) => {
                              const gymIndex = localIndex + 4;
                              const isCompleted = medallasObtenidas.includes(gymIndex);
                              const isCurrent = gymIndex === gimnasioActual;
                              const isLocked = gymIndex > gimnasioActual && !isCompleted;
                              
                              return (
                                <div key={gymIndex} className="flex flex-col items-center relative">
                                  {/* Línea horizontal simple de izquierda a derecha */}
                                  {localIndex < 3 && (
                                    <div className={`absolute top-6 left-full w-4 h-1 ${
                                      medallasObtenidas.includes(gymIndex) ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-md' : 'bg-gradient-to-r from-gray-300 to-gray-400'
                                    } transition-all duration-500 rounded-full`}></div>
                                  )}
                                  
                                  {/* Línea vertical desde Erika hasta Koga (solo en Koga) */}
                                  {localIndex === 0 && (
                                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 w-1 h-6 ${
                                      medallasObtenidas.includes(3) ? 'bg-gradient-to-b from-yellow-400 to-amber-500 shadow-lg' : 'bg-gradient-to-b from-gray-300 to-gray-400'
                                    } transition-all duration-500 rounded-full`}></div>
                                  )}
                                  
                                  {/* Nodo del gimnasio */}
                                  <div className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md z-10 ${
                                    isCompleted
                                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 scale-105'
                                      : isCurrent
                                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 animate-[levelPulse_2s_infinite]'
                                      : isLocked
                                      ? 'bg-gray-300 border-gray-400 opacity-60'
                                      : 'bg-white border-orange-300 hover:scale-105'
                                  }`}>
                                    
                                    {/* Contenido del nodo */}
                                    <div className="relative w-full h-full flex items-center justify-center">
                                      <img 
                                        src={gimnasio.medalla.sprite}
                                        alt={gimnasio.medalla.nombre}
                                        className={`w-6 h-6 filter drop-shadow-md transition-all duration-300 ${
                                          isCompleted ? '' : 'grayscale opacity-70'
                                        }`}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                          if (fallback) fallback.style.display = 'flex';
                                        }}
                                      />
                                      <span className="hidden text-xs">
                                        {gimnasio.medalla.emoji}
                                      </span>
                                    </div>
                                    
                                    {/* Efectos visuales */}
                                    {isCurrent && (
                                      <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-25"></div>
                                    )}
                                    {isCompleted && (
                                      <>
                                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs">✓</span>
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-yellow-400 animate-pulse opacity-20"></div>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Etiqueta del gimnasio */}
                                  <div className="mt-1 text-center">
                                    <span className={`text-xs font-medium block ${
                                      isCompleted ? 'text-yellow-700' : isCurrent ? 'text-blue-700' : 'text-gray-600'
                                    }`}>
                                      {gimnasio.nombre}
                                    </span>
                                    
                                    {/* Mini progreso - Segunda fila */}
                                    {isCurrent && (
                                      <div className="flex justify-center space-x-1 mt-1">
                                        {[0, 1].map(trainIndex => (
                                          <div key={trainIndex} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            combatienteActual === 'entrenador' && entrenadorActual > trainIndex
                                              ? 'bg-green-400 shadow-sm'
                                              : combatienteActual === 'entrenador' && entrenadorActual === trainIndex
                                              ? 'bg-blue-400 animate-pulse shadow-md'
                                              : combatienteActual === 'lider'
                                              ? 'bg-green-400 shadow-sm'
                                              : 'bg-gray-300'
                                          }`}></div>
                                        ))}
                                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                          combatienteActual === 'lider' ? 'bg-blue-400 animate-pulse shadow-md' : 'bg-gray-300'
                                        }`}></div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Elite Four - Diseño mejorado con identidad Pokémon */}
                      <div className="mt-3">
                        <div className={`bg-gradient-to-r from-purple-50 via-indigo-50 to-violet-50 rounded-xl p-3 border-2 transition-all duration-300 ${
                          medallasObtenidas.length >= 8 ? 'border-purple-300 shadow-lg shadow-purple-200/50' : 'border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-sm text-purple-800 flex items-center bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full border border-purple-200">
                              Alto Mando
                            </h5>
                            {medallasObtenidas.length < 8 && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">🔒</span>
                            )}
                          </div>
                          
                          <div className="flex justify-between">
                            {REGION_KANTO.eliteFour.map((elite, index) => (
                              <div key={index} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                                  medallasObtenidas.length >= 8
                                    ? combatienteActual === 'elite' && entrenadorActual === index
                                      ? 'bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 border-cyan-200 text-white animate-pulse shadow-blue-400/50'
                                      : 'bg-gradient-to-br from-purple-400 via-violet-400 to-purple-600 border-purple-200 text-white shadow-purple-400/50'
                                    : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-300 text-gray-500'
                                }`}>
                                  E{index + 1}
                                  
                                  {/* Efecto de brillo para el activo */}
                                  {medallasObtenidas.length >= 8 && combatienteActual === 'elite' && entrenadorActual === index && (
                                    <>
                                      <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30"></div>
                                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse opacity-20"></div>
                                    </>
                                  )}
                                </div>
                                <span className={`text-xs mt-1 text-center font-medium ${
                                  medallasObtenidas.length >= 8 ? 'text-purple-700' : 'text-gray-500'
                                }`}>{elite.nombre}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Campeón - Diseño épico */}
                      <div className="mt-3">
                        <div className={`bg-gradient-to-r from-gold-50 via-yellow-50 to-amber-50 rounded-xl p-3 border-2 transition-all duration-300 ${
                          medallasObtenidas.length >= 8 ? 'border-amber-300 shadow-lg shadow-amber-200/50' : 'border-gray-200 opacity-60'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`relative w-12 h-12 rounded-full border-3 flex items-center justify-center text-lg font-bold transition-all shadow-lg ${
                                medallasObtenidas.length >= 8
                                  ? combatienteActual === 'campeon'
                                    ? 'bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 border-cyan-200 text-white animate-pulse shadow-blue-400/50'
                                    : 'bg-gradient-to-br from-amber-300 via-yellow-400 to-gold-500 border-yellow-200 text-white shadow-amber-400/50'
                                  : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-300 text-gray-500'
                              }`}>
                                👑
                                
                                {/* Efecto de brillo para el campeón activo */}
                                {medallasObtenidas.length >= 8 && combatienteActual === 'campeon' && (
                                  <>
                                    <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30"></div>
                                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse opacity-20"></div>
                                  </>
                                )}
                                
                                {/* Efecto dorado cuando está disponible pero no activo */}
                                {medallasObtenidas.length >= 8 && combatienteActual !== 'campeon' && (
                                  <>
                                    <div className="absolute inset-0 rounded-full bg-yellow-300 animate-pulse opacity-25"></div>
                                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-200 to-amber-200 animate-pulse opacity-20"></div>
                                  </>
                                )}
                              </div>
                              <div>
                                <h6 className={`font-bold text-sm ${
                                  medallasObtenidas.length >= 8 ? 'text-amber-800' : 'text-gray-700'
                                }`}>{REGION_KANTO.campeon.nombre}</h6>
                                <p className={`text-xs flex items-center space-x-1 ${
                                  medallasObtenidas.length >= 8 ? 'text-amber-600' : 'text-gray-500'
                                }`}>
                                  <span>🎁</span>
                                  <span>{REGION_KANTO.campeon.recompensas.legendario}</span>
                                  <span className="text-yellow-500">✨</span>
                                </p>
                              </div>
                            </div>
                            {medallasObtenidas.length < 8 && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">🔒</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selector de tipos */}
              {estado === 'seleccion' && (
                <div className="mb-6">
                  <TipoSelector 
                    tipoSeleccionado={tipoSeleccionado}
                    setTipoSeleccionado={setTipoSeleccionado}
                  />
                </div>
              )}

              {/* Información del gimnasio actual */}
              {estado === 'seleccion' && (
                <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-slate-200/60 mb-6">
                  <div className={`bg-gradient-to-br ${REGION_KANTO.gimnasios[gimnasioActual].color} rounded-xl p-4 text-white`}>
                    {/* Header compacto con medalla */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold">{REGION_KANTO.gimnasios[gimnasioActual].nombre}</h2>
                          <p className="text-sm md:text-base opacity-90">Gimnasio de tipo {REGION_KANTO.gimnasios[gimnasioActual].tipo}</p>
                        </div>
                        {/* Medalla del gimnasio */}
                        <div className="flex flex-col items-center">
                          <img 
                            src={REGION_KANTO.gimnasios[gimnasioActual].medalla.sprite}
                            alt={REGION_KANTO.gimnasios[gimnasioActual].medalla.nombre}
                            className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg"
                            onError={(e) => {
                              console.log('Error cargando medalla:', REGION_KANTO.gimnasios[gimnasioActual].medalla.sprite);
                              // Si el sprite de la medalla falla, mostramos un placeholder de medalla
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = 'flex';
                                fallback.classList.add('w-10', 'h-10', 'md:w-12', 'md:h-12', 'text-lg', 'items-center', 'justify-center', 'bg-gradient-to-br', 'from-yellow-400', 'to-amber-500', 'rounded-full', 'border-2', 'border-white/30');
                                fallback.textContent = '🏅'; // Medalla genérica como fallback
                              }
                            }}
                          />
                          <div className="hidden"></div>
                          <span className="text-xs mt-1 opacity-80 hidden md:block">{REGION_KANTO.gimnasios[gimnasioActual].medalla.nombre}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs opacity-80">Líder</div>
                        <div className="text-lg font-bold">{REGION_KANTO.gimnasios[gimnasioActual].nombre}</div>
                      </div>
                    </div>

                    {/* Carrusel de Entrenadores y Líder */}
                    <div className="mb-3">
                      {(() => {
                        const totalEntrenadores = REGION_KANTO.gimnasios[gimnasioActual].entrenadores.length;
                        const entrenadoresVencidosCount = REGION_KANTO.gimnasios[gimnasioActual].entrenadores.filter((_, index) => {
                          const entrenadorKey = `gym${gimnasioActual}_trainer${index}`;
                          return entrenadoresVencidos[entrenadorKey];
                        }).length;
                        
                        // Crear array con entrenadores + líder para el carrusel
                        const entrenadores = REGION_KANTO.gimnasios[gimnasioActual].entrenadores;
                        const allCombatants = [...entrenadores, { 
                          nombre: REGION_KANTO.gimnasios[gimnasioActual].nombre, 
                          sprite: REGION_KANTO.gimnasios[gimnasioActual].sprite,
                          pokemon: REGION_KANTO.gimnasios[gimnasioActual].pokemon,
                          isLeader: true 
                        }];
                        
                        return (
                          <div>
                            {/* Controles del carrusel */}
                            <div className="flex items-center justify-between mb-2">
                              <button 
                                onClick={() => setCarruselIndex(Math.max(0, carruselIndex - 1))}
                                disabled={carruselIndex === 0}
                                className={`p-2 rounded-full transition-all ${
                                  carruselIndex === 0 
                                    ? 'bg-gray-400/30 text-gray-600 cursor-not-allowed' 
                                    : 'bg-white/20 hover:bg-white/30 text-white hover:scale-110'
                                }`}
                              >
                                ←
                              </button>
                              
                              <div className="flex items-center gap-2">
                                {allCombatants.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCarruselIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                      index === carruselIndex 
                                        ? 'bg-blue-500 scale-125' 
                                        : 'bg-white/30 hover:bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                              
                              <button 
                                onClick={() => setCarruselIndex(Math.min(allCombatants.length - 1, carruselIndex + 1))}
                                disabled={carruselIndex === allCombatants.length - 1}
                                className={`p-2 rounded-full transition-all ${
                                  carruselIndex === allCombatants.length - 1
                                    ? 'bg-gray-400/30 text-gray-600 cursor-not-allowed' 
                                    : 'bg-white/20 hover:bg-white/30 text-white hover:scale-110'
                                }`}
                              >
                                →
                              </button>
                            </div>
                            
                            {/* Carrusel */}
                            <div className="relative rounded-lg">
                              {(() => {
                                const currentCombatant = allCombatants[carruselIndex];
                                const isLeader = 'isLeader' in currentCombatant && currentCombatant.isLeader;
                                
                                if (isLeader) {
                                  // Renderizar líder
                                  const liderKey = `gym${gimnasioActual}_leader`;
                                  const isLiderVencido = entrenadoresVencidos[liderKey];
                                  const todosEntrenadoresVencidos = REGION_KANTO.gimnasios[gimnasioActual].entrenadores.every((_, index) => {
                                    const entrenadorKey = `gym${gimnasioActual}_trainer${index}`;
                                    return entrenadoresVencidos[entrenadorKey];
                                  });
                                  const isLiderBloqueado = !todosEntrenadoresVencidos && !isLiderVencido;
                                  
                                  // Determinar estilos visuales
                                  let containerBg = 'bg-white/15';
                                  let headerColor = 'text-amber-300';
                                  let imageFilter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.4)) drop-shadow(0 0 16px rgba(255,255,255,0.3))';
                                  let imageOpacity = 1;
                                  let textColor = 'text-white';
                                  let subtextColor = 'text-gray-200';
                                  let statusText = '';
                                  let statusIcon = null;
                                  
                                  if (isLiderVencido) {
                                    containerBg = 'bg-white/10';
                                    imageFilter = 'grayscale(100%) drop-shadow(0 6px 12px rgba(0,0,0,0.4)) drop-shadow(0 0 16px rgba(255,255,255,0.1))';
                                    imageOpacity = 0.6;
                                    textColor = 'text-gray-400';
                                    subtextColor = 'text-gray-500';
                                    statusText = ' (Vencido)';
                                    statusIcon = (
                                      <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded-full">
                                        👑
                                      </div>
                                    );
                                  } else if (isLiderBloqueado) {
                                    containerBg = 'bg-red-900/20 border border-red-500/30';
                                    headerColor = 'text-red-300';
                                    imageFilter = 'grayscale(100%) blur(1px) drop-shadow(0 6px 12px rgba(0,0,0,0.4))';
                                    imageOpacity = 0.4;
                                    textColor = 'text-red-300';
                                    subtextColor = 'text-red-400';
                                    statusText = ' (Bloqueado)';
                                    statusIcon = (
                                      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                                        🔒
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <div className="w-full px-1 animate-in fade-in duration-300">
                                      <div className={`rounded-lg p-4 ${containerBg}`}>
                                        <div className="text-center mb-3">
                                          <h4 className={`text-lg font-bold mb-1 ${headerColor}`}>Líder del Gimnasio:</h4>
                                        </div>
                                        <div className="flex flex-col items-center space-y-3">
                                          <div className="relative">
                                            <img 
                                              src={currentCombatant.sprite} 
                                              alt={currentCombatant.nombre}
                                              className="w-24 h-24 md:w-28 md:h-28 rounded-lg"
                                              style={{ 
                                                filter: imageFilter,
                                                imageRendering: 'pixelated',
                                                opacity: imageOpacity
                                              }}
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (fallback) {
                                                  fallback.style.display = 'flex';
                                                  fallback.classList.add('w-24', 'h-24', 'md:w-28', 'md:h-28', 'rounded-lg', 'bg-white/20', 'items-center', 'justify-center', 'text-3xl');
                                                  fallback.style.filter = imageFilter;
                                                  fallback.style.opacity = imageOpacity.toString();
                                                  fallback.textContent = '👑';
                                                }
                                              }}
                                            />
                                            <div className="hidden"></div>
                                            {statusIcon}
                                          </div>
                                          <div className="text-center">
                                            <p className={`font-bold text-lg ${textColor}`}>
                                              {currentCombatant.nombre}{statusText}
                                            </p>
                                            <p className={`text-sm opacity-90 ${subtextColor}`}>
                                              Especialista en tipo {REGION_KANTO.gimnasios[gimnasioActual].tipo}
                                            </p>
                                          </div>
                                          {/* Pokémon del líder */}
                                          <div className="grid grid-cols-2 gap-2 w-full">
                                            {currentCombatant.pokemon.map((pokemon, pokemonIndex) => (
                                              <div key={pokemonIndex} className={`flex flex-col items-center rounded-lg px-2 py-2 ${
                                                isLiderVencido ? 'bg-white/5' : 
                                                isLiderBloqueado ? 'bg-red-900/10' : 
                                                'bg-white/10'
                                              }`}>
                                                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 mb-1">
                                                  <img 
                                                    src={getPokemonIconUrl(pokemon)}
                                                    alt={pokemon}
                                                    className="max-w-full max-h-full object-contain"
                                                    style={{ 
                                                      imageRendering: 'pixelated',
                                                      filter: (isLiderVencido || isLiderBloqueado) ? 'grayscale(100%)' : 'none',
                                                      opacity: (isLiderVencido || isLiderBloqueado) ? 0.6 : 1
                                                    }}
                                                    onError={(e) => {
                                                      const currentTarget = e.currentTarget as HTMLImageElement;
                                                      if (currentTarget.src.includes('animated')) {
                                                        currentTarget.src = getPokemonStaticIconUrl(pokemon);
                                                      } else {
                                                        currentTarget.style.display = 'none';
                                                      }
                                                    }}
                                                  />
                                                </div>
                                                <span className={`text-xs font-medium text-center leading-tight ${
                                                  isLiderVencido ? 'text-gray-400' : 
                                                  isLiderBloqueado ? 'text-red-400' : 
                                                  'text-white'
                                                }`}>{pokemon}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  // Renderizar entrenador
                                  const index = carruselIndex;
                                  const entrenadorKey = `gym${gimnasioActual}_trainer${index}`;
                                  const isVencido = entrenadoresVencidos[entrenadorKey];
                                  const isDesbloqueado = isEntrenadorDesbloqueado(gimnasioActual, index);
                                  
                                  // Determinar el estilo visual
                                  let containerBg = 'bg-white/20';
                                  let imageFilter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 12px rgba(255,255,255,0.2))';
                                  let imageOpacity = 1;
                                  let textColor = 'text-white';
                                  let statusText = '';
                                  let statusIcon = null;
                                  
                                  if (isVencido) {
                                    containerBg = 'bg-white/10';
                                    imageFilter = 'grayscale(100%) drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 12px rgba(255,255,255,0.1))';
                                    imageOpacity = 0.6;
                                    textColor = 'text-gray-400';
                                    statusText = '(Vencido)';
                                    statusIcon = (
                                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                                        ✓
                                      </div>
                                    );
                                  } else if (!isDesbloqueado) {
                                    containerBg = 'bg-red-900/20 border border-red-500/30';
                                    imageFilter = 'grayscale(100%) blur(1px) drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
                                    imageOpacity = 0.4;
                                    textColor = 'text-red-300';
                                    statusText = '(Bloqueado)';
                                    statusIcon = (
                                      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                                        🔒
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <div className="w-full px-1 animate-in fade-in duration-300">
                                      <div className={`rounded-lg p-4 ${containerBg}`}>
                                        <div className="flex flex-col items-center space-y-3">
                                          <div className="relative flex-shrink-0">
                                            <img 
                                              src={currentCombatant.sprite} 
                                              alt={currentCombatant.nombre}
                                              className="w-20 h-20 md:w-24 md:h-24 rounded-lg"
                                              style={{ 
                                                filter: imageFilter,
                                                imageRendering: 'pixelated',
                                                opacity: imageOpacity
                                              }}
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (fallback) {
                                                  fallback.style.display = 'flex';
                                                  fallback.classList.add('w-20', 'h-20', 'md:w-24', 'md:h-24', 'rounded-lg', 'bg-white/20', 'items-center', 'justify-center', 'text-2xl', 'flex-shrink-0');
                                                  fallback.style.filter = imageFilter;
                                                  fallback.style.opacity = imageOpacity.toString();
                                                  fallback.textContent = '👤';
                                                }
                                              }}
                                            />
                                            <div className="hidden"></div>
                                            {statusIcon}
                                          </div>
                                          <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                isVencido ? 'bg-green-500 text-white' : 
                                                !isDesbloqueado ? 'bg-red-500 text-white' : 
                                                'bg-blue-500 text-white'
                                              }`}>
                                                {index + 1}
                                              </span>
                                              <p className={`font-semibold text-sm md:text-base ${textColor}`}>
                                                {currentCombatant.nombre} {statusText}
                                              </p>
                                            </div>
                                          </div>
                                          {/* Pokémon del entrenador */}
                                          <div className="grid grid-cols-2 gap-2 w-full">
                                            {currentCombatant.pokemon.map((pokemon, pokemonIndex) => (
                                              <div key={pokemonIndex} className={`flex flex-col items-center rounded-lg px-2 py-2 ${isVencido ? 'bg-white/5' : !isDesbloqueado ? 'bg-red-900/10' : 'bg-white/10'}`}>
                                                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 mb-1">
                                                  <img 
                                                    src={getPokemonIconUrl(pokemon)}
                                                    alt={pokemon}
                                                    className="max-w-full max-h-full object-contain"
                                                    style={{ 
                                                      imageRendering: 'pixelated',
                                                      filter: (isVencido || !isDesbloqueado) ? 'grayscale(100%)' : 'none',
                                                      opacity: (isVencido || !isDesbloqueado) ? 0.6 : 1
                                                    }}
                                                    onError={(e) => {
                                                      const currentTarget = e.currentTarget as HTMLImageElement;
                                                      if (currentTarget.src.includes('animated')) {
                                                        currentTarget.src = getPokemonStaticIconUrl(pokemon);
                                                      } else {
                                                        currentTarget.style.display = 'none';
                                                      }
                                                    }}
                                                  />
                                                </div>
                                                <span className={`text-xs font-medium text-center leading-tight ${isVencido || !isDesbloqueado ? 'text-gray-400' : 'text-white'}`}>{pokemon}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Botones de acción para el combatiente actual del carrusel */}
                    <div className="mt-3">
                      {(() => {
                        const entrenadores = REGION_KANTO.gimnasios[gimnasioActual].entrenadores;
                        const allCombatants = [...entrenadores, { 
                          nombre: REGION_KANTO.gimnasios[gimnasioActual].nombre, 
                          sprite: REGION_KANTO.gimnasios[gimnasioActual].sprite,
                          pokemon: REGION_KANTO.gimnasios[gimnasioActual].pokemon,
                          isLeader: true 
                        }];
                        
                        const currentCombatant = allCombatants[carruselIndex];
                        const isLeader = 'isLeader' in currentCombatant && currentCombatant.isLeader;
                        
                        if (isLeader) {
                          // Botón para el líder
                          const liderKey = `gym${gimnasioActual}_leader`;
                          const isLiderVencido = entrenadoresVencidos[liderKey];
                          const todosEntrenadoresVencidos = entrenadores.every((_, index) => {
                            const entrenadorKey = `gym${gimnasioActual}_trainer${index}`;
                            return entrenadoresVencidos[entrenadorKey];
                          });
                          
                          return (
                            <button
                              onClick={() => {
                                if (!tipoSeleccionado) {
                                  playSoundEffect('error', 0.2);
                                  alert('¡Selecciona un tipo primero!');
                                  return;
                                }
                                if (!todosEntrenadoresVencidos) {
                                  playSoundEffect('error', 0.2);
                                  alert('¡Debes vencer a todos los entrenadores antes de enfrentar al líder!');
                                  return;
                                }
                                if (isLiderVencido) {
                                  playSoundEffect('error', 0.2);
                                  alert('Ya has vencido a este líder!');
                                  return;
                                }
                                playSoundEffect('notification', 0.2);
                                setPokemonActual(0);
                                // Cambiar directamente al estado del líder para que BattleSystem se haga cargo
                                setCombatienteActual('lider');
                                setEstado('lider');
                              }}
                              disabled={!tipoSeleccionado || !todosEntrenadoresVencidos || isLiderVencido}
                              className={`battle-button no-zoom-area w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                                isLiderVencido
                                  ? 'bg-yellow-600 text-yellow-200 cursor-not-allowed opacity-50'
                                  : !todosEntrenadoresVencidos
                                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                                  : tipoSeleccionado
                                  ? 'bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl'
                                  : 'bg-gray-400 cursor-not-allowed opacity-50 text-white'
                              }`}
                              style={{ touchAction: 'manipulation' }}
                            >
                              {isLiderVencido ? `👑 ${currentCombatant.nombre} (Vencido)` :
                               !todosEntrenadoresVencidos ? '🔒 Vence a todos los entrenadores primero' :
                               !tipoSeleccionado ? '⚠️ Selecciona un tipo' : 
                               `👑 ¡Enfrentar al Líder ${currentCombatant.nombre}!`}
                            </button>
                          );
                        } else {
                          // Botón para entrenador
                          const index = carruselIndex;
                          const entrenadorKey = `gym${gimnasioActual}_trainer${index}`;
                          const isVencido = entrenadoresVencidos[entrenadorKey];
                          const isDesbloqueado = isEntrenadorDesbloqueado(gimnasioActual, index);
                          
                          // Determinar el estado del botón
                          let buttonState = '';
                          let buttonText = '';
                          let canClick = false;
                          
                          if (isVencido) {
                            buttonState = 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50';
                            buttonText = `✓ ${index + 1}. ${currentCombatant.nombre} (Vencido)`;
                            canClick = false;
                          } else if (!isDesbloqueado) {
                            buttonState = 'bg-red-500 text-red-200 cursor-not-allowed opacity-50';
                            buttonText = `🔒 ${index + 1}. ${currentCombatant.nombre} (Bloqueado)`;
                            canClick = false;
                          } else if (!tipoSeleccionado) {
                            buttonState = 'bg-gray-400 cursor-not-allowed opacity-50 text-white';
                            buttonText = '⚠️ Selecciona un tipo';
                            canClick = false;
                          } else {
                            buttonState = 'bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl';
                            buttonText = `⚔️ ${index + 1}. Enfrentar a ${currentCombatant.nombre}`;
                            canClick = true;
                          }
                          
                          return (
                            <button
                              onClick={() => {
                                if (!canClick) {
                                  playSoundEffect('error', 0.2);
                                  if (isVencido) {
                                    alert('Ya has vencido a este entrenador!');
                                  } else if (!isDesbloqueado) {
                                    const entrenadorAnteriorIndex = index - 1;
                                    const entrenadorAnteriorNombre = entrenadores[entrenadorAnteriorIndex]?.nombre || 'entrenador anterior';
                                    alert(`¡Debes vencer a ${entrenadorAnteriorIndex + 1}. ${entrenadorAnteriorNombre} primero!`);
                                  } else if (!tipoSeleccionado) {
                                    alert('¡Selecciona un tipo primero!');
                                  }
                                  return;
                                }
                                playSoundEffect('notification', 0.2);
                                setEntrenadorActual(index);
                                setPokemonActual(0);
                                // Cambiar directamente al estado del entrenador para que BattleSystem se haga cargo
                                setCombatienteActual('entrenador');
                                setEstado('entrenador');
                              }}
                              disabled={!canClick}
                              className={`battle-button no-zoom-area w-full py-2 rounded-lg font-semibold transition-all duration-300 ${buttonState}`}
                              style={{ touchAction: 'manipulation' }}
                            >
                              {buttonText}
                            </button>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Integración con BattleSystem */}
              {(estado === 'entrenador' || estado === 'lider' || estado === 'elite' || estado === 'campeon' || estado === 'derrota') && (
                <BattleSystem
                  gimnasioActual={gimnasioActual}
                  entrenadorActual={entrenadorActual}
                  pokemonActual={pokemonActual}
                  combatienteActual={combatienteActual}
                  tipoSeleccionado={tipoSeleccionado}
                  gimnasios={REGION_KANTO.gimnasios}
                  eliteFour={REGION_KANTO.eliteFour}
                  campeon={REGION_KANTO.campeon}
                  onVictoria={handleVictoria}
                  onDerrota={handleDerrota}
                  onVolverAlGimnasio={handleVolverAlGimnasio}
                  estado={estado}
                />
              )}

              {/* Pantalla final de legendarios */}
              {estado === 'final' && !legendarioSeleccionado && (
                <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-slate-200/60 text-center mb-8">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-4">
                    ¡LIGA POKÉMON COMPLETADA!
                  </h2>
                  <p className="text-lg mb-6">¡Felicitaciones! Elige tu recompensa legendaria:</p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {LEGENDARIOS_FINALES.map((legendario) => (
                      <button
                        key={legendario.nombre}
                        onClick={() => seleccionarLegendario(legendario)}
                        className={`bg-gradient-to-br ${legendario.color} text-white p-4 rounded-xl hover:scale-105 transition-all shadow-lg`}
                      >
                        <div className="text-4xl mb-2">{legendario.emoji}</div>
                        <div className="font-bold text-lg">{legendario.nombre}</div>
                        <div className="text-sm opacity-90">{legendario.descripcion}</div>
                        <div className="mt-2 text-xs bg-white/20 rounded-full px-2 py-1">
                          ✨ Shiny
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pantalla final con legendario seleccionado */}
              {estado === 'final' && legendarioSeleccionado && (
                <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-slate-200/60 text-center mb-8">
                  <div className="text-6xl mb-4">✨</div>
                  <h2 className="text-2xl font-bold text-purple-600 mb-4">
                    ¡{legendarioSeleccionado} Shiny obtenido!
                  </h2>
                  <p className="mb-6">El legendario ha sido agregado a tu equipo. ¡Eres oficialmente un Maestro Pokémon!</p>
                  
                  <button
                    onClick={volverAlMenu}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition-all"
                  >
                    ¡Regresar a MiniGames!
                  </button>
                </div>
              )}
            </>
          )}
      
      {/* Modal de Victoria */}
      {mostrarModalVictoria && datosVictoria && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border-4 border-yellow-400">
            <div className="text-center">
              {/* Confetti emoji */}
              <div className="text-6xl mb-4">🎉</div>
              
              {/* Título */}
              <h2 className="text-2xl font-bold text-yellow-600 mb-2">
                ¡VICTORIA!
              </h2>
              
              {/* Mensaje */}
              <p className="text-lg mb-4 text-gray-700">
                ¡Has vencido a <span className="font-bold text-blue-600">{datosVictoria.nombre}</span>!
              </p>
              
              {/* Recompensas */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-3">🎁 Recompensas obtenidas:</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-red-500">⚽</span>
                    <span className="font-semibold">{datosVictoria.recompensas.pokeballs} Pokéballs</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-yellow-500">🪙</span>
                    <span className="font-semibold">{datosVictoria.recompensas.fichas} Fichas</span>
                  </div>
                  {datosVictoria.recompensas.medalla && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-purple-500">🏅</span>
                      <span className="font-semibold">Medalla {datosVictoria.recompensas.medalla}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botón de continuar */}
              <button
                onClick={cerrarModalVictoria}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] shadow-lg"
              >
                ¡Continuar!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Audio element para música de gimnasio */}
      <audio 
        ref={gymAudioRef} 
        loop 
        preload="auto" 
        style={{ display: 'none' }} 
      />
      
    </div>
    </>
  );
}
