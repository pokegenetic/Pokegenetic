import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { playSoundEffect } from '../../lib/soundEffects';
import { getUserPokeballs, setUserPokeballs } from './pokeballs';
import casinoAudio from '../../sounds/casino.mp3';
import winAudio from '../../sounds/sfx/win.mp3';
import victoryAudio from '../../sounds/sfx/victory.mp3';
import nothingAudio from '../../sounds/sfx/nothing.mp3';
import slotAudio from '../../sounds/sfx/slot.wav';

// Importar imágenes de pokéballs
import pokeballImg from '../../img/pokeballs/pokeball.png';
import superballImg from '../../img/pokeballs/superball.png';
import ultraballImg from '../../img/pokeballs/ultraball.png';
import masterballImg from '../../img/pokeballs/masterball.png';

// Definir los símbolos del tragamonedas con sus sprites y probabilidades
const SLOT_SYMBOLS = [
  { 
    id: 'bulbasaur', 
    name: 'Bulbasaur', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/bulbasaur.png',
    probability: 20,
    rarity: 'common'
  },
  { 
    id: 'charmander', 
    name: 'Charmander', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/charmander.png',
    probability: 20,
    rarity: 'common'
  },
  { 
    id: 'squirtle', 
    name: 'Squirtle', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/squirtle.png',
    probability: 20,
    rarity: 'common'
  },
  { 
    id: 'pikachu', 
    name: 'Pikachu', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/pikachu.png',
    probability: 12,
    rarity: 'uncommon'
  },
  { 
    id: 'eevee', 
    name: 'Eevee', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/eevee.png',
    probability: 8,
    rarity: 'uncommon'
  },
  { 
    id: 'snorlax', 
    name: 'Snorlax', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/snorlax.png',
    probability: 6,
    rarity: 'rare'
  },
  { 
    id: 'dragonite', 
    name: 'Dragonite', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/dragonite.png',
    probability: 4,
    rarity: 'rare'
  },
  { 
    id: 'gyarados', 
    name: 'Gyarados', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/gyarados.png',
    probability: 3,
    rarity: 'rare'
  },
  { 
    id: 'alakazam', 
    name: 'Alakazam', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/alakazam.png',
    probability: 2.5,
    rarity: 'epic'
  },
  { 
    id: 'arcanine', 
    name: 'Arcanine', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/arcanine.png',
    probability: 2,
    rarity: 'epic'
  },
  { 
    id: 'garchomp', 
    name: 'Garchomp', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/garchomp.png',
    probability: 1.2,
    rarity: 'epic'
  },
  { 
    id: 'mew', 
    name: 'Mew', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/mew.png',
    probability: 3,
    rarity: 'legendary'
  },
  { 
    id: 'mewtwo', 
    name: 'Mewtwo', 
    sprite: 'https://img.pokemondb.net/sprites/home/normal/mewtwo.png',
    probability: 2,
    rarity: 'mythic'
  }
];

// Definir el tipo de premio más específico
type Prize = {
  pokeball?: number;
  superball?: number;
  ultraball?: number;
  masterball?: number;
  message: string;
};

// Definir premios basados en combinaciones
const PRIZES: { [key: string]: Prize } = {
  // Tres iguales - Comunes
  'bulbasaur-3': { pokeball: 2, message: '¡3 Bulbasaur! +2 Pokéballs' },
  'charmander-3': { pokeball: 2, message: '¡3 Charmander! +2 Pokéballs' },
  'squirtle-3': { pokeball: 2, message: '¡3 Squirtle! +2 Pokéballs' },
  
  // Tres iguales - Poco comunes
  'pikachu-3': { superball: 2, pokeball: 1, message: '¡3 Pikachu! +2 Superballs +1 Pokéball' },
  'eevee-3': { superball: 2, pokeball: 2, message: '¡3 Eevee! +2 Superballs +2 Pokéballs' },
  
  // Tres iguales - Raros
  'snorlax-3': { superball: 3, pokeball: 2, message: '¡3 Snorlax! +3 Superballs +2 Pokéballs' },
  'dragonite-3': { ultraball: 1, superball: 2, message: '¡3 Dragonite! +1 Ultraball +2 Superballs' },
  'gyarados-3': { ultraball: 1, superball: 3, message: '¡3 Gyarados! +1 Ultraball +3 Superballs' },
  
  // Tres iguales - Épicos
  'alakazam-3': { ultraball: 2, superball: 1, message: '¡3 Alakazam! +2 Ultraballs +1 Superball' },
  'arcanine-3': { ultraball: 3, superball: 1, message: '¡3 Arcanine! +3 Ultraballs +1 Superball' },
  'garchomp-3': { ultraball: 4, superball: 1, message: '¡3 Garchomp! +4 Ultraballs +1 Superball' },
  
  // Tres iguales - Legendarios/Míticos
  'mew-3': { pokeball: 5, superball: 5, ultraball: 5, masterball: 1, message: '¡3 MEW! ¡PREMIO MAYOR! +5 de cada pokéball +1 Masterball' },
  'mewtwo-3': { masterball: 3, ultraball: 2, message: '¡3 MEWTWO! ¡JACKPOT! +3 MASTERBALLS +2 Ultraballs' },
  
  // Dos iguales - Solo para poco comunes y superiores
  'pikachu-2': { pokeball: 1, message: '¡2 Pikachu! +1 Pokéball' },
  'eevee-2': { pokeball: 1, message: '¡2 Eevee! +1 Pokéball' },
  'snorlax-2': { superball: 1, message: '¡2 Snorlax! +1 Superball' },
  'dragonite-2': { superball: 1, message: '¡2 Dragonite! +1 Superball' },
  'gyarados-2': { superball: 1, message: '¡2 Gyarados! +1 Superball' },
  'alakazam-2': { ultraball: 1, message: '¡2 Alakazam! +1 Ultraball' },
  'arcanine-2': { ultraball: 1, message: '¡2 Arcanine! +1 Ultraball' },
  'garchomp-2': { ultraball: 1, message: '¡2 Garchomp! +1 Ultraball' },
  'mew-2': { ultraball: 2, message: '¡2 Mew! +2 Ultraballs' },
  'mewtwo-2': { masterball: 1, message: '¡2 Mewtwo! +1 Masterball' },
  
  // Un legendario/mítico
  'mew-1': { superball: 1, message: '¡Mew apareció! +1 Superball' },
  'mewtwo-1': { ultraball: 1, message: '¡Mewtwo apareció! +1 Ultraball' }
};

const COST_PER_SPIN = 1; // 1 ficha por giro

// Función para seleccionar símbolos basado en probabilidades
function getRandomSymbol() {
  const random = Math.random() * 100;
  let cumulativeProbability = 0;
  
  for (const symbol of SLOT_SYMBOLS) {
    cumulativeProbability += symbol.probability;
    if (random <= cumulativeProbability) {
      return symbol;
    }
  }
  return SLOT_SYMBOLS[0]; // fallback
}

// Función para evaluar premios
function evaluatePrize(slots: typeof SLOT_SYMBOLS): Prize | null {
  const symbolIds = slots.map(s => s.id);
  const counts: { [key: string]: number } = {};
  
  // Contar ocurrencias de cada símbolo
  symbolIds.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
  });
  
  // Verificar premios en orden de prioridad
  // 1. Tres iguales
  for (const [symbolId, count] of Object.entries(counts)) {
    if (count === 3) {
      return PRIZES[`${symbolId}-3`] || null;
    }
  }
  
  // 2. Dos iguales (solo para poco comunes y superiores)
  for (const [symbolId, count] of Object.entries(counts)) {
    if (count === 2 && ['pikachu', 'eevee', 'snorlax', 'dragonite', 'gyarados', 'alakazam', 'arcanine', 'garchomp', 'mew', 'mewtwo'].includes(symbolId)) {
      return PRIZES[`${symbolId}-2`] || null;
    }
  }
  
  // 3. Un legendario/mítico
  for (const symbolId of symbolIds) {
    if (['mew', 'mewtwo'].includes(symbolId)) {
      return PRIZES[`${symbolId}-1`] || null;
    }
  }
  
  return null;
}

// Función para determinar si es un premio gordo
function isJackpotPrize(prize: Prize): boolean {
  // Premios gordos: épicos, legendarios, míticos, masterballs, 2+ ultraballs
  return !!(
    prize.masterball || 
    (prize.ultraball && prize.ultraball >= 2) ||
    prize.message.includes('MEW') ||
    prize.message.includes('MEWTWO') ||
    prize.message.includes('PREMIO MAYOR') ||
    prize.message.includes('JACKPOT') ||
    prize.message.includes('Alakazam') ||
    prize.message.includes('Arcanine') ||
    prize.message.includes('Garchomp')
  );
}

// Función para renderizar las pokéballs ganadas visualmente
function renderPrizeRewards(prize: Prize) {
  const rewards = [];
  
  if (prize.pokeball) {
    rewards.push({
      type: 'pokeball',
      count: prize.pokeball,
      image: pokeballImg,
      name: 'Pokéball'
    });
  }
  
  if (prize.superball) {
    rewards.push({
      type: 'superball', 
      count: prize.superball,
      image: superballImg,
      name: 'Superball'
    });
  }
  
  if (prize.ultraball) {
    rewards.push({
      type: 'ultraball',
      count: prize.ultraball, 
      image: ultraballImg,
      name: 'Ultraball'
    });
  }
  
  if (prize.masterball) {
    rewards.push({
      type: 'masterball',
      count: prize.masterball,
      image: masterballImg, 
      name: 'Masterball'
    });
  }
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
      {rewards.map((reward, index) => (
        <div 
          key={`${reward.type}-${index}`}
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg border border-gray-200/70 animate-bounce"
          style={{ animationDelay: `${index * 0.2}s`, animationDuration: '0.8s' }}
        >
          <div className="text-green-500 font-bold text-lg">+</div>
          <div className="text-lg font-bold text-gray-800">{reward.count}</div>
          <img 
            src={reward.image}
            alt={reward.name}
            className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            onError={(e) => {
              // Fallback a imagen pública si falla
              e.currentTarget.src = `/img/pokeballs/${reward.type}.png`;
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function CoinMachine() {
  const { user, triggerFichasUpdate } = useUser();
  const [slots, setSlots] = useState([SLOT_SYMBOLS[0], SLOT_SYMBOLS[0], SLOT_SYMBOLS[0]]);
  const [message, setMessage] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [prizeMessage, setPrizeMessage] = useState('');
  const [lastPrize, setLastPrize] = useState<Prize | null>(null);
  const [casinoMusic, setCasinoMusic] = useState<HTMLAudioElement | null>(null);
  const [slotAnimations, setSlotAnimations] = useState([false, false, false]);
  const [leverPulled, setLeverPulled] = useState(false);
  const [lightsActive, setLightsActive] = useState(false);
  const [coinDropping, setCoinDropping] = useState(false);
  const [showPrizeTable, setShowPrizeTable] = useState(false);

  // Obtener fichas del usuario desde profile
  const userFichas = user?.profile?.fichas || 0;

  // Inicializar música de casino
  useEffect(() => {
    const audio = new Audio(casinoAudio);
    audio.loop = true;
    audio.volume = 0.1; // 10% de volumen
    setCasinoMusic(audio);

    // Reproducir automáticamente al ingresar
    const playMusic = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.log('No se pudo reproducir música automáticamente:', error);
      }
    };
    
    playMusic();

    // Limpiar al desmontar componente
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Función de prueba para agregar fichas
  const handleAddTestFichas = () => {
    const newFichas = userFichas + 10; // Agregar 10 fichas de prueba
    triggerFichasUpdate(newFichas);
    playSoundEffect('notification', 0.2);
  };

  const handleSpin = async () => {
    if (userFichas < COST_PER_SPIN || spinning) return;
    
    setSpinning(true);
    setMessage('');
    setPrizeMessage('');
    setLastPrize(null);
    setLeverPulled(true);
    setLightsActive(true);
    setCoinDropping(true);
    
    // Reproducir sonido de tragamonedas girando (dura ~6 segundos)
    const slotSound = new Audio(slotAudio);
    slotSound.volume = 0.2; // Reducido a la mitad para evitar saturación
    slotSound.play().catch(console.error);
    
    // Descontar fichas del usuario
    triggerFichasUpdate(Math.max(0, userFichas - COST_PER_SPIN));
    
    // Efectos visuales inmediatos
    setTimeout(() => setCoinDropping(false), 800);
    setTimeout(() => setLeverPulled(false), 1000);
    
    // Iniciar animación de cada slot de forma escalonada (más realista)
    setSlotAnimations([true, true, true]);
    
    // Determinar resultado final inmediatamente
    const finalSlots = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // Variables para controlar qué slots están girando (no depende del estado React)
    let slot1Spinning = true;
    let slot2Spinning = true; 
    let slot3Spinning = true;
    
    // Crear animación visual continua - TODOS giran al principio
    const animationInterval = setInterval(() => {
      setSlots(currentSlots => {
        const newSlots = [...currentSlots];
        if (slot1Spinning) newSlots[0] = getRandomSymbol();
        if (slot2Spinning) newSlots[1] = getRandomSymbol(); 
        if (slot3Spinning) newSlots[2] = getRandomSymbol();
        
        console.log('🎰 Sprites girando:', { 
          slot0: slot1Spinning ? newSlots[0].name : 'PARADO',
          slot1: slot2Spinning ? newSlots[1].name : 'PARADO',
          slot2: slot3Spinning ? newSlots[2].name : 'PARADO'
        });
        return newSlots;
      });
    }, 120); // Cada 120ms para ver claramente
    
    // Parar slots de forma escalonada (como un tragamonedas real) - total ~4s
    setTimeout(() => {
      slot1Spinning = false; // Parar slot 1
      setSlots([finalSlots[0], slots[1], slots[2]]);
      setSlotAnimations([false, true, true]);
    }, 1500); // Primer slot para a 1.5s
    
    setTimeout(() => {
      slot2Spinning = false; // Parar slot 2
      setSlots([finalSlots[0], finalSlots[1], slots[2]]);
      setSlotAnimations([false, false, true]);
    }, 3000); // Segundo slot para a 3s
    
    setTimeout(async () => {
      slot3Spinning = false; // Parar slot 3
      clearInterval(animationInterval);
      setSlots(finalSlots);
      setSlotAnimations([false, false, false]);
      setLightsActive(false);
      
      // Evaluar premio
      const prize = evaluatePrize(finalSlots);
      
      if (prize) {
        // Obtener pokéballs actuales del usuario
        const currentPokeballs = await getUserPokeballs();
        const newPokeballs = { ...currentPokeballs };
        
        // Agregar pokéballs según el premio
        if (prize.pokeball) {
          newPokeballs.pokeball = (newPokeballs.pokeball || 0) + prize.pokeball;
        }
        if (prize.superball) {
          newPokeballs.superball = (newPokeballs.superball || 0) + prize.superball;
        }
        if (prize.ultraball) {
          newPokeballs.ultraball = (newPokeballs.ultraball || 0) + prize.ultraball;
        }
        if (prize.masterball) {
          newPokeballs.masterball = (newPokeballs.masterball || 0) + prize.masterball;
        }
        
        // Actualizar pokeballs del usuario
        await setUserPokeballs(newPokeballs);
        
        setLastPrize(prize);
        setPrizeMessage(prize.message);
        
        // Limpiar mensaje después de 4 segundos para volver al estado "Listo para jugar"
        setTimeout(() => {
          setPrizeMessage('');
          setLastPrize(null);
        }, 4000);
        
        // Reproducir sonido según tipo de premio
        if (isJackpotPrize(prize)) {
          const victorySound = new Audio(victoryAudio);
          victorySound.volume = 0.5;
          victorySound.play().catch(console.error);
          // Efectos adicionales para jackpot
          setLightsActive(true);
          setTimeout(() => setLightsActive(false), 3000);
        } else {
          const winSound = new Audio(winAudio);
          winSound.volume = 0.3;
          winSound.play().catch(console.error);
        }
      } else {
        setLastPrize(null);
        setPrizeMessage('¡Sin premio esta vez!');
        
        // Limpiar mensaje después de 4 segundos para volver al estado "Listo para jugar"
        setTimeout(() => {
          setPrizeMessage('');
          setLastPrize(null);
        }, 4000);
        
        // Reproducir sonido de sin premio con un pequeño delay para mayor claridad
        setTimeout(() => {
          console.log('🔊 Reproduciendo sonido de sin premio (nothing.mp3)');
          const nothingSound = new Audio(nothingAudio);
          nothingSound.volume = 0.5; // Aumentar un poco el volumen para mejor audibilidad
          nothingSound.play()
            .then(() => console.log('✅ nothing.mp3 reproducido exitosamente'))
            .catch(error => {
              console.error('❌ Error reproduciendo nothing.mp3:', error);
              // Fallback: intentar reproducir again
              setTimeout(() => {
                const fallbackSound = new Audio(nothingAudio);
                fallbackSound.volume = 0.3;
                fallbackSound.play().catch(console.error);
              }, 100);
            });
        }, 300); // Aumentar el delay ligeramente para mayor claridad
      }
      
      setSpinning(false);
    }, 4000); // Tercer slot para a 4s - coincide con duración del sonido
  };

  return (
    <div className="flex flex-col items-center w-full px-3 sm:px-4 pt-4 sm:pt-6 pb-4 sm:pb-6">
      {/* Container principal con glassmorphism */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Título principal simple como el hero */}
        <div className="text-center mb-3 sm:mb-4 lg:mb-6">
          <div className="flex flex-col items-center justify-center mb-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl px-2">
              🎰 Atrapamonedas Pokémon
            </h2>
          </div>
          
          <p className="text-sm sm:text-base text-gray-700 max-w-xl mx-auto px-3">
            Usa tus fichas para intentar ganar pokéballs. Los Pokémon más raros dan mejores premios.
          </p>
        </div>

        {/* Panel de fichas más compacto */}
        <div className="flex justify-center mb-3 sm:mb-4 lg:mb-6 px-2">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white/70 backdrop-blur-lg border border-gray-200/70 rounded-xl sm:rounded-2xl shadow-lg hover:bg-white/80 transition-all">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-base sm:text-lg lg:text-xl font-bold text-yellow-900">�</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Fichas</p>
              <p className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-800">{userFichas}</p>
            </div>
            <button
              onClick={handleAddTestFichas}
              className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              title="Agregar 10 fichas de prueba"
            >
              +10
            </button>
          </div>
        </div>

        {/* Slot Machine con mejor espaciado mobile */}
        <div className="relative mb-3 sm:mb-4 lg:mb-6 px-2 sm:px-0">
          <div className="bg-white/60 backdrop-blur-md border border-gray-200/70 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 relative overflow-hidden max-w-sm sm:max-w-lg mx-auto">
            
            {/* Pantalla principal con efectos de casino súper mejorados - mejor mobile */}
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 relative border-2 sm:border-4 border-transparent bg-clip-padding shadow-2xl overflow-hidden">
              
              {/* Luces de casino animadas en el borde - múltiples capas más intensas */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 via-pink-500 to-red-500 animate-spin opacity-80" style={{ animationDuration: '8s' }}></div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-l from-pink-500 via-blue-500 via-green-500 via-yellow-500 via-red-500 to-pink-500 animate-spin opacity-70" style={{ animationDuration: '12s' }}></div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500 via-purple-500 via-cyan-500 to-orange-500 animate-spin opacity-60" style={{ animationDuration: '15s' }}></div>
              <div className="absolute inset-1 bg-gray-900/95 backdrop-blur-sm rounded-2xl"></div>
              
              {/* Luces intermitentes en las esquinas - más grandes y coloridas */}
              <div className="absolute top-2 left-2 w-4 h-4 bg-red-400 rounded-full animate-pulse shadow-xl shadow-red-400/80 ring-2 ring-red-300/40"></div>
              <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-xl shadow-yellow-400/80 ring-2 ring-yellow-300/40" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse shadow-xl shadow-blue-400/80 ring-2 ring-blue-300/40" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-xl shadow-green-400/80 ring-2 ring-green-300/40" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Luces laterales adicionales más espectaculares */}
              <div className="absolute top-1/6 left-0 w-3 h-3 bg-purple-400 rounded-full animate-ping shadow-lg shadow-purple-400/70" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute top-1/3 left-0 w-2 h-2 bg-pink-400 rounded-full animate-ping shadow-md shadow-pink-400/60" style={{ animationDelay: '0.8s' }}></div>
              <div className="absolute top-1/2 left-0 w-3 h-3 bg-cyan-400 rounded-full animate-ping shadow-lg shadow-cyan-400/70" style={{ animationDelay: '1.3s' }}></div>
              <div className="absolute top-2/3 left-0 w-2 h-2 bg-lime-400 rounded-full animate-ping shadow-md shadow-lime-400/60" style={{ animationDelay: '1.8s' }}></div>
              <div className="absolute top-5/6 left-0 w-3 h-3 bg-rose-400 rounded-full animate-ping shadow-lg shadow-rose-400/70" style={{ animationDelay: '2.3s' }}></div>
              
              <div className="absolute top-1/6 right-0 w-3 h-3 bg-orange-400 rounded-full animate-ping shadow-lg shadow-orange-400/70" style={{ animationDelay: '0.6s' }}></div>
              <div className="absolute top-1/3 right-0 w-2 h-2 bg-amber-400 rounded-full animate-ping shadow-md shadow-amber-400/60" style={{ animationDelay: '1.1s' }}></div>
              <div className="absolute top-1/2 right-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping shadow-lg shadow-emerald-400/70" style={{ animationDelay: '1.6s' }}></div>
              <div className="absolute top-2/3 right-0 w-2 h-2 bg-violet-400 rounded-full animate-ping shadow-md shadow-violet-400/60" style={{ animationDelay: '2.1s' }}></div>
              <div className="absolute top-5/6 right-0 w-3 h-3 bg-fuchsia-400 rounded-full animate-ping shadow-lg shadow-fuchsia-400/70" style={{ animationDelay: '2.6s' }}></div>
              
              {/* Luces superiores e inferiores */}
              <div className="absolute top-0 left-1/6 w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-md shadow-red-400/60" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute top-0 left-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/70" style={{ animationDelay: '0.7s' }}></div>
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-md shadow-green-400/60" style={{ animationDelay: '1.2s' }}></div>
              <div className="absolute top-0 left-2/3 w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/70" style={{ animationDelay: '1.7s' }}></div>
              <div className="absolute top-0 left-5/6 w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-md shadow-purple-400/60" style={{ animationDelay: '2.2s' }}></div>
              
              <div className="absolute bottom-0 left-1/6 w-2 h-2 bg-pink-400 rounded-full animate-pulse shadow-md shadow-pink-400/60" style={{ animationDelay: '0.4s' }}></div>
              <div className="absolute bottom-0 left-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/70" style={{ animationDelay: '0.9s' }}></div>
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-md shadow-orange-400/60" style={{ animationDelay: '1.4s' }}></div>
              <div className="absolute bottom-0 left-2/3 w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg shadow-lime-400/70" style={{ animationDelay: '1.9s' }}></div>
              <div className="absolute bottom-0 left-5/6 w-2 h-2 bg-rose-400 rounded-full animate-pulse shadow-md shadow-rose-400/60" style={{ animationDelay: '2.4s' }}></div>
              
              {/* Efectos de neón interno múltiples capas */}
              <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-pink-500/15 animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-3 rounded-lg bg-gradient-to-tr from-yellow-500/10 via-red-500/10 to-green-500/10 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
              <div className="absolute inset-4 rounded-md bg-gradient-to-bl from-cyan-500/8 via-orange-500/8 to-violet-500/8 animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
              
              {/* Efecto de resplandor exterior */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-blue-500/20 blur-md animate-pulse" style={{ animationDuration: '6s' }}></div>
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-purple-400/15 via-green-500/15 to-orange-500/15 blur-sm animate-ping opacity-50" style={{ animationDuration: '8s' }}></div>
              
              {/* Overlay consistente - siempre presente con diferentes estados */}
              <div className="absolute inset-0 bg-gray-800/95 rounded-2xl flex items-center justify-center z-20 backdrop-blur-sm relative overflow-hidden">
                
                {/* Luces de casino - coloridas cuando hay fichas, grises cuando no */}
                {userFichas >= COST_PER_SPIN && !spinning ? (
                  <>
                    {/* Luces coloridas cuando hay fichas */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 via-pink-500 to-red-500 animate-spin opacity-30" style={{ animationDuration: '8s' }}></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-l from-pink-500 via-blue-500 via-green-500 via-yellow-500 via-red-500 to-pink-500 animate-spin opacity-20" style={{ animationDuration: '12s' }}></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 via-purple-500 via-cyan-500 to-orange-500 animate-spin opacity-15" style={{ animationDuration: '15s' }}></div>
                    
                    {/* Luces coloridas en esquinas */}
                    <div className="absolute top-2 left-2 w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" style={{ animationDelay: '1.5s' }}></div>
                    
                    {/* Luces laterales coloridas */}
                    <div className="absolute top-1/6 left-0 w-2 h-2 bg-purple-400 rounded-full animate-ping shadow-md shadow-purple-400/50" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute top-1/2 left-0 w-2 h-2 bg-pink-400 rounded-full animate-ping shadow-md shadow-pink-400/50" style={{ animationDelay: '1.3s' }}></div>
                    <div className="absolute top-5/6 left-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping shadow-md shadow-cyan-400/50" style={{ animationDelay: '2.3s' }}></div>
                    
                    <div className="absolute top-1/6 right-0 w-2 h-2 bg-orange-400 rounded-full animate-ping shadow-md shadow-orange-400/50" style={{ animationDelay: '0.6s' }}></div>
                    <div className="absolute top-1/2 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping shadow-md shadow-emerald-400/50" style={{ animationDelay: '1.6s' }}></div>
                    <div className="absolute top-5/6 right-0 w-2 h-2 bg-rose-400 rounded-full animate-ping shadow-md shadow-rose-400/50" style={{ animationDelay: '2.6s' }}></div>
                    
                    <div className="absolute inset-3 rounded-lg bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" style={{ animationDuration: '3s' }}></div>
                  </>
                ) : spinning ? (
                  <>
                    {/* Luces extra vibrantes cuando está girando */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 via-pink-500 to-red-500 animate-spin opacity-50" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-l from-pink-500 via-blue-500 via-green-500 via-yellow-500 via-red-500 to-pink-500 animate-spin opacity-40" style={{ animationDuration: '6s' }}></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 via-purple-500 via-cyan-500 to-orange-500 animate-spin opacity-30" style={{ animationDuration: '8s' }}></div>
                    
                    {/* Luces más intensas cuando gira */}
                    <div className="absolute top-2 left-2 w-4 h-4 bg-red-400 rounded-full animate-ping shadow-xl shadow-red-400/70"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping shadow-xl shadow-yellow-400/70" style={{ animationDelay: '0.2s' }}></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 bg-blue-400 rounded-full animate-ping shadow-xl shadow-blue-400/70" style={{ animationDelay: '0.4s' }}></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-400 rounded-full animate-ping shadow-xl shadow-green-400/70" style={{ animationDelay: '0.6s' }}></div>
                    
                    <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-blue-500/20 animate-pulse" style={{ animationDuration: '1s' }}></div>
                  </>
                ) : (
                  <>
                    {/* Luces en escala de grises cuando no hay fichas */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-300 via-gray-400 via-gray-500 via-gray-600 via-gray-700 via-gray-800 to-gray-300 animate-spin opacity-30" style={{ animationDuration: '8s' }}></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-l from-gray-800 via-gray-600 via-gray-500 via-gray-400 via-gray-300 to-gray-800 animate-spin opacity-20" style={{ animationDuration: '12s' }}></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-400 via-gray-700 via-gray-500 to-gray-400 animate-spin opacity-15" style={{ animationDuration: '15s' }}></div>
                    
                    <div className="absolute top-2 left-2 w-3 h-3 bg-gray-400 rounded-full animate-pulse shadow-lg shadow-gray-400/50"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 bg-gray-500 rounded-full animate-pulse shadow-lg shadow-gray-500/50" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 bg-gray-600 rounded-full animate-pulse shadow-lg shadow-gray-600/50" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-gray-300 rounded-full animate-pulse shadow-lg shadow-gray-300/50" style={{ animationDelay: '1.5s' }}></div>
                    
                    <div className="absolute inset-3 rounded-lg bg-gradient-to-br from-gray-400/10 via-gray-600/10 to-gray-800/10 animate-pulse" style={{ animationDuration: '3s' }}></div>
                  </>
                )}
                
                {/* Contenido central que cambia según el estado */}
                <div className="text-center text-white relative z-10">
                  {userFichas < COST_PER_SPIN && !spinning ? (
                    <>
                      {/* Sin fichas */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-gray-300 rounded-full border-3 border-gray-600 relative flex items-center justify-center animate-pulse">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-600 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-500 rounded-t-full"></div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold">Inserta una ficha</div>
                      <div className="text-sm text-gray-300 mt-2">Necesitas al menos 1 ficha</div>
                    </>
                  ) : spinning ? (
                    <>
                      {/* Girando */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 relative flex items-center justify-center">
                        <img 
                          src="/pokeball.png" 
                          alt="Girando" 
                          className="w-full h-full animate-spin"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold animate-pulse">Girando...</div>
                      <div className="text-sm text-gray-300 mt-2">¡Los dados están en el aire!</div>
                    </>
                  ) : prizeMessage ? (
                    <>
                      {/* Mostrando resultado */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 relative flex items-center justify-center">
                        <div className="text-4xl">
                          {lastPrize && isJackpotPrize(lastPrize) ? '🏆' : prizeMessage.includes('Sin premio') ? '😔' : '🎁'}
                        </div>
                      </div>
                      <div className="text-lg sm:text-xl font-bold">{prizeMessage}</div>
                      {lastPrize && (
                        <div className="text-sm text-gray-300 mt-2">¡Genial! Sigue jugando</div>
                      )}
                      
                      {/* Renderizar premios ganados */}
                      {lastPrize && renderPrizeRewards(lastPrize)}
                    </>
                  ) : (
                    <>
                      {/* Listo para jugar - estado default cuando hay fichas */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 bg-yellow-400 rounded-full border-3 border-yellow-200 relative flex items-center justify-center animate-pulse">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-600 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-yellow-300 rounded-t-full"></div>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold">¡Listo para jugar!</div>
                      <div className="text-sm text-gray-300 mt-2">Haz clic en JUGAR para girar</div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Slots optimizados para mobile - siempre visibles */}
              <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 lg:gap-8 py-2 sm:py-3">
                {slots.map((symbol, index) => (
                  <div 
                    key={index}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-2 shadow-lg transition-all duration-300 ${
                      (userFichas < COST_PER_SPIN && !spinning) ? 'grayscale opacity-70' : ''
                    } ${
                      slotAnimations[index] ? 'shadow-2xl border-yellow-400 bg-yellow-50/20' : ''
                    }`}
                    style={{
                      borderColor: slotAnimations[index] ? '#fbbf24' :
                        symbol.rarity === 'mythic' ? '#8b5cf6' :
                        symbol.rarity === 'legendary' ? '#ec4899' :
                        symbol.rarity === 'epic' ? '#f97316' :
                        symbol.rarity === 'rare' ? '#3b82f6' :
                        symbol.rarity === 'uncommon' ? '#eab308' :
                        '#10b981',
                      transform: slotAnimations[index] ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                    <img 
                      src={symbol.sprite} 
                      alt={symbol.name}
                      className={`w-full h-full object-contain transition-all duration-200 ${
                        slotAnimations[index] 
                          ? 'blur-sm scale-110 animate-pulse' 
                          : 'hover:scale-110'
                      }`}
                      style={{
                        filter: slotAnimations[index] 
                          ? 'blur(3px) brightness(1.2) contrast(1.1)' 
                          : 'none',
                        transform: slotAnimations[index] 
                          ? 'translateY(-2px) scale(1.05)' 
                          : 'none'
                      }}
                      onError={(e) => {
                        console.error(`Error loading sprite for ${symbol.name}:`, e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    
                    {/* Indicador de rareza mejorado */}
                    <div 
                      className="absolute bottom-1 right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white/50 shadow-md"
                      style={{
                        backgroundColor: 
                          symbol.rarity === 'mythic' ? '#8b5cf6' :
                          symbol.rarity === 'legendary' ? '#ec4899' :
                          symbol.rarity === 'epic' ? '#f97316' :
                          symbol.rarity === 'rare' ? '#3b82f6' :
                          symbol.rarity === 'uncommon' ? '#eab308' :
                          '#10b981'
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botón de jugar optimizado para mobile */}
          <div className="flex justify-center mb-6 px-2">
            <button
              onClick={handleSpin}
              disabled={userFichas < COST_PER_SPIN || spinning}
              className={`relative group overflow-hidden px-6 py-3 sm:px-8 sm:py-4 lg:px-12 lg:py-5 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 ${
                userFichas < COST_PER_SPIN || spinning
                  ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white border-yellow-300 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 animate-pulse'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {spinning ? (
                  <>
                    <img 
                      src="/pokeball.png" 
                      alt="Loading" 
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 animate-spin"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="animate-pulse text-sm sm:text-base">Girando...</span>
                  </>
                ) : (
                  <span>JUGAR</span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Tabla de premios expandible */}
        <div className="w-full max-w-xl mx-auto">
          <div className="text-center mb-3 sm:mb-4">
            <button
              onClick={() => setShowPrizeTable(!showPrizeTable)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 hover:bg-white/90 backdrop-blur-lg border border-gray-200/70 rounded-xl shadow-lg transition-all hover:shadow-xl"
            >
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
                🏆 Premios
              </h3>
              <span className={
                showPrizeTable ? 'text-gray-600 transition-transform duration-200 rotate-180' : 'text-gray-600 transition-transform duration-200'
              }>
                ▼
              </span>
            </button>
          </div>
          
          {showPrizeTable && (
            <div className="bg-white/60 backdrop-blur-md border border-gray-200/70 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
                {[
                  { combo: '3x Iniciales', prize: '2 Pokéballs', rarity: 'common' },
                  { combo: '3x Pikachu/Eevee', prize: '2+ Superballs', rarity: 'uncommon' },
                  { combo: '3x Raros', prize: '1-3 Superballs', rarity: 'rare' },
                  { combo: '3x Épicos', prize: '2-4 Ultraballs', rarity: 'epic' },
                  { combo: '3x Mew', prize: '¡5 de cada + Master!', rarity: 'legendary' },
                  { combo: '3x Mewtwo', prize: '¡3 MASTERBALLS!', rarity: 'mythic' },
                ].map((item, index) => (
                  <div key={index} className={
                    item.rarity === 'legendary' || item.rarity === 'mythic' 
                      ? 'bg-white/70 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-sm transition-all hover:shadow-md hover:bg-white/80 border border-gray-100/50 ring-1 ring-yellow-300/50' 
                      : 'bg-white/70 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-sm transition-all hover:shadow-md hover:bg-white/80 border border-gray-100/50'
                  }>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">{item.combo}</span>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs text-gray-600">{item.prize}</span>
                        <div className={
                          item.rarity === 'mythic' ? 'w-2 h-2 rounded-full bg-purple-500' :
                          item.rarity === 'legendary' ? 'w-2 h-2 rounded-full bg-pink-500' :
                          item.rarity === 'epic' ? 'w-2 h-2 rounded-full bg-orange-500' :
                          item.rarity === 'rare' ? 'w-2 h-2 rounded-full bg-blue-500' : 
                          item.rarity === 'uncommon' ? 'w-2 h-2 rounded-full bg-yellow-500' :
                          'w-2 h-2 rounded-full bg-green-500'
                        }></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white/40 backdrop-blur-sm p-2 sm:p-3 border-t border-gray-200/50">
                <p className="text-xs text-gray-700 text-center">
                  También hay premios por 2 símbolos raros o 1 legendario
                </p>
                <p className="text-xs text-blue-600 text-center mt-1 font-medium">
                  ✨ Nuevos: Eevee, Gyarados, Garchomp
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional optimizada para mobile */}
        <div className="mt-2 sm:mt-3 lg:mt-4 text-center px-2">
          <p className="text-xs sm:text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full inline-block border border-gray-200/70 shadow-md">
            Las pokéballs se agregan automáticamente a tu inventario
          </p>
        </div>
      </div>
    </div>
  );
}
