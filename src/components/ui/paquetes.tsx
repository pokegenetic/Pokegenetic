import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { eventPokemon } from '@/data/sv/eventPokemon';
import { motion } from 'framer-motion';
import { getNatureEffectShortEn, getNatureEffectText } from '@/lib/natureEffects';
import { Moves } from '@/data/sv/moves';
import { teraSprites, typeColors } from '@/data/pokemonConstants';
import { items_sv } from '@/data/sv/items_sv';
import { cn } from '@/lib/utils';
import './shiny-pulse.css';
import './prismatic.css';
import MagnetizeButtonEdicionTarjeta from './magnetize-button-ediciontarjeta'; // Added import
import { DollarSign } from 'lucide-react';
import { Pokedex } from '@/data/sv/pokedex_module';
import { formatNameForPokedexLookup } from './equipoUtils';
import { preciosPokemon, descuentos } from './preciospokemon'; // Importar precios y descuentos
import packSetup from './packsetup'; // Import the pack setup configuration
import { parseShowdownText, parseShowdownTextToArray } from '@/lib/parseShowdown';
import { getPokemonTeam, setPokemonTeam, addHomePackToTeam } from '@/lib/equipoStorage';
import type { PackEntry, HomePackEntry } from './equipo';
import paldeaFullImg from '@/img/packhome/paldeafull.png';
import { playSoundEffect } from '@/lib/soundEffects';

function capitalizeFirst(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Helper para obtener el sprite de Pokemondb
function getSprite(p, shiny) {
  if (!p || !p.species) return null;
  const paradoxPokemon = [
    "great-tusk", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing", "sandy-shocks",
    "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns"
  ];
  let name = p.species.toLowerCase();
  if (paradoxPokemon.includes(name)) {
    // Para paradox, conservar los guiones
    return `https://img.pokemondb.net/sprites/scarlet-violet/normal/${name}.png`;
  }
  // Para el resto, eliminar caracteres especiales
  name = name.replace(/[^a-z0-9]/g, "");
  if (name === "zarude") name = "zarude";
  if (name === "meloetta") name = "meloetta";
  if (name === "rayquaza") name = "rayquaza";
  if (name === "mew") name = "mew";
  if (name === "walkingwake") name = "walking-wake";
  if (name === "ironleaves") name = "iron-leaves";
  if (name === "ferromole") name = "iron-boulder";
  if (name === "ferrotesta") name = "iron-crown";
  if (name === "ragingbolt") name = "raging-bolt";
  if (name === "ironboulder") name = "iron-boulder";
  if (name === "ironcrown") name = "iron-crown";
  const shinyStr = shiny ? "shiny" : "normal";
  return `https://img.pokemondb.net/sprites/home/${shinyStr}/${name}.png`;
}

// Helper para obtener el sprite del objeto
function getItemSprite(itemName: string | undefined) {
  if (!itemName || itemName.toLowerCase() === 'none') {
    // Always show generic Pokéball sprite if no item is set
    return 'https://serebii.net/itemdex/sprites/pokeball.png';
  }
  const itemData = items_sv.find(item => item.name.toLowerCase() === itemName.toLowerCase());
  return itemData ? itemData.sprite : 'https://serebii.net/itemdex/sprites/pokeball.png'; // Fallback si no se encuentra
}

// Helper para Tera Sprite
const getTeraSpriteKey = (tera) => {
  if (!tera) return '';
  const key = Object.keys(teraSprites).find(k => k.toLowerCase() === tera.toLowerCase());
  return key || '';
};

// Helper function para calcular el precio de un Pokémon
function calculatePokemonPrice({ isLegendary, isShiny }: { isLegendary: boolean; isShiny: boolean }): number {
  let price = preciosPokemon.normal;

  if (isLegendary) {
    price += preciosPokemon.legendarioSingular;
  }

  if (isShiny) {
    price += preciosPokemon.incrementoShiny;
  }

  return price;
}

// Helper function para aplicar descuentos
function applyDiscounts(totalPrice: number, teamSize: number): number {
  if (teamSize >= descuentos.porEquipoGrande.cantidadMinimaPokemon) {
    const discount = (totalPrice * descuentos.porEquipoGrande.porcentajeDescuento) / 100;
    totalPrice -= discount;
  }

  return totalPrice;
}

// Helper para obtener la URL del cry de Showdown
function getShowdownCryUrl(species: string): string {
  if (!species) return '';
  let name = species.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Paradox sin guion
  const paradox = [
    'greattusk','screamtail','brutebonnet','fluttermane','slitherwing','sandyshocks',
    'irontreads','ironbundle','ironhands','ironjugulis','ironmoth','ironthorns',
    'roaringmoon','ironvaliant','walkingwake','ironleaves','gougingfire','ragingbolt','ironboulder','ironcrown','pecharunt'
  ];
  if (paradox.includes(name)) {
    name = name.replace(/-/g, '');
  }
  // Nidoran
  if (species.toLowerCase() === 'nidoran♀' || species.toLowerCase() === 'nidoran-f') return 'https://play.pokemonshowdown.com/audio/cries/nidoranf.mp3';
  if (species.toLowerCase() === 'nidoran♂' || species.toLowerCase() === 'nidoran-m') return 'https://play.pokemonshowdown.com/audio/cries/nidoranm.mp3';
  // Oricorio formas
  if (species.toLowerCase().startsWith('oricorio')) {
    if (species.toLowerCase().includes('pau')) return 'https://play.pokemonshowdown.com/audio/cries/oricorio-pau.mp3';
    if (species.toLowerCase().includes('pom')) return 'https://play.pokemonshowdown.com/audio/cries/oricorio-pompom.mp3';
    if (species.toLowerCase().includes('sensu')) return 'https://play.pokemonshowdown.com/audio/cries/oricorio-sensu.mp3';
    return 'https://play.pokemonshowdown.com/audio/cries/oricorio.mp3';
  }
  // Kommo-o
  if (name === 'kommoo') return 'https://play.pokemonshowdown.com/audio/cries/kommoo.mp3';
  // Slowpoke Galar y similares
  if (species.toLowerCase().includes('galar')) {
    name = species.toLowerCase().replace(/ /g, '-');
    return `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`;
  }
  // Default
  return `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`;
}

export default function Paquetes() {
  const { selectedGame, addPokemonToTeam } = useGame(); // Import addPokemonToTeam
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false); // New state to track interaction
  const cryAudioRef = useRef<HTMLAudioElement | null>(null); // Ref for cry playback
  const [activeTab, setActiveTab] = useState<'intercambio' | 'home'>('intercambio');
  const [isShiny, setIsShiny] = useState(false);
  const [trainerName, setTrainerName] = useState('');

  useEffect(() => {
    if (!selectedGame) {
      console.warn('No se ha seleccionado un juego. Redirigiendo a la página principal.');
      navigate('/');
    }
  }, [selectedGame, navigate]);

  useEffect(() => {
    if (cryAudioRef.current) {
      cryAudioRef.current.pause();
      cryAudioRef.current.currentTime = 0;
      cryAudioRef.current = null;
    }
    if (expandedIndex === null || !eventPokemon[expandedIndex]) {
      return;
    }
    const currentPokemon = eventPokemon[expandedIndex];
    const cryUrl = getShowdownCryUrl(currentPokemon.species);
    if (!cryUrl) return;
    const audio = new Audio(cryUrl);
    audio.volume = 0.3;
    cryAudioRef.current = audio;
    audio.play().catch((error) => {
      console.warn(`Cry playback: Failed to play ${cryUrl} for ${currentPokemon.species}. Error:`, error);
      if (cryAudioRef.current === audio) {
        cryAudioRef.current = null;
      }
    });
  }, [expandedIndex]); // Re-run when expanded card changes

  // Card animation variants for initial hint
  const cardHintVariants = {
    initial: { opacity: 0, y: 30 },
    animate: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: i * 0.08,
      }
    }),
    hint: (i) => ({
      scale: [1, 1.03, 1],
      transition: {
        delay: i * 0.08 + 0.5, // Stagger hint after initial entrance
        duration: 0.7,
        repeat: 0, // Play once
      }
    })
  };

  // Agrega un pack HOME al equipo
  function handleAddHomePack(trainerName: string, isShiny: boolean) {
    // Puedes ajustar el nombre y el precio según lo que corresponda
    const homePack: HomePackEntry = {
      type: 'homepack',
      packName: 'Pokedex Paldea + DLC',
      trainerName,
      isShiny,
      price: 12000, // O el precio que corresponda
      gameIcon: '/img/packhome/paldeafull.png',
    };
    addHomePackToTeam(homePack);
  }

  return (
    <div className="flex flex-col items-center px-4 pt-[1px] text-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center">
        ¡Descubre Paquetes Exclusivos!
      </h1>
      <div className="flex justify-center gap-2 mb-6">
        <button
          className={`text-sm px-2 py-2 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === 'intercambio' ? 'bg-white dark:bg-gray-900 border-yellow-400 text-yellow-600' : 'bg-gray-200 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300'}`}
          onClick={() => { playSoundEffect('notification', 0.13); setActiveTab('intercambio'); }}
        >
          Pack de
          intercambio
        </button>
        <button
          className={`text-sm px-2 py-2 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === 'home' ? 'bg-white dark:bg-gray-900 border-blue-400 text-blue-600' : 'bg-gray-200 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300'}`}
          onClick={() => { playSoundEffect('notification', 0.13); setActiveTab('home'); }}
        >
          Packs de
          Home
        </button>
      </div>
      {activeTab === 'intercambio' && (
        <>
          <p className="text-sm text-gray-600 max-w-md mb-6">
            Explora paquetes únicos que incluyen Pokémon especiales con características exclusivas. ¡Elige el que más te guste y agrégalo a tu colección!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto mt-8">
            {packSetup.map((pack, idx) => (
              <PackCard key={pack.name} pack={pack} />
            ))}
          </div>
        </>
      )}
      {activeTab === 'home' && (
        <div className="w-full max-w-xl mx-auto bg-white/60 dark:bg-gray-900/60 rounded-xl shadow-lg p-0 mt-4 flex flex-col items-center gap-6 transition-all">
          {/* Casilla desplegable para el pack masivo */}
          <div className="w-full">
            <button
              className="w-full flex flex-col items-stretch px-0 pt-0 pb-0 bg-white/80 dark:bg-gray-900/80 rounded-t-xl cursor-pointer focus:outline-none border-b border-gray-200 dark:border-gray-700 transition-all"
              onClick={() => { playSoundEffect('notification', 0.13); setExpandedIndex(expandedIndex === 999 ? null : 999); }}
              aria-expanded={expandedIndex === 999}
            >
              <img
                src={paldeaFullImg}
                alt="Pack Pokedex Paldea + DLC"
                className="w-full h-48 sm:h-60 object-contain rounded-t-xl shadow bg-white/70 dark:bg-gray-800/70"
                style={{ objectPosition: 'center top', flexShrink: 0, background: 'transparent' }}
              />
              <div className="flex flex-row items-center justify-between w-full px-4 py-3">
                <div className="flex flex-col items-start">
                  <span className="text-base font-bold text-blue-700 dark:text-blue-300">Pokedex Paldea + DLC</span>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white text-sm font-bold shadow border border-yellow-300 tracking-wide">$ {isShiny ? '16.990' : '14.990'}</span>
                </div>
                <span className={`ml-2 transition-transform ${expandedIndex === 999 ? 'rotate-180' : ''}`}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down text-gray-500"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </button>
            {/* Contenido expandible */}
            {expandedIndex === 999 && (
              <div className="px-6 pt-4 pb-6 bg-white/90 dark:bg-gray-900/90 rounded-b-xl flex flex-col items-center gap-4 animate-fade-in-up">
                <p className="text-gray-700 dark:text-gray-200 mb-3 text-sm text-center">
                  Incluye todos los Pokémon disponibles en Scarlet/Violet. <b>706 Pokémon</b> con origen Paldea para conseguir la recompensa de <b>Meloetta shiny</b> en Pokémon HOME.<br/>
                  El usuario puede elegir el nombre de entrenador y si los quiere shiny o no.<br/>
                  Todos los Pokémon tienen EVs en 0 y estadísticas perfectas (6 IVs).<br/>
                  <span className="text-xs text-gray-500">* Para más información sobre la recompensa de Meloetta shiny, revisa la sección de noticias de Pokémon HOME.</span>
                </p>
                <div className="flex flex-col gap-4 items-center w-full mb-2 justify-center">
                  {/* Toggle selector para shiny */}
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-xs font-normal text-gray-700 dark:text-gray-200">Normal</span>
                    <button
                      className={`relative w-12 h-7 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-200 focus:outline-none ${isShiny ? 'bg-yellow-400 dark:bg-yellow-500' : ''}`}
                      onClick={() => { playSoundEffect('notification', 0.13); setIsShiny(!isShiny); }}
                      type="button"
                      aria-pressed={isShiny}
                      tabIndex={0}
                    >
                      <span className={`absolute left-1 top-1 w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${isShiny ? 'translate-x-5 bg-yellow-500' : 'bg-white dark:bg-gray-400'}`}></span>
                    </button>
                    <span className="text-xs font-normal text-gray-700 dark:text-gray-200">Shiny</span>
                  </div>
                  {/* Input pequeño para nombre de entrenador */}
                  <div className="flex items-center gap-2 justify-center">
                    <label className="text-xs font-normal text-gray-700 dark:text-gray-200">Entrenador:</label>
                    <input
                      type="text"
                      className="px-1 py-0.5 w-24 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                      placeholder="Nombre"
                      value={trainerName}
                      onChange={e => { playSoundEffect('notification', 0.13); setTrainerName(e.target.value); }}
                      maxLength={12}
                    />
                  </div>
                </div>
                {/* Badge de precio (repetido para claridad en expandido) */}
                <div className="flex justify-center mb-2">
                  <span className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white text-lg font-bold shadow-lg border-2 border-yellow-300 drop-shadow-md tracking-wide animate-fade-in-up">
                    $ {isShiny ? '16.990' : '14.990'}
                  </span>
                </div>
                <MagnetizeButtonEdicionTarjeta
                  className="mt-2 px-6 py-2"
                  onClick={() => { 
                    playSoundEffect('notification', 0.13); 
                    handleAddHomePack(trainerName.trim(), isShiny);
                  }}
                  disabled={!trainerName.trim()}
                >
                  Agregar al equipo
                </MagnetizeButtonEdicionTarjeta>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Nuevo subcomponente para el carrusel de sprites ---
function SpriteCarousel({ pack, currentSpriteIndex }) {
  const currentPokemon = pack.pokemon[currentSpriteIndex];
  const isParadox = [
    "great-tusk", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing", "sandy-shocks",
    "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth", "iron-thorns"
  ].includes(currentPokemon.species);
  const spriteUrl = getSprite(currentPokemon, isParadox ? false : true);

  return (
    <div className="relative flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 mx-auto">
      <motion.img
        key={currentPokemon.species} // Ensure unique key for sprite
        src={spriteUrl}
        alt={currentPokemon.species}
        className="w-full h-full object-contain"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        onError={(e) => (e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png')}
      />
      
      {/* Badge shiny (top right) */}
      {(isParadox ? false : true) && (
        <div className="w-6 h-6 absolute right-0 top-1 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center text-yellow-400 font-bold text-xs z-20 bg-white/90 dark:bg-gray-800/90" 
        title="Shiny Pokémon ✨">
          ✨
        </div>
      )}

      {/* Badge género (center right) */}
      {currentPokemon.gender && currentPokemon.gender !== "N" && (
        <div className={cn(
          "w-6 h-6 absolute right-0 transform -translate-y-1/2 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center text-white font-bold text-xs z-10",
          currentPokemon.gender === "M" ? "bg-blue-300" : "bg-pink-300",
          // Adjust position based on whether shiny badge is present
          (isParadox ? false : true) ? "top-1/2" : "top-1/2"
        )} 
        title={currentPokemon.gender === "M" ? "Macho" : "Hembra"}>
          {currentPokemon.gender === "M" ? "♂" : "♀"}
        </div>
      )}

      {/* Badge ítem (bottom right) */}
      {currentPokemon.item && (
        <div className={cn(
          "w-6 h-6 absolute right-0 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center z-10 bg-white/90 dark:bg-gray-800/90",
          // Adjust position based on other badges
          currentPokemon.gender && currentPokemon.gender !== "N" ? "bottom-1" : 
          (isParadox ? false : true) ? "bottom-1" : "bottom-1"
        )} 
        title={`Objeto: ${currentPokemon.item}`}>
          {(() => {
            const itemObj = items_sv.find(i => i.name.toLowerCase() === currentPokemon.item.toLowerCase());
            return itemObj?.sprite ? (
              <img 
                src={itemObj.sprite} 
                alt={itemObj.name}
                className="w-4 h-4 object-contain"
              />
            ) : (
              <span className="text-[8px] font-bold text-gray-600 dark:text-gray-300">📦</span>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function PackCard({ pack }) {
  const navigate = useNavigate();
  const [currentSpriteIndex, setCurrentSpriteIndex] = useState(0);
  const [buttonKey, setButtonKey] = useState(Date.now()); // Unique key for button

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpriteIndex((prevIndex) => (prevIndex + 1) % pack.pokemon.length);
      setButtonKey(Date.now()); // Update button key to prevent animation reset
    }, 2000); // Change sprite every 2 seconds

    return () => clearInterval(interval);
  }, [pack.pokemon.length]);

  function addPokemonToTeamBatch(pokemonArray) {
    const packEntry = {
      type: 'pack' as const, // Ensure type is explicitly "pack"
      packName: pack.name,
      pokemons: pokemonArray,
      price: pack.price
    };
    const currentTeam = getPokemonTeam();
    const updatedTeam = [...currentTeam, packEntry];
    setPokemonTeam(updatedTeam);
    navigate('/equipo');
  }

  const isStartersPack = pack.name.toLowerCase().includes('starter');

  return (
    <div className="relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl p-5 flex flex-col gap-4 items-center border border-gray-200/70 dark:border-gray-700/60 hover:shadow-2xl transition-all min-h-[220px]">
      <SpriteCarousel pack={pack} currentSpriteIndex={currentSpriteIndex} />
      <h3 className="text-lg font-bold text-center">{pack.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{pack.description}</p>
      <div className="flex items-center justify-center gap-2 mt-2 mb-1">
        <DollarSign className="w-5 h-5 text-yellow-500" />
        <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{pack.price.toLocaleString()}</span>
      </div>
      <MagnetizeButtonEdicionTarjeta
        key={buttonKey} // Ensure button re-renders with unique key
        className="mt-2 px-4 py-2"
        onClick={() => {
          const nuevosPokemon = pack.pokemon.map(pokeObj => {
            if (pokeObj.showdownText) {
              const parsed = parseShowdownText(pokeObj.showdownText).pokemon;
              let gender = parsed.gender || 'N';
              if (typeof pokeObj.gender === 'string' && ['M', 'F', 'N'].includes(pokeObj.gender)) {
                gender = pokeObj.gender;
              }
              return { ...parsed, gender };
            } else {
              return pokeObj;
            }
          });
          playSoundEffect('notification', 0.13);
          addPokemonToTeamBatch(nuevosPokemon);
        }}
      >
        Agregar al equipo
      </MagnetizeButtonEdicionTarjeta>
    </div>
  );
}
