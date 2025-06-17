import React, { useState, useRef, useEffect } from 'react';
import { getShowdownCryUrl } from '@/lib/getShowdownCryUrl';
import { playSoundEffect } from '@/lib/soundEffects';
import { addPokemonToTeam } from '@/lib/equipoStorage';
import { getRandomMovesForSpecies, getPokemonDetails } from '@/lib/pokedexHelper';
import pokemonList from '@/data/sv/pokemon-sv.json';
import { items_sv } from '@/data/sv/items_sv';
import { PokeballsDisplay, getUserPokeballs, setUserPokeballs, DEFAULT_BALLS } from './pokeballs';
import pokeballImg from '@/img/pokeballs/pokeball.png';
import superballImg from '@/img/pokeballs/superball.png';
import ultraballImg from '@/img/pokeballs/ultraball.png';
import masterballImg from '@/img/pokeballs/masterball.png';
import pokeballWaitSfx from '@/sounds/sfx/pokeballwait.mp3';
import pokeballExplodeSfx from '@/sounds/sfx/pokeballexplode.mp3';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function isValidRegionalForm(pokemon) {
  const validRegionals = [
    'raichu-alola', 'muk-alola', 'meowth-alola', 'marowak-alola', 'exeggutor-alola',
    'raichu-alolan', 'muk-alolan', 'meowth-alolan', 'marowak-alolan', 'exeggutor-alolan',
    'zigzagoon-galar', 'linoone-galar', 'obstagoon-galar', 'weezing-galar',
    'articuno-galar', 'zapdos-galar', 'moltres-galar',
    'growlithe-hisui', 'arcanine-hisui', 'braviary-hisui', 'avalugg-hisui',
    'sneasel-hisui', 'samurott-hisui', 'lilligant-hisui', 'zorua-hisui', 'zoroark-hisui',
    'qwilfish-hisui', 'sneasler', 'overqwil', 'ursaluna',
  ];
  if (!/-alola(n)?$|-(galar|galarian)$|-(hisui|hisuian)$/.test(pokemon.name.toLowerCase())) return true;
  return validRegionals.includes(pokemon.name.toLowerCase());
}
function getSpriteForPokemon(pokemon, isShiny = false) {
  if (!pokemon || !pokemon.name) return '';
  let name = pokemon.name.toLowerCase();
  name = name.replace(/♀/g, '-f').replace(/♂/g, '-m').replace(/[.'’:]/g, '').replace(/é/g, 'e').replace(/\s+/g, '-');
  const variant = isShiny ? 'shiny' : 'normal';
  return `https://img.pokemondb.net/sprites/home/${variant}/${name}.png`;
}
function getRandomStats() {
  const natures = [
    'Adamant', 'Modest', 'Jolly', 'Timid', 'Bold', 'Calm', 'Impish', 'Careful', 'Hardy', 'Serious', 'Docile', 'Bashful', 'Quirky',
  ];
  const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const EVs = {}; const IVs = {};
  stats.forEach(stat => { EVs[stat] = Math.floor(Math.random() * 253); IVs[stat] = Math.floor(Math.random() * 32); });
  return {
    level: Math.floor(Math.random() * 51) + 50,
    nature: getRandomElement(natures),
    EVs, IVs,
    isShiny: Math.random() < 0.03,
  };
}
function getPokeballSprite(ballKey) {
  switch (ballKey) {
    case 'pokeball': return pokeballImg;
    case 'superball': return superballImg;
    case 'ultraball': return ultraballImg;
    case 'masterball': return masterballImg;
    default: return pokeballImg;
  }
}

// Mensajes de fallo variados
const failMessages = [
  '¡Falló! Estuvo cerca...',
  '¡Oh! Casi lo logras...',
  '¡Falló! El Pokémon escapó por poco...',
  '¡Por poco! Intenta de nuevo...',
  '¡No fue suficiente! Estuviste cerca...',
  '¡El Pokémon se resistió! Vuelve a intentarlo...',
  '¡Casi! El Pokémon se escapó justo a tiempo...',
  '¡Uy! Se escapó por un pelo...'
];

// Define the allowed animation states for pokeballAnim
type PokeballAnim = 'idle' | 'throw' | 'fall' | 'rebound' | 'wiggle' | 'success' | 'fail';

export default function PokemonCatchGo() {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // --- Estados principales ---
  const [pokemon, setPokemon] = useState(null);
  const [stats, setStats] = useState(null);
  const [balls, setBalls] = useState(() => DEFAULT_BALLS); // Inicializar con defaults
  const [selectedBall, setSelectedBall] = useState('pokeball');
  const [caught, setCaught] = useState(false);
  const [showResult, setShowResult] = useState(null); // 'success' | 'fail'
  const [showParticles, setShowParticles] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [throwing, setThrowing] = useState(false);
  const [throwProgress, setThrowProgress] = useState(0); // 0-1
  const [pokeballAnim, setPokeballAnim] = useState<PokeballAnim>('idle');
  const [pokemonAnim, setPokemonAnim] = useState('idle');
  const [circleSize, setCircleSize] = useState(1);
  const [addedToTeam, setAddedToTeam] = useState(false);
  const [pokeballIdle, setPokeballIdle] = useState({ y: 0, rot: 0, shake: 0 });
  const [pokemonIdle, setPokemonIdle] = useState({ y: 0, scale: 1, shake: 0 });
  const [showBallSelector, setShowBallSelector] = useState(false);
  const [zoomToBall, setZoomToBall] = useState(false);
  const [pokemonFlip, setPokemonFlip] = useState(false);
  const [showAppearMessage, setShowAppearMessage] = useState(false);
  const [initialCryPlayed, setInitialCryPlayed] = useState(false); // Added state
  const throwAnimRef = useRef(null);
  const pokeballIdleRef = useRef(null);
  const pokemonIdleRef = useRef(null);
  const pokeballRef = useRef(null);
  const areaRef = useRef(null);
  const backgroundMusicRef = useRef(null);
  const [pokeballLandingPos, setPokeballLandingPos] = useState<{x:number, y:number}|null>(null);
  const [showBallFailFlash, setShowBallFailFlash] = useState(false); // Nueva variable de estado
  const [failMessage, setFailMessage] = useState(''); // Estado para el mensaje de fallo

  // --- Sincronizar pokeballs desde localStorage (fuente de verdad) ---
  useEffect(() => {
    const syncPokeballs = async () => {
      if (user?.uid && user?.email) {
        // Primero intentar cargar desde localStorage (fuente de verdad más actualizada)
        const localPokeballsStr = localStorage.getItem('userPokeballs');
        if (localPokeballsStr) {
          try {
            const localPokeballs = JSON.parse(localPokeballsStr);
            console.log('🔄 Cargando pokeballs desde localStorage (fuente de verdad):', localPokeballs);
            setBalls(localPokeballs);
            return;
          } catch (error) {
            console.error('❌ Error parsing localStorage pokeballs:', error);
          }
        }

        // Si no hay datos en localStorage, usar profile como fallback
        if (user?.profile?.pokeballs) {
          console.log('🔄 Fallback: cargando pokeballs desde Firestore:', user.profile.pokeballs);
          setBalls(user.profile.pokeballs);
          // Guardar en localStorage para futuro
          localStorage.setItem('userPokeballs', JSON.stringify(user.profile.pokeballs));
        } else {
          // Si no hay datos en ningún lado, inicializar con defaults
          console.log('🆕 Inicializando pokeballs para usuario logueado:', DEFAULT_BALLS);
          
          try {
            const { updateUserPokeballs } = await import('../../lib/userData');
            await updateUserPokeballs(user.uid, user.email, DEFAULT_BALLS);
            console.log('✅ Pokeballs iniciales guardadas en Firestore');
            setBalls(DEFAULT_BALLS);
            localStorage.setItem('userPokeballs', JSON.stringify(DEFAULT_BALLS));
            
            // Actualizar el contexto del usuario
            window.dispatchEvent(new CustomEvent('pokeballsUpdated', { detail: DEFAULT_BALLS }));
          } catch (error) {
            console.error('❌ Error al guardar pokeballs iniciales:', error);
          }
        }
      }
    };

    syncPokeballs();
  }, [user?.uid, user?.profile?.pokeballs]);

  // --- Utilidad: ¿hay alguna ball disponible? ---
  const hasAnyBall = Object.values(balls).some(v => Number(v) > 0);

  // --- Animación idle Pokéball ---
  useEffect(() => {
    let t = 0;
    function animate() {
      t += 0.045;
      setPokeballIdle({
        y: Math.sin(t) * 13 + 8 * Math.sin(t * 2.2) + 3 * Math.sin(t * 3.1),
        rot: Math.sin(t * 0.7) * 22 + Math.sin(t * 1.3) * 6,
        shake: 0,
      });
      pokeballIdleRef.current = requestAnimationFrame(animate);
    }
    if (!throwing && !caught) {
      pokeballIdleRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(pokeballIdleRef.current);
  }, [throwing, caught]);

  // --- Animación idle Pokémon y cries aleatorios ---
  useEffect(() => {
    let t = 0;
    let horizontalTarget = 0;
    let horizontal = 0;
    let moving = false;
    let shakeFrame = 0;
    let shaking = false;
    let raf;
    let cryTimeout;
    let flip = false;
    let flipTimeout;
    function animate() {
      t += 0.037;
      const y = Math.sin(t) * 22 + 10 * Math.sin(t * 1.7) + 4 * Math.sin(t * 2.3);
      const scale = 1 + 0.045 * Math.sin(t * 1.2) + 0.01 * Math.sin(t * 2.7);
      if (!moving && Math.random() < 0.012) {
        // Reducir el rango de movimiento horizontal
        const options = [-24, 0, 24].filter(opt => Math.abs(opt - horizontal) > 6);
        horizontalTarget = options[Math.floor(Math.random() * options.length)];
        moving = true;
        if (Math.random() < 0.07) {
          flip = !flip;
          setPokemonFlip(flip);
          clearTimeout(flipTimeout);
          flipTimeout = setTimeout(() => {
            flip = !flip;
            setPokemonFlip(flip);
          }, 1200);
        }
      }
      if (moving) {
        horizontal += (horizontalTarget - horizontal) * 0.08;
        if (Math.abs(horizontal - horizontalTarget) < 1) {
          horizontal = horizontalTarget;
          moving = false;
        }
      }
      let shake = 0;
      if (shaking) {
        shake = Math.sin(shakeFrame * 0.7) * 28 * Math.exp(-shakeFrame/8);
        shakeFrame++;
        if (shakeFrame > 16) {
          shaking = false;
          shakeFrame = 0;
        }
      }
      setPokemonIdle({ y, scale, shake: shake + horizontal });
      raf = requestAnimationFrame(animate);
    }
    if (!caught) {
      raf = requestAnimationFrame(animate);
      function randomCry() {
        const next = 3000 + Math.random() * 3000;
        cryTimeout = setTimeout(() => {
          if (pokemon && Math.random() < 0.30) {
            const cryUrl = getShowdownCryUrl(pokemon.name);
            if (cryUrl) {
              const audio = new Audio(cryUrl);
              audio.volume = 0.10;
              audio.play().catch(() => {});
            }
            shaking = true;
            shakeFrame = 0;
          }
          randomCry();
        }, next);
      }
      randomCry();
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(cryTimeout);
      clearTimeout(flipTimeout);
    };
  }, [caught, pokemon]);

  // --- Shake Pokémon si escapa ---
  useEffect(() => {
    if (pokemonAnim === 'escape') {
      let frame = 0;
      function shake() {
        setPokemonIdle(idle => ({ ...idle, shake: Math.sin(frame * 0.5) * 18 * Math.exp(-frame/12) }));
        frame++;
        if (frame < 18) setTimeout(shake, 16);
        else setPokemonIdle(idle => ({ ...idle, shake: 0 }));
      }
      shake();
    }
  }, [pokemonAnim]);

  // --- Animación cuando la Pokéball falla ---
  useEffect(() => {
    if (pokeballAnim === 'fail') {
      setPokeballIdle({ y: 0, rot: 0, shake: 0 });
      playSoundEffect('pokeballexplode', 0.7);
      setShowFlash(true); // Iluminar toda la pantalla
      setShowBallFailFlash(true); // Iluminar la Pokébola intensamente
      setTimeout(() => {
        setShowFlash(false);
        setShowBallFailFlash(false);
      }, 350); // El flash dura 0.35s
      setZoomToBall(true);
      setTimeout(() => {
        setPokeballAnim('idle');
        setThrowing(false);
        setZoomToBall(false);
        setShowResult(null);
        setPokemonAnim('reappear');
        setPokeballLandingPos(null);
      }, 1500);
    }
  }, [pokeballAnim]);
  
  // --- Animación cuando el Pokémon reaparece tras un fallo ---
  useEffect(() => {
    if (pokemonAnim === 'reappear') {
      // Duración de la animación CSS (0.8 segundos) + un pequeño margen
      const glowTimeout = setTimeout(() => {
        // Después de la animación, volver al estado normal
        setPokemonAnim('idle');
      }, 850);
      
      return () => clearTimeout(glowTimeout);
    }
  }, [pokemonAnim]);

  // --- Animación cuando la Pokéball tiene éxito ---
  useEffect(() => {
    if (pokeballAnim === 'success') {
      // 1. Mostrar partículas y destello para éxito
      setShowParticles(true);
      setShowFlash(true);
      
      // 2. Mantener la Pokéball en su lugar
      setTimeout(() => {
        // Efecto de captura completo
        setShowParticles(false);
        setShowFlash(false);
        
        // Mantener la Pokéball visible y fija
        // No reseteamos pokeballAnim para mantenerlo en 'success'
      }, 2500);
    }
  }, [pokeballAnim]);

  // --- Inicializar Pokémon ---
  useEffect(() => {
    const validPokemonList = pokemonList.filter(isValidRegionalForm);
    const randomPokemonObj = getRandomElement(validPokemonList);
    setPokemon(randomPokemonObj);
    setStats(getRandomStats());
    setInitialCryPlayed(false); // Reset flag for initial cry for the new Pokémon
  }, []);

  // --- Efecto para el cry inicial y mensaje de aparición ---
  useEffect(() => {
    let messageTimeoutId: ReturnType<typeof setTimeout> | null = null;
    if (pokemon && !initialCryPlayed) {
      setShowAppearMessage(true);
      const cryTimeoutId = setTimeout(() => {
        const cryUrl = getShowdownCryUrl(pokemon.name);
        if (cryUrl) {
          const audio = new Audio(cryUrl);
          audio.volume = 0.20;
          audio.play().catch(() => {});
        }
      }, 100);
      // Forzar ocultar el mensaje tras 1 segundo
      messageTimeoutId = setTimeout(() => {
        setShowAppearMessage(false);
      }, 1000);
      setInitialCryPlayed(true);
      // Cleanup: SIEMPRE limpiar ambos timeouts
      return () => {
        clearTimeout(cryTimeoutId);
        if (messageTimeoutId) clearTimeout(messageTimeoutId);
      };
    } else if (!pokemon) {
      setShowAppearMessage(false); // Oculta si cambia el Pokémon
    } else if (showAppearMessage) {
      // Fallback: si por algún motivo showAppearMessage sigue true, forzar ocultar tras 2s
      messageTimeoutId = setTimeout(() => {
        setShowAppearMessage(false);
      }, 2000);
      return () => {
        if (messageTimeoutId) clearTimeout(messageTimeoutId);
      };
    }
  }, [pokemon, initialCryPlayed, showAppearMessage]);

  // --- Música de fondo ---
  useEffect(() => {
    const audio = new Audio('https://play.pokemonshowdown.com/audio/xy-rival.ogg');
    audio.loop = true;
    audio.volume = 0.03;
    backgroundMusicRef.current = audio;
    audio.play().catch(() => {});
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  // --- Detener música al capturar ---
  useEffect(() => {
    if (caught && backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, [caught]);

  // --- Animación círculo de captura ---
  useEffect(() => {
    let size = 1;
    let shrinking = true;
    let raf;
    function animate() {
      if (shrinking) size -= 0.012;
      else size += 0.012;
      if (size < 0.45) shrinking = false;
      if (size > 1) shrinking = true;
      setCircleSize(size);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // --- Helpers de posición ---
  function getPokemonCenter() {
    const poke = document.querySelector('.poke-go-pokemon-sprite');
    if (!poke) return { x: window.innerWidth / 2, y: window.innerHeight * 0.35 };
    const rect = poke.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }
  function getPokeballCenter() {
    const ball = pokeballRef.current;
    if (!ball) return { x: window.innerWidth / 2, y: window.innerHeight * 0.75 };
    const rect = ball.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }
  function getParabolaPoint(t, p0, p1, p2) {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  }

  // --- Lanzar Pokéball (botón) ---
  async function handleThrow() {
    if (throwing || caught || balls[selectedBall] <= 0) return;
    setThrowing(true);
    setPokeballAnim('throw');
    setPokemonAnim('idle');
    setShowResult(null);
    setShowParticles(false);
    setShowFlash(false);
    setZoomToBall(false);
    // setBrokenBall(false); // REMOVED
    playSoundEffect('pokeballthrow', 0.7);
    const start = getPokeballCenter();
    const end = getPokemonCenter();
    const ctrl = {
      x: (start.x + end.x) / 2 + 80,
      y: Math.min(start.y, end.y) - Math.abs(start.y - end.y) * 0.45,
    };
    let startTime = null;
    // 1. Lanzamiento parabólico
    function animateThrow(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const duration = 900;
      let t = Math.min(1, elapsed / duration);
      setThrowProgress(t);
      if (t > 0.82 && !zoomToBall) {
        setPokemonAnim('disappear');
        setZoomToBall(true);
      }
      if (t < 1) {
        throwAnimRef.current = requestAnimationFrame(animateThrow);
      } else {
        setPokeballAnim('fall');
        setTimeout(() => animateFall(), 10);
      }
    }
    // 2. Caída vertical
    function animateFall() {
      setPokeballAnim('fall');
      let fallProgress = 0;
      const fallDuration = 650; // 0.35s, más rápido que antes
      const startY = getPokemonCenter().y;
      const endY = window.innerHeight * 0.60;
      const endX = getPokemonCenter().x;
      function fallStep() {
        fallProgress += 20; // avanzar más rápido
        let t = Math.min(1, fallProgress / fallDuration);
        setThrowProgress(1 + t);
        if (t < 1) {
          throwAnimRef.current = setTimeout(fallStep, 16);
        } else {
          // Guardar posición de aterrizaje
          setPokeballLandingPos({ x: endX, y: endY });
          setPokeballAnim('rebound');
          setTimeout(() => animateRebound(), 10);
        }
      }
      fallStep();
    }
    // 3. Rebote realista (física de pelota: parabólico, gravedad)
    function animateRebound() {
      setPokeballAnim('rebound');
      const bounces = [90, 38, 14];
      const durations = [420, 220, 110];
      let bounceIndex = 0;
      function doBounce() {
        const height = bounces[bounceIndex];
        const duration = durations[bounceIndex];
        let frame = 0;
        const totalFrames = Math.round(duration / 16);
        function bounceStep() {
          const t = frame / totalFrames;
          let y = height * 4 * t * (1 - t);
          setPokeballIdle(idle => ({ ...idle, y }));
          frame++;
          if (frame <= totalFrames) {
            throwAnimRef.current = setTimeout(bounceStep, 16);
          } else {
            setPokeballIdle(idle => ({ ...idle, y: 0 }));
            bounceIndex++;
            if (bounceIndex < bounces.length) {
              setTimeout(doBounce, 32 + bounceIndex * 10);
            } else {
              // --- Rebote tipo pelota justo antes del wiggle ---
              const miniBounces = [18, 10, 5];
              const miniDurations = [90, 60, 40];
              let miniIndex = 0;
              let pokeballwaitPlayed = false;
              function doMiniBounce() {
                if (!pokeballwaitPlayed) {
                  setTimeout(() => {
                    playSoundEffect('pokeballwait', 0.9);
                  }, Math.max(0, miniDurations[0] - 400)); // 0.2s antes del primer mini-rebote
                  pokeballwaitPlayed = true;
                }
                const miniHeight = miniBounces[miniIndex];
                const miniDuration = miniDurations[miniIndex];
                let miniFrame = 0;
                const miniTotalFrames = Math.round(miniDuration / 16);
                function miniBounceStep() {
                  const t = miniFrame / miniTotalFrames;
                  let y = miniHeight * 4 * t * (1 - t);
                  setPokeballIdle(idle => ({ ...idle, y }));
                  miniFrame++;
                  if (miniFrame <= miniTotalFrames) {
                    throwAnimRef.current = setTimeout(miniBounceStep, 16);
                  } else {
                    setPokeballIdle(idle => ({ ...idle, y: 0 }));
                    miniIndex++;
                    if (miniIndex < miniBounces.length) {
                      setTimeout(doMiniBounce, 10);
                    } else {
                      setPokeballIdle(idle => ({ ...idle, y: 0 }));
                      // --- Nueva animación: volver al centro ---
                      if (pokeballLandingPos) {
                        const startX = pokeballLandingPos.x;
                        const startY = pokeballLandingPos.y;
                        const endX = window.innerWidth / 2;
                        const endY = window.innerHeight * 0.75;
                        const duration = 500; // ms
                        let frame = 0;
                        const totalFrames = Math.round(duration / 16);
                        function moveToCenterStep() {
                          const t = frame / totalFrames;
                          // Easing (easeInOutQuad)
                          const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
                          const x = startX + (endX - startX) * ease;
                          const y = startY + (endY - startY) * ease;
                          setPokeballLandingPos({ x, y });
                          frame++;
                          if (frame <= totalFrames) {
                            throwAnimRef.current = setTimeout(moveToCenterStep, 16);
                          } else {
                            setPokeballLandingPos({ x: endX, y: endY });
                            setTimeout(() => {
                              setPokeballAnim('wiggle');
                              setTimeout(() => {
                                animateWiggle();
                              }, 700);
                            }, 100); // Pequeño delay para que se note el centro
                          }
                        }
                        moveToCenterStep();
                      } else {
                        setPokeballAnim('wiggle');
                        setTimeout(() => {
                          animateWiggle();
                        }, 700);
                      }
                    }
                  }
                }
                miniBounceStep();
              }
              doMiniBounce();
            }
          }
        }
        bounceStep();
      }
      doBounce();
    }
    // 4. Wiggle triple (3 wiggles con intervalo de 0,6s)
    function animateWiggle() {
      setPokeballAnim('wiggle');
      let wiggleCount = 0;
      function doWiggle() {
        let wiggleFrame = 0;
        function wiggleStep() {
          setPokeballIdle(idle => ({ ...idle, shake: Math.sin(wiggleFrame * 0.5) * 18 * Math.exp(-wiggleFrame/60) }));
          wiggleFrame++;
          if (wiggleFrame < 38) { // ~0.6s (38*16ms)
            setTimeout(wiggleStep, 16);
          } else {
            setPokeballIdle(idle => ({ ...idle, shake: 0 }));
            wiggleCount++;
            if (wiggleCount < 3) {
              setTimeout(doWiggle, 850); // Espera 0,6s antes del siguiente wiggle
            } else {
              setTimeout(() => {
                decideCapture();
              }, 1000); // Espera 1 segundo extra antes de decidir la captura
            }
          }
        }
        wiggleStep();
      }
      doWiggle();
    }

    // 5. Decisión de captura (antes era suspenseShake)
    function decideCapture() {
      setPokeballIdle(idle => ({ ...idle, shake: 0, y: idle.y, rot: idle.rot })); // Asegurar que se detenga cualquier movimiento residual
      const success = Math.random() < 0.45; // Ajustar la probabilidad de captura si es necesario
      setShowResult(success ? 'success' : 'fail');
      setPokeballAnim(success ? 'success' : 'fail');
      setPokemonAnim(success ? 'caught' : 'escape');
      
      if (success) {
        setShowParticles(true);
        setShowFlash(true);
        playSoundEffect('pokeballcatch', 0.8);
        setTimeout(() => playSoundEffect('catchmusic', 0.6), 500);
        setCaught(true);
        setSuccessMessage(`¡Genial! Capturaste a ${pokemon?.name ? pokemon.name[0].toUpperCase() + pokemon.name.slice(1) : 'un Pokémon'}.
Será agregado a tu equipo`);
        
        setTimeout(() => {
          setShowParticles(false);
          setShowFlash(false);
          navigate('/equipo'); // Redirige a equipo tras la animación de éxito
        }, 2500);
        
        if (!addedToTeam && pokemon && stats) {
          const details = getPokemonDetails(pokemon.name);
          const ability = details?.abilities ? Object.values(details.abilities)[0] : null;
          const randomItem = items_sv[Math.floor(Math.random() * items_sv.length)]?.name || '';
          const moves = getRandomMovesForSpecies(pokemon.name);
          addPokemonToTeam({
            name: pokemon.name,
            species: pokemon.name,
            gender: 'N',
            item: randomItem,
            ability: ability,
            isShiny: stats.isShiny,
            isHO: false,
            teraType: pokemon.types?.[0] || 'Normal',
            EVs: stats.EVs,
            IVs: stats.IVs,
            nature: stats.nature,
            moves: moves && moves.length === 4 ? moves : ['-', '-', '-', '-'],
            level: stats.level,
            types: pokemon.types || ['Normal'],
            caught: true,
            price: 0
          });
          setAddedToTeam(true);
        }
      } else {
        setFailMessage(failMessages[Math.floor(Math.random() * failMessages.length)]);
        // Captura fallida - la lógica está en useEffect para pokeballAnim === 'fail'
        // No es necesario hacer nada más aquí, solo cambiar el estado.
      }
    }

    setThrowProgress(0);
    setPokeballLandingPos(null); // Reset landing position
    throwAnimRef.current = requestAnimationFrame(animateThrow);
    const newBalls = { ...balls };
    newBalls[selectedBall] = Math.max(0, newBalls[selectedBall] - 1);
    setBalls(newBalls);
    await setUserPokeballs(newBalls);
    console.log('Pokeball usada, pokeballs actualizadas:', newBalls);
  }

  // --- Limpieza de animación ---
  useEffect(() => {
    return () => {
      if (throwAnimRef.current !== null) {
        cancelAnimationFrame(throwAnimRef.current);
      }
    };
  }, []);

  // --- Pokéball Selector ---
  function PokeballSelector() {
    const allBallKeys = ['pokeball', 'superball', 'ultraball', 'masterball'];
    // Botón para agregar Pokéballs de todos los tipos (testing)
    async function handleAddAllBalls() {
      const newBalls = { ...balls };
      allBallKeys.forEach(key => {
        newBalls[key] = (newBalls[key] || 0) + 10;
      });
      setBalls(newBalls);
      await setUserPokeballs(newBalls);
      console.log('Pokeballs actualizadas:', newBalls);
    }
    return (
      <>
        {/* Botón para agregar Pokéballs de todos los tipos (testing) */}
        <button
          onClick={handleAddAllBalls}
          style={{
            marginBottom: 18,
            marginLeft: 0,
            marginRight: 0,
            padding: '8px 18px',
            borderRadius: 14,
            background: 'linear-gradient(90deg, #ffe066 0%, #43cea2 100%)',
            color: '#185a9d',
            fontWeight: 800,
            fontSize: 16,
            border: '2px solid #43cea2',
            boxShadow: '0 2px 8px #43cea244',
            cursor: 'pointer',
            outline: 'none',
            zIndex: 1100,
            position: 'fixed',
            left: 24,
            top: '10vh',
          }}
        >
          +10 Pokéballs de cada tipo (test)
        </button>
        {/* Botón flotante para abrir el selector */}
        {!showBallSelector && (
          <button
            onClick={() => setShowBallSelector(true)}
            style={{
              position: 'fixed',
              left: 24,
              bottom: '10vh',
              zIndex: 1001,
              width: 68,
              height: 68,
              borderRadius: 34,
              background: 'linear-gradient(120deg, #fff 60%, #e0ffe7 100%)',
              boxShadow: '0 4px 18px #0002',
              border: '3px solid #43cea2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
              outline: 'none',
              padding: 0,
            }}
            aria-label="Elegir Pokéball"
          >
            <img
              src={getPokeballSprite(selectedBall)}
              alt="Pokéball actual"
              style={{ width: 48, height: 48, filter: 'drop-shadow(0 2px 8px #43cea288)' }}
              draggable={false}
            />
          </button>
        )}
        {/* Menú vertical de balls */}
        {showBallSelector && (
          <div
            style={{
              position: 'fixed',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1002,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              background: 'rgba(255,255,255,0.97)',
              borderRadius: 28,
              boxShadow: '0 4px 32px #0002',
              padding: '22px 12px',
              border: '2.5px solid #43cea2',
              minWidth: 80,
              animation: 'fadeInBallSelector 0.18s',
            }}
          >
            {allBallKeys.map(ballKey => (
              <button
                key={ballKey}
                onClick={() => {
                  setSelectedBall(ballKey);
                  setShowBallSelector(false);
                }}
                style={{
                  background: selectedBall === ballKey ? 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)' : 'white',
                  border: selectedBall === ballKey ? '2.5px solid #185a9d' : '2.5px solid #43cea2',
                  borderRadius: 18,
                  margin: 0,
                  padding: '8px 10px',
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: selectedBall === ballKey ? '0 2px 12px #185a9d44' : '0 2px 8px #43cea244',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  outline: 'none',
                  position: 'relative',
                  opacity: balls[ballKey] > 0 ? 1 : 0.4,
                }}
                aria-label={`Seleccionar ${ballKey}`}
                disabled={balls[ballKey] === 0}
              >
                <img
                  src={getPokeballSprite(ballKey)}
                  alt={ballKey}
                  style={{ width: 36, height: 36, filter: selectedBall === ballKey ? 'drop-shadow(0 0 8px #43cea2)' : 'none' }}
                  draggable={false}
                />
                <span style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  color: selectedBall === ballKey ? '#fff' : '#185a9d',
                  textShadow: selectedBall === ballKey ? '0 1px 4px #185a9d88' : '0 1px 4px #fff',
                  background: selectedBall === ballKey ? 'rgba(67,206,162,0.8)' : 'rgba(255,255,255,0.8)',
                  borderRadius: 8,
                  padding: '0 6px',
                  minWidth: 18,
                  display: 'inline-block',
                }}>{balls[ballKey] || 0}</span>
              </button>
            ))}
            {/* Botón cerrar */}
            <button
              onClick={() => setShowBallSelector(false)}
              style={{
                marginTop: 10,
                background: 'none',
                border: 'none',
                color: '#185a9d',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                opacity: 0.7,
                textDecoration: 'underline',
              }}
            >Cerrar</button>
          </div>
        )}
      </>
    );
  }

  // Animación de estrellas de captura
  function CaptureStars() {
    return (
      <div className="catch-stars" style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 299,
        pointerEvents: 'none',
        width: 180,
        height: 180,
      }}>
        <div className="star star1" style={{position:'absolute', left: 10, top: 30, width: 52, height: 50, animation: 'star-pop1 1.2s ease-out'}}>
          <svg viewBox="0 0 52.95 50.35"><polygon fill="#e8e73c" points="26.47 0 32.72 19.23 52.95 19.23 36.58 31.12 42.83 50.35 26.47 38.47 10.11 50.35 16.36 31.12 0 19.23 20.22 19.23 26.47 0"/></svg>
        </div>
        <div className="star star2" style={{position:'absolute', left: 100, top: 0, width: 52, height: 50, animation: 'star-pop2 1.3s ease-out'}}>
          <svg viewBox="0 0 52.95 50.35"><polygon fill="#e8e73c" points="26.47 0 32.72 19.23 52.95 19.23 36.58 31.12 42.83 50.35 26.47 38.47 10.11 50.35 16.36 31.12 0 19.23 20.22 19.23 26.47 0"/></svg>
        </div>
        <div className="star star3" style={{position:'absolute', left: 60, top: 100, width: 52, height: 50, animation: 'star-pop3 1.4s ease-out'}}>
          <svg viewBox="0 0 52.95 50.35"><polygon fill="#e8e73c" points="26.47 0 32.72 19.23 52.95 19.23 36.58 31.12 42.83 50.35 26.47 38.47 10.11 50.35 16.36 31.12 0 19.23 20.22 19.23 26.47 0"/></svg>
        </div>
      </div>
    );
  }

  // Componente de confetti animado (confetti realista)
  function CaptureConfetti() {
    // Generar propiedades fijas para cada partícula
    const confetti = Array.from({ length: 18 }).map((_, i) => {
      // Ángulo de dispersión (rango: -60° a +60°)
      const angle = -60 + (i * 120) / 17;
      const rad = (angle * Math.PI) / 180;
      // Distancia horizontal máxima
      const dx = Math.cos(rad) * (40 + Math.random() * 30);
      // Distancia vertical máxima
      const dy = 90 + Math.random() * 40;
      // Color y escala fijos
      const color = `hsl(${i * 20},90%,60%)`;
      const scale = 0.7 + Math.random() * 0.5;
      const rotate = -30 + Math.random() * 60;
      const delay = 0.08 * i;
      const anim = `confetti-fall-real 1.3s ${delay}s cubic-bezier(.7,1.5,.7,1.1) forwards`;
      return { dx, dy, color, scale, rotate, anim };
    });
    return (
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: -2,
        transform: 'translate(-50%, -50%)',
      }}>
        {confetti.map((c, i) => (
          <div key={i} className={`confetti-real-${i}`} style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 12,
            height: 18,
            borderRadius: 4,
            background: c.color,
            opacity: 0.92,
            transform: `scale(${c.scale}) rotate(${c.rotate}deg)` ,
            animation: c.anim,
          }} />
        ))}
        {/* Animación CSS */}
        <style>{`
          @keyframes confetti-fall-real {
            0% { opacity: 0; transform: translate(0,0) scale(1) rotate(0deg); }
            10% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translate(var(--dx,0px), var(--dy,120px)) scale(1.1) rotate(30deg); }
          }
        `}</style>
        {/* Variables CSS para cada partícula */}
        {confetti.map((c, i) => (
          <style key={'var'+i}>{`
            .confetti-real-${i} { --dx: ${c.dx}px; --dy: ${c.dy}px; }
          `}</style>
        ))}
      </div>
    );
  }

  // --- Render principal ---
  let pokeballStyle;
  let cameraZoom = 1;
  let cameraY = 0;
  if (zoomToBall) {
    cameraZoom = 2.1;
    cameraY = 60;
  }

  // Pokéball animada: controlar visibilidad basada en estado
  const showPokeball =
    (caught && pokeballAnim === 'success') ||
    (pokeballAnim === 'fail') ||
    (!caught && hasAnyBall && pokeballAnim !== 'success');

  if (throwing && (pokeballAnim === 'throw' || pokeballAnim === 'fall' || pokeballAnim === 'rebound' || pokeballAnim === 'wiggle')) {
    const start = getPokeballCenter();
    const end = getPokemonCenter();
    const ctrl = {
      x: (start.x + end.x) / 2 + 80,
      y: Math.min(start.y, end.y) - Math.abs(start.y - end.y) * 0.45,
    };
    let pt;
    let bounceY = 0;
    if (pokeballAnim === 'throw') {
      // Parabólica
      pt = getParabolaPoint(throwProgress, start, ctrl, end);
    } else if (pokeballAnim === 'fall') {
      // Caída vertical
      const t = Math.min(1, throwProgress - 1); // throwProgress: 1 a 2
      pt = {
        x: end.x,
        y: end.y + (window.innerHeight * 0.60 - end.y) * t,
      };
    } else if ((pokeballAnim === 'rebound' || pokeballAnim === 'wiggle') && pokeballLandingPos) {
      // Rebote y wiggle: usar posición fija de aterrizaje
      pt = {
        x: pokeballLandingPos.x,
        y: pokeballLandingPos.y,
      };
      // Rebote visual REAL: sumar el y de pokeballIdle (que ahora sí se animará en rebote)
      bounceY = pokeballIdle.y || 0;
    } else {
      // Fallback
      pt = {
        x: end.x,
        y: window.innerHeight * 0.60,
      };
    }
    // Wiggle visual
    let wiggle = 0;
    if (pokeballAnim === 'wiggle') {
      wiggle = pokeballIdle.shake || 0;
    }
    // Animación de rotación, escala y sombra dinámica
    const rot = 360 * throwProgress * 2 + (pokeballAnim === 'wiggle' ? wiggle : 0);
    const scale = (1 + 0.18 * Math.sin(Math.PI * Math.min(throwProgress,1)));
    const shadowY = 32 + 38 * Math.sin(Math.PI * Math.min(throwProgress,1));
    pokeballStyle = {
      left: pt.x - 45 + wiggle,
      top: pt.y - 45 + bounceY, // <- aquí sumo el rebote real
      position: 'fixed',
      zIndex: 300,
      width: 90,
      height: 90,
      pointerEvents: 'none',
      transition: 'none',
      opacity: 1,
      boxShadow: `0 ${shadowY}px 38px #0005` ,
      filter: 'drop-shadow(0 4px 18px #0008)',
      animation: 'none',
      transform: `rotate(${rot}deg) scale(${scale})`,
    };
  } else {
    // Estilo para Pokéball en reposo o cuando está capturada
    const successPosition = pokeballLandingPos ? 
      { left: pokeballLandingPos.x, bottom: 'auto', top: pokeballLandingPos.y } : 
      { left: '50%', bottom: '25vh', top: 'auto' };
    
    pokeballStyle = {
      ...successPosition,
      position: 'fixed',
      transform: pokeballAnim === 'success' 
        ? 'translateX(-50%)' // Si tuvo éxito, mantenerla fija sin animaciones de idle
        : pokeballAnim === 'fail'
          ? 'translateX(-50%)' // Para fallo, mantenerla completamente fija sin movimiento
          : `translateX(-50%) translateY(${pokeballIdle.y + (pokeballIdle.shake || 0)}px) rotate(${pokeballIdle.rot}deg)`,
      zIndex: 1201, // Asegura que esté sobre el fondo y el flash, pero detrás del mensaje
      width: 90,
      height: 90,
      opacity: 1,
      boxShadow: pokeballAnim === 'success' ? '0 0 18px #7ed957aa' : '0 8px 38px #0005',
      filter: pokeballAnim === 'success' ? 'drop-shadow(0 0 18px #7ed957aa)' : 'drop-shadow(0 4px 18px #0008)',
      animation: pokeballAnim === 'fail' ? 'none' : 'none',
      transition: pokeballAnim === 'success' || pokeballAnim === 'fail' ? 'all 0.3s ease-out' : 'none',
    };
  }

  // Idle Pokémon: flotar, bounce, shake y flip
  let pokeSpriteStyle = {
    width: 200,
    height: 200,
    filter: stats?.isShiny 
      ? 'drop-shadow(0 0 32px #ffe066) drop-shadow(0 0 12px #fff)' 
      : pokemonAnim === 'reappear' 
        ? 'drop-shadow(0 0 25px #fffa) brightness(1.3)' 
        : 'drop-shadow(0 0 16px #2228)',
    transition: 'filter 0.5s ease-out, transform 0.2s cubic-bezier(.7,1.5,.7,1.1)',
    zIndex: 2,
    transform: `translateY(${pokemonIdle.y}px) scale(${pokemonIdle.scale}) translateX(${pokemonIdle.shake||0}px) scaleX(${pokemonFlip ? -1 : 1})`,
    pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
    animation: pokemonAnim === 'reappear' ? 'pokemon-reappear 0.8s ease-out' : 'none',
  };

  // Círculo de captura: animación de pulso
  let captureCircleStyle = {
    transform: `translate(-50%, -50%) scale(${circleSize})`,
    zIndex: 1,
    boxShadow: '0 0 32px 12px #7ed95755',
    border: '5px solid #7ed957cc',
    background: 'radial-gradient(circle at 50% 50%, #fff8 60%, transparent 100%)',
    transition: 'box-shadow 0.3s, border 0.2s',
    top: 75,
    left: '50%',
    position: 'absolute' as React.CSSProperties['position'],
    pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
    width: 180,
    height: 180,
    borderRadius: '50%',
  };

  // Fondo dinámico tipo Pokémon GO
  const bgStyle = {
    position: 'fixed' as const,
    left: 0, top: 0, width: '100vw', height: '100vh',
    zIndex: 0,
    background: 'linear-gradient(180deg, #b7eaff 0%, #e0ffe7 60%, #fffbe0 100%)',
    backgroundSize: '100% 100%',
    animation: 'pokeGoSky 12s linear infinite',
    filter: 'blur(0.5px)',
  };

  // --- Partículas JS ---
  function RenderParticles() {
    return (
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '22vh',
        width: 0,
        height: 0,
        zIndex: 350,
        pointerEvents: 'none',
      }}>
        {[...Array(18)].map((_,i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, #fff, #7ed957 60%, transparent 100%)`,
            left: Math.cos((i/18)*2*Math.PI) * 60 + 80,
            top: Math.sin((i/18)*2*Math.PI) * 60 + 80,
            opacity: 0.7,
            filter: 'blur(2px)',
            boxShadow: '0 0 16px #7ed95799',
            transition: 'opacity 0.7s cubic-bezier(.7,-0.2,.7,1.5)',
          }} />
        ))}
      </div>
    );
  }
  // --- Flash JS ---
  function RenderFlash() {
    return (
      <div style={{
        position: 'fixed',
        left: 0, top: 0, width: '100vw', height: '100vh',
        background: 'radial-gradient(circle at 50% 30%, #fff 0%, #fffa 40%, transparent 80%)',
        opacity: 1,
        zIndex: 999,
        pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
        animation: 'flash-pulse-fade 0.8s forwards',
      }} />
    );
  }

  // --- Nubes animadas ---
  function RenderClouds() {
    return (
      <>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            position: 'fixed',
            top: `${8 + i*7}vh`,
            left: `${10 + i*22}%`,
            width: 180 + i*30,
            height: 60 + i*12,
            background: 'linear-gradient(90deg, #fff 60%, #e0f7ff 100%)',
            borderRadius: 60,
            opacity: 0.18 + 0.08*i,
            filter: 'blur(2.5px)',
            zIndex: 1,
            animation: `pokeGoCloud${i} 32s linear infinite`,
          }} />
        ))}
      </>
    );
  }

  // Layout: separar visualmente el área de captura
  return (
    <div
      ref={areaRef}
      style={{
        position: 'relative',
        minHeight: '90vh', // antes 100vh
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* CSS Animations para efectos especiales */}
      <style>
        {`
          @keyframes pokeball-appear {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.8); }
            70% { opacity: 1; transform: translateX(-50%) translateY(-5px) scale(1.05); }
            100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          }
          
          @keyframes pokeball-throw {
            0% { transform: translate(-50%, 0) rotate(0deg) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -250px) rotate(720deg) scale(0.7); opacity: 1; }
          }
          
          @keyframes pokeball-fall {
            0% { transform: translate(-50%, -250px) rotate(720deg) scale(0.7); opacity: 1; }
            100% { transform: translate(-50%, 0) rotate(720deg) scale(0.7); opacity: 1; } /* Aterriza en el centro */
          }
          
          @keyframes pokeball-rebound {
            0%, 100% { transform: translate(-50%, 0) scale(0.7); }
            50% { transform: translate(-50%, -30px) scale(0.75); }
          }
          
          @keyframes pokeball-wiggle {
            0%, 100% { transform: translate(-50%, 0) rotate(0deg) scale(0.7); }
            25% { transform: translate(-50%, 0) rotate(-15deg) scale(0.7); }
            75% { transform: translate(-50%, 0) rotate(15deg) scale(0.7); }
          }
          
          @keyframes pokeball-success-flash {
            0%, 100% { filter: drop-shadow(0 0 18px #7ed957aa) brightness(1); }
            50% { filter: drop-shadow(0 0 35px #fff) brightness(2.5); }
          }
          
          @keyframes pokeball-fail-flash {
            0% { filter: brightness(1) drop-shadow(0 0 8px #ff4d4daa); opacity: 1; }
            50% { filter: brightness(3.5) drop-shadow(0 0 40px #fff); opacity: 1; }
            100% { filter: brightness(1) drop-shadow(0 0 8px #ff4d4daa); opacity: 1; }
          }
          
          @keyframes pokemon-disappear {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(10px) scale(0.9); }
          }
          
          @keyframes appearMsgPop {
            0% { opacity: 0; transform: translate(-50%,-50%) scale(0.7) rotate(-8deg); filter: blur(8px); }
            60% { opacity: 1; transform: translate(-50%,-50%) scale(1.08) rotate(2deg); filter: blur(0); }
            80% { opacity: 1; transform: translate(-50%,-50%) scale(0.97) rotate(-1deg); filter: blur(0); }
            100% { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(0deg); filter: blur(0); }
          }
          
          @keyframes appearMsgPopModern {
            0% { opacity: 0; transform: translate(-50%,-50%) scale(0.7) rotate(-8deg); filter: blur(8px); }
            60% { opacity: 1; transform: translate(-50%,-50%) scale(1.08) rotate(2deg); filter: blur(0); }
            80% { opacity: 1; transform: translate(-50%,-50%) scale(0.97) rotate(-1deg); filter: blur(0); }
            100% { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(0deg); filter: blur(0); }
          }
          @keyframes disappearMsgPop {
            0% { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(0deg); filter: blur(0); }
            60% { opacity: 0.7; transform: translate(-50%,-50%) scale(0.92) rotate(-2deg); filter: blur(2px); }
            100% { opacity: 0; transform: translate(-50%,-50%) scale(0.85) rotate(-8deg); filter: blur(8px); }
          }
          @keyframes star-pop1 {
            0% { opacity: 0; transform: scale(0.2) rotate(-30deg); }
            40% { opacity: 1; transform: scale(1.2) rotate(10deg); }
            70% { opacity: 1; transform: scale(1) rotate(0deg); }
            100% { opacity: 0; transform: scale(0.7) rotate(0deg); }
          }
          @keyframes star-pop2 {
            0% { opacity: 0; transform: scale(0.2) rotate(30deg); }
            40% { opacity: 1; transform: scale(1.1) rotate(-10deg); }
            70% { opacity: 1; transform: scale(1) rotate(0deg); }
            100% { opacity: 0; transform: scale(0.7) rotate(0deg); }
          }
          @keyframes star-pop3 {
            0% { opacity: 0; transform: scale(0.2) rotate(0deg); }
            40% { opacity: 1; transform: scale(1.15) rotate(20deg); }
            70% { opacity: 1; transform: scale(1) rotate(0deg); }
            100% { opacity: 0; transform: scale(0.7) rotate(0deg); }
          }
          @keyframes confetti-fall1 {
            0% { opacity: 0; transform: translateY(-40px) scale(1) rotate(-10deg); }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateY(60px) scale(1.1) rotate(20deg); }
          }
          @keyframes confetti-fall2 {
            0% { opacity: 0; transform: translateY(-60px) scale(1) rotate(10deg); }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateY(80px) scale(1.1) rotate(-20deg); }
          }
          @keyframes confetti-fall3 {
            0% { opacity: 0; transform: translateY(-30px) scale(1) rotate(0deg); }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateY(50px) scale(1.1) rotate(10deg); }
          }
        `}
      </style>
      <div style={{...bgStyle, transform: `scale(${cameraZoom}) translateY(-${cameraY}px)`, transition: 'transform 0.7s cubic-bezier(.7,1.5,.7,1.1)'}} />
      <RenderClouds />
      {/* Feedback visual */}
      {showParticles && <RenderParticles />}
      {showFlash && <RenderFlash />}
      {/* Hint */}
      {pokemon && !caught && balls[selectedBall] > 0 && !zoomToBall && (
        <div style={{marginTop: 24, marginBottom: 8, fontWeight: 700, color: '#185a9d', fontSize: 20, textShadow: '0 2px 8px #fff8', background:'#fff9', borderRadius:12, padding:'6px 18px', boxShadow:'0 2px 12px #0001'}}>
          ¡Lanza la Pokéball hacia arriba para atrapar!
        </div>
      )}
      {/* Pokémon y círculo */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: '25vh',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          minHeight: 220,
          minWidth: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'none',
          boxShadow: 'none',
          opacity: zoomToBall ? 0 : 1,
          transition: 'opacity 0.4s ease-in-out',
        }}
      >
        {pokemon && (
          <img
            src={getSpriteForPokemon(pokemon, stats?.isShiny)}
            alt={pokemon.name}
            style={pokeSpriteStyle}
            className="poke-go-pokemon-sprite"
            draggable={false}
          />
        )}
        {pokemon && !caught && (
          <div style={captureCircleStyle} />
        )}
      </div>
      {/* Pokéball animada */}
      {showPokeball && (
        <div 
          style={{
            ...pokeballStyle, 
            background: 'none', 
            boxShadow: 'none', 
            zIndex: 1201,
            animation: showBallFailFlash ? 'pokeball-fail-flash 0.35s' : pokeballAnim === 'idle' && !caught && !throwing && pokeballLandingPos === null
              ? 'fade-in-pokeball 0.8s ease-out'
              : pokeballAnim === 'success'
                ? 'success-glow 2s infinite'
                : 'none',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Estrellas y confetti de captura detrás de la Pokébola */}
          {pokeballAnim === 'success' && (
            <>
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: -1,
                width: 160,
                height: 160,
                pointerEvents: 'none',
              }}>
                <div className="star star1" style={{position:'absolute', left: 10, top: 30, width: 52, height: 50, animation: 'star-pop1 1.2s ease-out'}}>
                  <svg viewBox="0 0 52.95 50.35"><polygon fill="#e8e73c" points="26.47 0 32.72 19.23 52.95 19.23 36.58 31.12 42.83 50.35 26.47 38.47 10.11 50.35 16.36 31.12 0 19.23 20.22 19.23 26.47 0"/></svg>
                </div>
                <div className="star star2" style={{position:'absolute', left: 100, top: 0, width: 52, height: 50, animation: 'star-pop2 1.3s ease-out'}}>
                  <svg viewBox="0 0 52.95 50.35"><polygon fill="#e8e73c" points="26.47 0 32.72 19.23 52.95 19.23 36.58 31.12 42.83 50.35 26.47 38.47 10.11 50.35 16.36 31.12 0 19.23 20.22 19.23 26.47 0"/></svg>
                </div>
                <div className="star star3" style={{position:'absolute', left: 60, top: 100, width: 52, height: 50, animation: 'star-pop3 1.4s ease-out'}}>
                  <svg viewBox="0 0 52.95 50.35"><polygon fill="#e8e73c" points="26.47 0 32.72 19.23 52.95 19.23 36.58 31.12 42.83 50.35 26.47 38.47 10.11 50.35 16.36 31.12 0 19.23 20.22 19.23 26.47 0"/></svg>
                </div>
              </div>
              <CaptureConfetti />
            </>
          )}
          <img
            ref={pokeballRef}
            src={getPokeballSprite(selectedBall)}
            alt="Pokéball"
            style={{
              width: 90,
              height: 90,
              userSelect: 'none',
              pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
              transition: 'filter 0.2s',
              filter: caught 
                ? 'drop-shadow(0 0 18px #7ed957aa)' 
                : 'drop-shadow(0 0 12px #2228)',
              animation: showBallFailFlash ? 'pokeball-fail-flash 0.35s' : pokeballAnim === 'success' 
                ? 'success-pulse 2s infinite' 
                : pokeballAnim === 'idle' && pokeballLandingPos === null && !caught && !throwing
                  ? 'pokeball-appear-glow 1.5s ease-out' 
                  : 'none',
            }}
            draggable={false}
          />
        </div>
      )}
      {/* Botón lanzar */}
      {!caught && hasAnyBall && (
        <button
          onClick={handleThrow}
          style={{
            borderRadius: 999,
            padding: '18px 38px',
            fontWeight: 800,
            color: 'white',
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            fontSize: 24,
            position: 'fixed',
            left: '50%',
            bottom: '13vh',
            transform: 'translateX(-50%)',
            zIndex: 400,
            boxShadow: '0 4px 24px #0003',
            border: 'none',
            outline: 'none',
            cursor: throwing ? 'not-allowed' : 'pointer',
            opacity: throwing ? 0.7 : 1,
            transition: 'opacity 0.2s',
            letterSpacing: 1.5,
            textShadow: '0 2px 8px #185a9d88',
          }}
          disabled={throwing}
        >
          Lanzar
        </button>
      )}
      {/* Feedback de captura */}
      {showResult && (
        <div style={{
          zIndex: 500,
          position: 'fixed',
          left: '50%',
          top: '30vh',
          transform: 'translateX(-50%)',
          fontWeight: 900,
          fontSize: showResult === 'success' ? 36 : 22, // Más pequeño si es fallo
          color: showResult === 'success' ? '#43cea2' : '#d95757',
          textShadow: '0 2px 12px #fff8, 0 0 24px #43cea288',
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 18,
          padding: showResult === 'success' ? '18px 38px' : '10px 22px', // Menos padding si es fallo
          boxShadow: '0 4px 24px #0002',
          border: showResult === 'success' ? '3px solid #43cea2' : '2px solid #d95757',
          letterSpacing: 0.2,
          minWidth: 0,
          maxWidth: '90vw',
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {showResult === 'success' ? successMessage : failMessage}
        </div>
      )}
      {/* Mensaje de aparición animado */}
      {showAppearMessage && pokemon && stats && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 1200,
          fontWeight: 800,
          fontSize: 19,
          color: '#fff',
          background: 'rgba(24,90,157,0.93)', // fondo sólido, sin gradiente
          borderRadius: 14,
          padding: '14px 22px', // padding mejorado
          maxWidth: '92vw',
          minWidth: 0,
          boxShadow: '0 2px 12px #0002',
          border: '2px solid #185a9d',
          textShadow: 'none', // sin brillos
          opacity: 0.98,
          animation: showAppearMessage ? 'appearMsgPopModern 0.5s cubic-bezier(.7,1.5,.7,1.1), disappearMsgPop 0.4s 0.7s forwards' : 'none',
          display: 'inline-block',
          textAlign: 'center',
          wordBreak: 'break-word',
          lineHeight: 1.25,
          letterSpacing: 0.2,
        }}>
          <span style={{marginRight:6}}>✨</span>
          <span>¡Ha aparecido <span style={{color:'#fff'}}>{pokemon.name[0].toUpperCase() + pokemon.name.slice(1)}</span> <span style={{fontSize:15, color:'#fff', marginLeft:4}}>#Lv{stats.level}</span></span>
          <span style={{marginLeft:6}}>✨</span>
        </div>
      )}
      {/* Nombre y nivel del Pokémon, fijo arriba del sprite */}
      {pokemon && stats && (
        <div style={{
          position: 'absolute',
          top: '7vh',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          fontWeight: 900,
          fontSize: 26,
          color: '#fff',
          background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
          borderRadius: 16,
          padding: '8px 28px',
          boxShadow: '0 2px 16px #0002',
          border: '2.5px solid #43cea2',
          textShadow: '0 2px 8px #185a9d88, 0 0 12px #43cea288',
          opacity: 0.97,
          letterSpacing: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap:6,
        }}>
          <span style={{color:'#ffe066', textShadow:'0 0 8px #fff', fontWeight:800, fontSize:28}}>
            {pokemon.name[0].toUpperCase() + pokemon.name.slice(1)}
          </span>
          <span style={{fontSize:18, color:'#fff', fontWeight:700, background:'#185a9d', borderRadius:8, padding:'2px 10px', marginLeft:4, boxShadow:'0 1px 6px #185a9d44'}}>Lv{stats.level}</span>
        </div>
      )}
      {/* Pokéball Selector vertical */}
      <PokeballSelector />
      {/* Inventario de Pokéballs (eliminado) */}
      {/* <div style={{ position: 'fixed', bottom: 0, left:  0, width: '100%', zIndex: 100, background: 'linear-gradient(0deg, #fff9 60%, transparent 100%)', boxShadow: '0 -2px 16px #0001' }}>
        <PokeballsDisplay
          key={JSON.stringify(balls)}
          balls={balls}
          onSelectBall={ballKey => setSelectedBall(ballKey)}
          selectedBallKey={selectedBall}
        />
      </div> */}
    </div>
  );
}

// --- Animaciones claveframes para fondo y nubes (solo para referencia, no CSS real) ---
// pokeGoSky: gradiente que se mueve sutilmente
// pokeGoCloud0-3: nubes que se desplazan horizontalmente
// Si quieres animación real, deberías usar una librería JS de animación o canvas para el fondo.
