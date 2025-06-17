import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { eventPokemon } from '@/data/sv/eventPokemon';
import { motion } from 'framer-motion';
import { getNatureEffectShortEn, getNatureEffectText } from '@/lib/natureEffects';
import { Moves } from '@/data/sv/moves';
import { teraSprites, typeColors } from '@/data/pokemonConstants';
import { preciosPokemon } from './preciospokemon';
import { addPokemonToTeam } from '../../lib/equipoStorage';
import { PlusSquare, DollarSign } from 'lucide-react';
import { Pokedex } from '@/data/sv/pokedex_module';
import { getGenderForSpecies } from '@/lib/pokedexHelper';
import { formatNameForPokedexLookup } from './equipoUtils'; // Import from equipoUtils
import { getShowdownCryUrl } from '@/lib/getShowdownCryUrl'; // Importa la función para obtener el cry
import { playSoundEffect } from '@/lib/soundEffects';

function capitalizeFirst(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Helper para obtener el sprite de Pokemondb
function getSprite(p, shiny) {
  if (!p || !p.species) return null;
  let name = p.species.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (name === "zarude") name = "zarude";
  if (name === "meloetta") name = "meloetta";
  if (name === "rayquaza") name = "rayquaza";
  if (name === "mew") name = "mew";
  if (name === "walkingwake") name = "walking-wake";
  if (name === "ironleaves") name = "iron-leaves";
  // Add specific cases for missing sprites in getSprite function
  if (name === "ferromole") name = "iron-boulder";
  if (name === "ferrotesta") name = "iron-crown";
  if (name === "ragingbolt") name = "raging-bolt";
  if (name === "ironboulder") name = "iron-boulder";
  if (name === "ironcrown") name = "iron-crown";
  const shinyStr = shiny ? "shiny" : "normal";
  return `https://img.pokemondb.net/sprites/home/${shinyStr}/${name}.png`;
}

// Helper para Tera Sprite
const getTeraSpriteKey = (tera) => {
  if (!tera) return '';
  const key = Object.keys(teraSprites).find(k => k.toLowerCase() === tera.toLowerCase());
  return key || '';
};

export default function Laboratorio() {
  const { selectedGame } = useGame();
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const cryAudioRef = useRef<HTMLAudioElement | null>(null); // Ref para el audio

  useEffect(() => {
    if (!selectedGame) navigate('/');
  }, [selectedGame, navigate]);

  // Handler para expandir tarjeta y reproducir cry
  const handleExpand = (idx: number, species: string) => {
    const isExpanding = idx !== expandedIndex;
    setExpandedIndex(isExpanding ? idx : null);
    if (isExpanding) {
      // Solo reproducir el cry al expandir
      const cryUrl = getShowdownCryUrl(species);
      if (cryUrl) {
        if (cryAudioRef.current) {
          cryAudioRef.current.pause();
          cryAudioRef.current.currentTime = 0;
        }
        const audio = new window.Audio(cryUrl);
        cryAudioRef.current = audio;
        audio.volume = 0.1; // volumen bajo
        audio.addEventListener('loadedmetadata', () => {
          if (audio.duration && !isNaN(audio.duration)) {
            audio.currentTime = audio.duration * 0.2; // reproducir desde el 20%
          }
          audio.play();
        });
        setTimeout(() => {
          if (audio.paused) audio.play();
        }, 500);
      }
    } else {
      // Solo reproducir el efecto de sonido al contraer
      playSoundEffect('notification', 0.1);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 pt-8 text-center min-h-screen bg-gradient-to-b from-transparent via-fuchsia-50 to-purple-50">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center">
        Pokémon de Eventos
      </h1>
      <p className="text-sm text-gray-600 max-w-md mb-6">
        Estos Pokémon se obtienen mediante intercambios especiales y son 100% compatibles con Pokémon HOME. ¡Explora sus detalles únicos y agrégalos a tu colección!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto mt-8">
        {eventPokemon.map((p, idx) => {
          // Lookup Pokedex entry for legendary detection and gender
          const pokedexEntry = Pokedex[formatNameForPokedexLookup(p.species)];
          // Calculate price (same logic as equipo.tsx)
          let price = preciosPokemon.normal;
          if (pokedexEntry && pokedexEntry.tags?.some(tag => ["Legendary", "Mythical", "Sub-Legendary", "Restricted Legendary"].includes(tag))) {
            price = preciosPokemon.legendarioSingular;
          }
          if (p.isShiny) price += preciosPokemon.incrementoShiny;

          // Normalize gender to GenderName
          let gender: 'M' | 'F' | 'N' = 'N';
          if (typeof p.gender === 'string' && ['M', 'F', 'N'].includes(p.gender)) {
            gender = p.gender as 'M' | 'F' | 'N';
          } else {
            const g = getGenderForSpecies(p.species);
            if (g) gender = g;
          }

          // Handler for adding to team (ensures ParsedPokemon structure)
          const handleAddToTeam = (e: React.MouseEvent) => {
            e.stopPropagation();
            addPokemonToTeam({
              ...p,
              gender,
            });
            alert(`${p.species} añadido al equipo!`);
          };

          const spriteUrl = getSprite(p, p.isShiny);
          const teraTypeSpriteKey = getTeraSpriteKey(p.teraType || "");
          const teraTypeSprite = teraTypeSpriteKey ? teraSprites[teraTypeSpriteKey] : undefined;

          return (
            <motion.div
              key={p.name + idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)" }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row gap-4 items-center border border-gray-200/70 dark:border-gray-700/60 hover:shadow-2xl transition-all min-h-[220px]"
            >
              {/* Compressed View */}
              <div onClick={() => handleExpand(idx, p.species)} className="cursor-pointer w-full">
                <div className="relative flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 mx-auto">
                  <img
                    src={spriteUrl}
                    alt={p.name}
                    className={p.isShiny ? "w-full h-full object-contain drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" : "w-full h-full object-contain"}
                    onError={e => (e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png')}
                  />
                  {p.isShiny && (
                    <span className="absolute top-1 right-1 z-10 text-yellow-400 text-2xl animate-bounce pointer-events-none select-none drop-shadow-lg">✨</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-start gap-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{p.species === "ferromole" ? "Iron Boulder" : p.species === "ferrotesta" ? "Iron Crown" : capitalizeFirst(p.species)}</h2>
                    <span className="badge bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded">Lvl {p.level}</span>
                    {p.gender && p.gender !== "N" && (
                      <span className={p.gender === "M" ? "bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold"}>{p.gender}</span>
                    )}
                    {p.event && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 text-gray-900 text-[10px] font-semibold shadow-sm">{p.event}</span>
                    )}
                    {/* Precio */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-green-400 to-green-600 border border-green-500 text-white text-xs font-semibold shadow min-w-[60px] h-6 ml-1">
                      <DollarSign size={13} className="mr-1 opacity-80" />
                      <span>${price.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </span>
                  </div>
                  {p.eventDetails && (
                    <div className="mt-1 mb-1 text-xs text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2 w-full shadow-sm">
                      <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-0.5">{p.eventDetails.title}</div>
                      <div className="mb-0.5">{p.eventDetails.description}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded View */}
              {expandedIndex === idx && (
                <div className="mt-4 w-full">
                  {/* Types y Tera */}
                  <div className="flex flex-wrap gap-1 items-center mt-1">
                    {p.teraType && teraTypeSprite && (
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-normal shadow-sm transition-colors border-gray-300 dark:border-gray-600 ${typeColors[capitalizeFirst(p.teraType)] || 'bg-gray-400 text-white'} text-white`}>
                        <img src={teraTypeSprite} alt={`Teratipo ${p.teraType}`} className="w-4 h-4 object-contain mr-1" />
                        {capitalizeFirst(p.teraType)}
                      </span>
                    )}
                  </div>
                  {/* Habilidad */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate mt-0.5 flex items-center">
                    <span className="font-semibold">Habilidad:</span>
                    <span className="ml-1">{capitalizeFirst(p.ability)}</span>
                  </p>
                  {/* Naturaleza */}
                  <div className="flex items-center mt-0.5">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      <span className="font-semibold">Naturaleza:</span>
                      <span className="ml-1">{capitalizeFirst(p.nature)}</span>
                    </p>
                    <span
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-normal shadow-sm transition-colors ml-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-300 bg-transparent"
                      title={getNatureEffectText(p.nature)}
                    >
                      {getNatureEffectShortEn(p.nature)}
                    </span>
                  </div>
                  {/* Objeto */}
                  {p.item && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 truncate flex items-center">
                      <span className="font-semibold">Objeto:</span>
                      <span className="ml-1">{capitalizeFirst(p.item)}</span>
                    </p>
                  )}
                  {/* Moves */}
                  <div className="mt-2 w-full">
                    <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-1">Movimientos</h3>
                    <ul className="flex flex-wrap gap-2">
                      {(p.moves || []).map((move, i) => {
                        const cleanedMoveName = move.startsWith('- ') ? move.substring(2) : move;
                        let moveKey = cleanedMoveName.toLowerCase().replace(/[^a-z0-9]/g, '');
                        let moveType = Moves[moveKey]?.type || Moves[Object.keys(Moves).find(k => Moves[k].name.toLowerCase() === cleanedMoveName.toLowerCase()) || '']?.type;
                        return (
                          <li key={i} className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                            <span className="truncate">{cleanedMoveName}</span>
                            {moveType && (
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] shadow-sm border border-gray-300 dark:border-gray-600 ml-1 text-white font-normal ${typeColors[moveType] || 'bg-gray-400'}`}>{moveType}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  {/* IVs/EVs */}
                  <div className="flex flex-row gap-4 mt-2 w-full">
                    <div className="w-1/2">
                      <strong className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1 bg-zinc-100 dark:bg-zinc-800 py-0.5 px-2 rounded-lg text-center">IVs</strong>
                      <div className="grid grid-cols-3 gap-1">
                        {['hp','atk','def','spa','spd','spe'].map(stat => (
                          <div key={stat} className="flex flex-col items-center">
                            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">{stat.toUpperCase()}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{(p.IVs && typeof p.IVs[stat] === 'number') ? p.IVs[stat] : 31}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-1/2">
                      <strong className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1 bg-zinc-100 dark:bg-zinc-800 py-0.5 px-2 rounded-lg text-center">EVs</strong>
                      <div className="grid grid-cols-3 gap-1">
                        {['hp','atk','def','spa','spd','spe'].map(stat => (
                          <div key={stat} className="flex flex-col items-center">
                            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">{stat.toUpperCase()}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{(p.EVs && typeof p.EVs[stat] === 'number') ? p.EVs[stat] : 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Botón añadir al equipo (siempre visible, fuera del expand/collapse) */}
              <button
                onClick={handleAddToTeam}
                className="mt-2 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 border border-blue-500 text-white text-xs font-semibold shadow hover:from-blue-500 hover:to-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Añadir este Pokémon al equipo"
              >
                <PlusSquare size={15} className="mr-1 opacity-80" />
                Añadir al equipo
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
