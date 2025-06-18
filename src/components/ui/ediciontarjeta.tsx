import { getLegalBasePokemon } from '../../data/sv/pokemonCreationUtils';
import basepokemonText from '../../data/sv/basepokemon.ts?raw';
import { BasePokemon as BasePokemonData } from '../../data/sv/basepokemon-util';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Magnet, ArrowLeft, Save } from 'lucide-react'
import pokeballIcon from '@/img/pokeball.png'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import { Pokedex } from '@/data/sv/pokedex_module'
import { Natures } from '@/data/sv/natures'
import { items_sv } from '@/data/sv/items_sv';
import { Abilities } from '@/data/sv/abilities'
import { Learnsets } from '@/data/sv/learnsets'
import { Moves } from '@/data/sv/moves'
import { ParsedPokemon, BasePokemon, PokedexEntry, StatKey, NatureEntry } from '@/types/pokemonTypes';
import { teraOptions, statsKeys, statLabels, statShowdownMap, typeColors, teraSprites, showdownTeraTypeMap } from '@/data/pokemonConstants';
import { parseShowdownText } from '@/lib/parseShowdown';
import { getGenderForSpecies, getRandomMovesForSpecies } from '../../lib/pokedexHelper';
import { Button } from "@/components/ui/button";
import MagnetizeButtonEdicionTarjeta from "@/components/ui/magnetize-button-ediciontarjeta";
import StatInputGroup from '@/components/EdicionTarjeta/StatInputGroup';
import PokemonDisplayCard from '@/components/EdicionTarjeta/PokemonDisplayCard';
import DetailField from '@/components/EdicionTarjeta/DetailField';
import MoveSelectorSlot from '@/components/EdicionTarjeta/MoveSelectorSlot';
import { getPokemonTeam, setPokemonTeam } from '../../lib/equipoStorage';
import { useGame } from '@/context/GameContext';
import { validatePokemon } from '../../lib/pokemonValidator';
import { playSoundEffect } from '@/lib/soundEffects';

// Define CSS for prismatic effect animation
import './prismatic.css';

function formatNameForPokemondb(name: string): string {
  if (!name) return '';
  let formattedName = name.toLowerCase();
  formattedName = formattedName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (formattedName.includes("nidoran") && formattedName.includes("♀")) return "nidoran-f";
  if (formattedName.includes("nidoran") && formattedName.includes("♂")) return "nidoran-m";
  if (formattedName === "indeedee-m") return "indeedee-male";
  if (formattedName === "indeedee-f") return "indeedee-female";
  if (formattedName === "meowstic-m") return "meowstic-male";
  if (formattedName === "meowstic-f") return "meowstic-female";
  if (formattedName === "basculegion-m") return "basculegion-male";
  if (formattedName === "basculegion-f") return "basculegion-female";
  formattedName = formattedName
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/[.'’:]/g, '')
    .replace(/\s+/g, '-');
  formattedName = formattedName
    .replace(/-alola$/, '-alolan')
    .replace(/-galar$/, '-galarian')
    .replace(/-hisui$/, '-hisuian')
    .replace(/-paldea$/, '-paldean')
    .replace(/-therian$/, '-therian')
    .replace(/-incarnate$/, '')
    .replace(/-origin$/, '-origin')
    .replace(/-sky$/, '-sky')
    .replace(/-land$/, '')
    .replace(/-zen$/, '-zen')
    .replace(/-standard$/, '')
    .replace(/-blade$/, '-blade')
    .replace(/-shield$/, '')
    .replace(/-sunshine$/, '-sunshine')
    .replace(/-overcast$/, '')
    .replace(/-school$/, '-school')
    .replace(/-solo$/, '')
    .replace(/-aria$/, '-aria')
    .replace(/-pirouette$/, '-pirouette')
    .replace(/-resolute$/, '-resolute')
    .replace(/-ordinary$/, '')
    .replace(/-strike$/, '')
    .replace(/-rapid-strike$/, '-rapid-strike')
    .replace(/-crowned$/, '-crowned')
    .replace(/-hero$/, '')
    .replace(/-eternamax$/, '-eternamax')
    .replace(/-hangry$/, '-hangry')
    .replace(/-full-belly$/, '')
    .replace(/-amped$/, '-amped')
    .replace(/-low-key$/, '-low-key')
    .replace(/-10%?$/, '-10')
    .replace(/-50%?$/, '')
    .replace(/-complete$/, '-complete')
    .replace(/-ash$/, '-ash')
    .replace(/-original-cap$/, '-original-cap')
    .replace(/-hoenn-cap$/, '-hoenn-cap')
    .replace(/-sinnoh-cap$/, '-sinnoh-cap')
    .replace(/-unova-cap$/, '-unova-cap')
    .replace(/-kalos-cap$/, '-kalos-cap')
    .replace(/-alola-cap$/, '-alola-cap')
    .replace(/-partner-cap$/, '-partner-cap')
    .replace(/-world-cap$/, '-world-cap')
    .replace(/-zero$/, '-zero')
    .replace(/-hero-form$/, '-hero')
    .replace(/-curly$/, '-curly')
    .replace(/-droopy$/, '-droopy')
    .replace(/-stretchy$/, '-stretchy')
    .replace(/-green-plumage$/, '-green-plumage')
    .replace(/-blue-plumage$/, '-blue-plumage')
    .replace(/-yellow-plumage$/, '-yellow-plumage')
    .replace(/-white-plumage$/, '-white-plumage')
    .replace(/-family-of-three$/, '-family-of-three')
    .replace(/-family-of-four$/, '')
    .replace(/^ogerpon-teal(-mask)?$/, 'ogerpon')
    .replace(/^ogerpon-(wellspring|hearthflame|cornerstone)(-mask)?$/, 'ogerpon-$1-mask');
  const specificNameMap: Record<string, string> = {
    'mr-mime': 'mr-mime',
    'mr-mime-galarian': 'mr-mime-galarian',
    'mr-rime': 'mr-rime',
    'type-null': 'type-null',
    'farfetchd': 'farfetchd',
    'farfetchd-galarian': 'farfetchd-galarian',
    'sirfetchd': 'sirfetchd',
    'ho-oh': 'ho-oh',
    'porygon-z': 'porygon-z',
    'kommo-o': 'kommo-o',
    'jangmo-o': 'jangmo-o',
    'hakamo-o': 'hakamo-o',
    'shaymin-land': 'shaymin-land',
    'shaymin-sky': 'shaymin-sky',
    'giratina-origin': 'giratina-origin',
    'darmanitan-standard': 'darmanitan',
    'darmanitan-galarian-standard': 'darmanitan-galarian',
    'aegislash-shield': 'aegislash',
    'wishiwashi-solo': 'wishiwashi',
    'meloetta-aria': 'meloetta-aria',
    'keldeo-ordinary': 'keldeo',
    'morpeko-full-belly': 'morpeko',
    'zygarde': 'zygarde',
    'zygarde-50': 'zygarde',
    'zacian': 'zacian',
    'zamazenta': 'zamazenta',
    'palafin': 'palafin-zero',
  };
  if (specificNameMap[formattedName]) {
    formattedName = specificNameMap[formattedName];
  }
  formattedName = formattedName.replace(/--+/g, '-').replace(/^-+|-+$/g, '');
  return formattedName;
}

function getSprite(name: string, shiny: boolean): string {
  const nameForUrl = formatNameForPokemondb(name);
  const shinyStr = shiny ? "shiny" : "normal";
  return `https://img.pokemondb.net/sprites/home/${shinyStr}/${nameForUrl}.png`;
}

const Edicion: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reproducir sonido de PC al entrar en edición
    playSoundEffect('pc', 0.1);
    
    // Delay visibility to sync with sound
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Adjust delay as needed, 100ms is a starting point
    return () => clearTimeout(timer);
  }, []);

  // Function to play sound on saving Pokémon edits
  const playSaveSound = () => {
    playSoundEffect('pokeballcatch', 0.1);
  };

  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as any) || {}
  // Accept both legacy and new keys for edit navigation
  const showdownText = state.pokemonShowdownText || state.showdownText as string | undefined;
  const editedIndex = state.editedPokemonIndex ?? state.editedIndex as number | undefined;
  const editedPackIndex = state.editedPackIndex as number | undefined;
  const editedPackPokemonIndex = state.editedPackPokemonIndex as number | undefined;
  const initialPokemonData = state.pokemon as ParsedPokemon | BasePokemon | undefined;
  const teamText = state.team as string | undefined

  // Detect edit mode: if we have a showdownText, we're editing
  const isEditMode = Boolean(showdownText)

  // If editing, parse all fields from showdownText
  let parsedFromShowdown: { pokemon: ParsedPokemon, messages: string[] } | undefined = undefined;
  if (isEditMode && showdownText) {
    parsedFromShowdown = parseShowdownText(showdownText);
  }

  // Consolidate initial Pokémon data: use parsed if available, else from navigation state
  const currentPokemon: ParsedPokemon | BasePokemon | undefined = parsedFromShowdown?.pokemon || initialPokemonData;

  // If not editing and no base Pokémon data, show error
  if (!currentPokemon) { // MODIFIED: Check consolidated currentPokemon
    return (
      <div className="p-4 text-center text-red-500">
        No se ha seleccionado ningún Pokémon. Vuelve a la pantalla de creación.
      </div>
    )
  }

  // Busca la entrada en tu Pokedex
  // Normaliza la clave para buscar en la Pokédex: quita guiones y espacios, y pasa a minúsculas
  function normalizePokedexKey(name: string) {
    return name.toLowerCase().replace(/[-\s]/g, '');
  }
  const rawKey = (currentPokemon as ParsedPokemon)?.species?.toLowerCase() || (currentPokemon as BasePokemon)?.name?.toLowerCase() || "";
  // Intenta primero la clave normal, luego la normalizada si falla
  let entry = Pokedex[rawKey] as PokedexEntry | undefined;
  if (!entry && rawKey) {
    // Buscar por clave normalizada
    const pokedexKeys = Object.keys(Pokedex);
    const normalizedRawKey = normalizePokedexKey(rawKey);
    const foundKey = pokedexKeys.find(k => normalizePokedexKey(k) === normalizedRawKey);
    if (foundKey) {
      entry = Pokedex[foundKey] as PokedexEntry;
    }
  }
  // Determine Pokémon generation from its Pokédex number
  const generation =
    entry && entry.num <= 151  ? 1 :
    entry && entry.num <= 251  ? 2 :
    entry && entry.num <= 386  ? 3 :
    entry && entry.num <= 493  ? 4 :
    entry && entry.num <= 649  ? 5 :
    entry && entry.num <= 721  ? 6 :
    entry && entry.num <= 809  ? 7 :
    entry && entry.num <= 898  ? 8 :
                       9
  if (!entry) {
    return (
      <div className="p-4 text-center text-red-500">
        No se encontró la entrada en la Pokédex para {(currentPokemon as BasePokemon)?.name || (currentPokemon as ParsedPokemon)?.species}. {/* MODIFIED: Use currentPokemon */}
      </div>
    )
  }

  // Opciones de naturalezas (no se usa natureOptions, renderizamos directamente)

  // Lista de ítems para el selector
  const itemsList = items_sv.map(item => ({ name: item.name, sprite: item.sprite }));

  // Movements available for this Pokémon in SV (Gen 9 learnset)
  // Usa la clave encontrada para moves y learnset
  const key = entry ? Object.keys(Pokedex).find(k => Pokedex[k] === entry) || rawKey : rawKey;
  const rawLearnset = Learnsets[key]?.learnset || {}
  const availableMoves: string[] = Object.entries(rawLearnset)
    .filter(([, versions]) => Array.isArray(versions) && (versions as string[]).some(v => typeof v === 'string' && v.startsWith('9')))
    .map(([move]) => move)

  // Memoize natureEntries
  const natureEntries = useMemo(() => {
    // Ensure Natures is correctly imported and has the expected structure
    if (typeof Natures !== 'object' || Natures === null) {
      console.error("Natures data is not loaded correctly!");
      return [];
    }
    return Object.values(Natures).map((nature: any) => ({ // TODO: Type 'nature' properly if possible
      name: nature.name,
      plus: nature.plus as StatKey | undefined, // Cast to StatKey
      minus: nature.minus as StatKey | undefined, // Cast to StatKey
    }));
  }, []); // Empty dependency array means this runs once, assuming Natures import is static

  // Define abilityValues based on the current Pokémon's entry
  const abilityValues = useMemo(() => {
    if (entry && entry.abilities) {
      // Filter out any undefined or null values and ensure they are strings
      return Object.values(entry.abilities).filter(ab => typeof ab === 'string') as string[];
    }
    return [];
  }, [entry]);

  // Estados de personalización
  const [nickname, setNickname] = useState<string>(() => {
    const pkmn = currentPokemon as ParsedPokemon;
    // Ensure pkmn, pkmn.name, and pkmn.species are valid before comparing
    if (pkmn && typeof pkmn.name === 'string' && typeof pkmn.species === 'string') {
      if (pkmn.name.toLowerCase() !== pkmn.species.toLowerCase()) {
        return pkmn.name; // pkmn.name is the nickname
      }
    }
    return ""; // No distinct nickname found, or data incomplete, so editor field is empty
  });
  const [chosenAbility, setChosenAbility] = useState<string>(() => {
    const initialAbility = (currentPokemon as ParsedPokemon)?.ability;
    if (initialAbility) return initialAbility;
    // Fallback to the first available ability if not set in currentPokemon
    if (entry && entry.abilities) {
      const abilities = Object.values(entry.abilities).filter(ab => typeof ab === 'string') as string[];
      if (abilities.length > 0) return abilities[0];
    }
    return '';
  })
  const [chosenNature, setChosenNature] = useState<string>(
    (currentPokemon as ParsedPokemon)?.nature || 'Serious' // MODIFIED: Default to "Serious"
  )
  const [chosenItem, setChosenItem] = useState<string>(
    (currentPokemon as ParsedPokemon)?.item || '' // Default to no item
  )
  // Estado de género
  const [gender, setGender] = useState<'M' | 'F' | 'N'>(() => {
    if ((currentPokemon as ParsedPokemon)?.gender) return (currentPokemon as ParsedPokemon).gender; // MODIFIED
    if (entry.gender === 'M' || (entry.genderRatio && entry.genderRatio.F === 0)) return 'M';
    if (entry.gender === 'F' || (entry.genderRatio && entry.genderRatio.M === 0)) return 'F';
    if (entry.gender === 'N' || (entry.genderRatio && entry.genderRatio.M === 0 && entry.genderRatio.F === 0)) return 'N';
    return 'M';
  })
  // Shiny toggle
  const [isShiny, setIsShiny] = useState<boolean>((currentPokemon as ParsedPokemon)?.isShiny || false); // MODIFIED
  // Level selector
  const [level, setLevel] = useState<number>((currentPokemon as ParsedPokemon)?.level || 50); // MODIFIED: Default level to 50
  // Controlled string for level input to manage clearing on focus
  const [inputLevel, setInputLevel] = useState<string>( ((currentPokemon as ParsedPokemon)?.level || 50).toString() ); // MODIFIED: Default inputLevel to 50
  const [chosenTera, setChosenTera] = useState<string>(
    (currentPokemon as ParsedPokemon)?.teraType || teraOptions[0].key // MODIFIED
  )
  // Animation state for Tera icon
  const [teraAnimating, setTeraAnimating] = useState(false);

  // Estado de validación
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Handler for Tera type change with animation
  const handleTeraChange = (value: string) => {
    setTeraAnimating(true);
    setChosenTera(value);
    playSoundEffect('notification', 0.15); // Sonido al cambiar tera type
    // Reset animation state after animation duration
    setTimeout(() => setTeraAnimating(false), 800);
  };
  const [movesSlots, setMovesSlots] = useState<string[]>(
    (currentPokemon as ParsedPokemon)?.moves && (currentPokemon as ParsedPokemon).moves.length > 0 // MODIFIED
      ? (currentPokemon as ParsedPokemon).moves.map(name => { // MODIFIED
          // Buscar el ID del movimiento por nombre (case-insensitive)
          const found = Object.entries(Moves).find(
            ([id, data]) => (data as any).name && (data as any).name.toLowerCase() === name.toLowerCase()
          );
          return found ? found[0] : name;
        })
      : (() => {
          // Group moves by type
          const pool = availableMoves.filter(m => Moves[m]?.type)
          const byType: Record<string, string[]> = {}
          pool.forEach(mv => {
            const type = Moves[mv].type as string
            if (!byType[type]) byType[type] = []
            byType[type].push(mv)
          })
          // Pick one random move per type, up to 4 types
          const types = Object.keys(byType).sort(() => Math.random() - 0.5).slice(0, 4)
          const initial = types.map(t => {
            const list = byType[t]
            return list[Math.floor(Math.random() * list.length)]
          })
          // If less than 4, fill remaining slots with random from pool
          const remainingPool = pool.filter(m => !initial.includes(m))
          while (initial.length < 4 && remainingPool.length) {
            const idx = Math.floor(Math.random() * remainingPool.length)
            initial.push(remainingPool.splice(idx, 1)[0])
          }
          return initial
        })()
  )
  // IVs & EVs
  const [IVs, setIVs] = useState<Record<StatKey, number>>(
    (currentPokemon as ParsedPokemon)?.IVs || Object.fromEntries(statsKeys.map(k => [k, 31])) as Record<StatKey, number> // MODIFIED
  );
  const [inputIVs, setInputIVs] = useState<Record<StatKey, string>>(
    (currentPokemon as ParsedPokemon)?.IVs ? Object.fromEntries(statsKeys.map(k => [k, String((currentPokemon as ParsedPokemon).IVs![k])])) as Record<StatKey, string> : Object.fromEntries(statsKeys.map(k => [k, '31'])) as Record<StatKey, string> // MODIFIED
  );
  const [EVs, setEVs] = useState<Record<StatKey, number>>(
    (currentPokemon as ParsedPokemon)?.EVs || Object.fromEntries(statsKeys.map(k => [k, 0])) as Record<StatKey, number> // MODIFIED
  );
  const [inputEVs, setInputEVs] = useState<Record<StatKey, string>>(
    (currentPokemon as ParsedPokemon)?.EVs ? Object.fromEntries(statsKeys.map(k => [k, String((currentPokemon as ParsedPokemon).EVs![k])])) as Record<StatKey, string> : Object.fromEntries(statsKeys.map(k => [k, '0'])) as Record<StatKey, string> // MODIFIED
  )

  // --- Handler for EV changes ---
  const handleEVChange = (stat: StatKey, value: string) => {
    const numValue = parseInt(value, 10);
    const newEVs = { ...EVs };
    const newInputEVs = { ...inputEVs };

    if (isNaN(numValue) || numValue < 0) {
      newEVs[stat] = 0;
      newInputEVs[stat] = '0';
    } else if (numValue > 252) {
      newEVs[stat] = 252;
      newInputEVs[stat] = '252';
    } else {
      newEVs[stat] = numValue;
      newInputEVs[stat] = value;
    }

    // Validate total EVs
    const totalEVs = Object.values(newEVs).reduce((sum, val) => sum + val, 0);
    if (totalEVs > 510) {
      // If total exceeds 510, revert this change for this stat
      // This is a simple way to handle it; more complex logic could distribute the remainder
      newEVs[stat] = EVs[stat]; // Revert to previous valid EV for this stat
      newInputEVs[stat] = inputEVs[stat]; // Revert input display as well
      // Optionally, provide user feedback here that total EVs cannot exceed 510
      console.warn("Total EVs cannot exceed 510. Change reverted for", stat);
    } else {
      setEVs(newEVs);
    }
    setInputEVs(newInputEVs);
  };

  // --- Source refs for particles ---
  const spriteRef = useRef<HTMLDivElement>(null)
  const IVsRef = useRef<HTMLDivElement>(null)
  const EVsRef = useRef<HTMLDivElement>(null)

  // --- Showdown Export Function ---

  // Helper function to get type color class for Tera Type
  const getTeraTypeColorClass = (teraType: string): string => {
    // Map English type names to color classes
    const typeColorMap: Record<string, string> = {
      'Steel': typeColors['steel'],
      'Water': typeColors['water'],
      'Stellar': 'bg-prismatic text-gray-800 shadow-md backdrop-blur-sm border-opacity-50',
      'Bug': typeColors['bug'],
      'Dragon': typeColors['dragon'],
      'Electric': typeColors['electric'],
      'Ghost': typeColors['ghost'],
      'Fire': typeColors['fire'],
      'Fairy': typeColors['fairy'],
      'Ice': typeColors['ice'],
      'Fighting': typeColors['fighting'],
      'Normal': typeColors['normal'],
      'Grass': typeColors['grass'],
      'Psychic': typeColors['psychic'],
      'Rock': typeColors['rock'],
      'Dark': typeColors['dark'],
      'Ground': typeColors['ground'],
      'Poison': typeColors['poison'],
      'Flying': typeColors['flying'],
    };
    
    return typeColorMap[teraType] || 'bg-gray-400 text-white';
  }

  function capitalizeMoveName(move: string) {
    return Moves[move]?.name || move;
  }

  function getMoveDisplayName(move: string): string {
    // Si es un ID válido, usa Moves[move]?.name
    if ((Moves as any)[move]?.name) return (Moves as any)[move].name;
    // Si no, busca por nombre case-insensitive
    const found = Object.entries(Moves).find(([, data]) => (data as any).name?.toLowerCase() === move?.toLowerCase());
    return found ? (found[1] as any).name : move;
  }

  const generateShowdownText = useCallback(() => {
    // Determine Gender
    let genderOutput = "";
    let finalGender = gender;
    if (finalGender === 'F') {
        genderOutput = " (F)";
    } else if (finalGender === 'M') {
        genderOutput = " (M)";
    }

    // Item - use chosenItem directly, do not default to "Ability Patch" here
    let itemName = chosenItem;

    // EVs: solo mostrar stats > 0
    const evEntries = Object.entries(EVs)
      .filter(([_, val]) => val > 0)
      .map(([stat, val]) => `${val} ${statLabels[stat as keyof typeof statLabels]}`)
      .join(" / ");

    // IVs: solo stats != 31
    const ivEntries = Object.entries(IVs)
      .filter(([_, val]) => val !== 31)
      .map(([stat, val]) => `${val} ${statLabels[stat as keyof typeof statLabels]}`);

    // Movimientos capitalizados
    const nonEmptyMoves = movesSlots.filter(move => move && move.trim() !== "");
    const movesOutput = nonEmptyMoves.length > 0
      ? nonEmptyMoves.map(move => `- ${getMoveDisplayName(move)}`).join("\n")
      : null;

    // Traducir teratipo using the new constant name
    const teraEnglish = chosenTera ? (showdownTeraTypeMap[chosenTera.toLowerCase()] || chosenTera) : '';

    // Primera línea: nickname (species) (gender) @ item
    const speciesName = entry.name;
    const namePart = nickname && nickname.trim() !== "" && nickname.trim().toLowerCase() !== speciesName.toLowerCase()
      ? `${nickname.trim()} (${speciesName})`
      : speciesName;
    
    // Conditionally add item to the first line
    const itemString = itemName ? ` @ ${itemName}` : "";
    const firstLine = `${namePart}${genderOutput}${itemString}`;

    // Construir líneas condicionales según estándar Showdown
    const lines = [
      firstLine,
      `Ability: ${chosenAbility || Object.values(entry.abilities || {})[0] || ''}`, // Ensure ability is robust
      level !== 50 ? `Level: ${level}` : null, // MODIFIED: Level condition and order
      isShiny ? `Shiny: Yes` : null, // MODIFIED: Order
      chosenTera ? `Tera Type: ${teraEnglish}` : null, // MODIFIED: Order
      evEntries ? `EVs: ${evEntries}` : null,
      chosenNature ? `${chosenNature} Nature` : null,
      ivEntries.length ? `IVs: ${ivEntries.join(" / ")}` : null,
      movesOutput // Use the processed movesOutput
    ].filter(Boolean);

    return lines.join("\n"); // Corrected from "\\\\n" to "\\n"
  }, [EVs, IVs, chosenAbility, chosenNature, chosenTera, isShiny, movesSlots, entry, nickname, level, chosenItem, gender]);

  // Validación en tiempo real
  useEffect(() => {
    const pokemonToValidate = {
      name: entry?.name || '',
      ability: chosenAbility,
      level: level,
      shiny: isShiny,
      IVs: IVs,
    };
    setValidationErrors(validatePokemon(pokemonToValidate));
  }, [entry, chosenAbility, level, isShiny, IVs]);

  // Guardar cambios: actualiza el texto showdown del equipo y vuelve
  async function handleSave() {
    // Reproducir sonido de guardado
    playSaveSound();
    
    // Verificar errores de validación antes de guardar
    const pokemonToValidate = {
      name: entry?.name || '',
      ability: chosenAbility,
      level: level,
      shiny: isShiny,
      IVs: IVs,
    };
    const errors = validatePokemon(pokemonToValidate);
    if (errors.length > 0) {
      alert('No se puede guardar: ' + errors.join(' '));
      return;
    }
    
    // 1. Construct the ParsedPokemon object from the current state
    const currentPokemonData: ParsedPokemon = {
        name: nickname && nickname.trim() !== "" ? nickname.trim() : entry?.name ?? "Unknown",
        species: entry?.name ?? "Unknown",
        item: chosenItem || undefined,
        ability: chosenAbility || Object.values(entry?.abilities || {})[0] as string || "Pressure",
        level: level || 50,
        isShiny: isShiny || false,
        teraType: chosenTera || undefined,
        EVs: EVs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        IVs: IVs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        nature: chosenNature || "Serious",
        moves: movesSlots || [],
        gender: gender || undefined,
        types: entry?.types || []
    };

    // 2. Genera el texto Showdown para el Pokémon actual que se está editando/creando.
    const currentPokemonShowdown = convertirAShowdown(currentPokemonData).trim();

    // 3. Actualiza el equipo usando el contexto
    try {
      // Use direct localStorage functions instead of context
      let team = getPokemonTeam();
      
      // Check if we're editing a Pokémon inside a pack
      if (isEditMode && typeof editedPackIndex === 'number' && typeof editedPackPokemonIndex === 'number') {
        // Update Pokémon within a pack
        const packEntry = team[editedPackIndex];
        if (packEntry && 'type' in packEntry && packEntry.type === 'pack') {
          // Update the specific Pokémon within the pack
          packEntry.pokemons[editedPackPokemonIndex] = currentPokemonData;
          setPokemonTeam([...team]); // Force new reference
        }
      } else if (isEditMode && typeof editedIndex === 'number') {
        // Update existing single Pokemon
        team[editedIndex] = currentPokemonData;
        setPokemonTeam([...team]); // Forzar nueva referencia para que el equipo y precios se actualicen
      } else {
        // Add new Pokemon
        team.push(currentPokemonData);
        setPokemonTeam([...team]);
      }
      
      // 4. Navega a la página del equipo
      navigate('/equipo');
      playSaveSound(); // Call this after successful save
    } catch (error) {
      console.error("Error saving Pokémon:", error);
      // Handle error (e.g., show notification, revert state, etc.)
    }
  }

  // Convertir a formato Showdown estándar
  const convertirAShowdown = (pokemonData: ParsedPokemon): string => { // MODIFIED: Parameter type to ParsedPokemon
    let showdown = "";
    const finalPokemon = { ...pokemonData }; // Create a mutable copy

    // Ensure item is set, default to empty string if not present
    if (!finalPokemon.item) {
        finalPokemon.item = ""; // Default to no item
    }

    // Ensure gender is set if species is known
    if (finalPokemon.species && (!finalPokemon.gender || finalPokemon.gender === "N")) {
        const determinedGender = getGenderForSpecies(finalPokemon.species);
        if (determinedGender && determinedGender !== 'N') { // Only set if a specific gender is determined
            finalPokemon.gender = determinedGender;
        } else {
            finalPokemon.gender = "N"; // Default to genderless if not M or F
        }
    }

    // Ensure moves are set if species is known
    if (finalPokemon.species && (!finalPokemon.moves || finalPokemon.moves.length === 0)) {
        finalPokemon.moves = getRandomMovesForSpecies(finalPokemon.species);
    }

    // Nickname (Species)
    if (finalPokemon.name && finalPokemon.name.toLowerCase() !== finalPokemon.species.toLowerCase()) {
        showdown += `${finalPokemon.name} (${finalPokemon.species})`;
    } else {
        showdown += finalPokemon.species;
    }

    // Gender (M/F)
    if (finalPokemon.gender && (finalPokemon.gender === "M" || finalPokemon.gender === "F")) {
        showdown += ` (${finalPokemon.gender})`;
    }

    // Item
    if (finalPokemon.item) { // Only add item if it exists
        showdown += ` @ ${finalPokemon.item}`; // Remove \n from here
    }

    // Ability: Add newline before Ability only if item was present. Otherwise, Ability is on the same line or starts a new one if no item.
    // Showdown format typically has Ability on a new line.
    // If there's an item, the item line does NOT end with \n.
    // The Ability line will start a new line.
    if (finalPokemon.item) {
        showdown += `\n`; // Add newline only if there was an item
    }
    if (finalPokemon.ability) showdown += `Ability: ${finalPokemon.ability}\n`;

    // Level (if not 50 - Showdown default)
    if (finalPokemon.level && finalPokemon.level !== 50) showdown += `Level: ${finalPokemon.level}\n`;

    // Shiny
    if (finalPokemon.isShiny) showdown += `Shiny: Yes\n`;

    // Tera Type
    if (finalPokemon.teraType) showdown += `Tera Type: ${finalPokemon.teraType}\n`;

    // EVs
    if (finalPokemon.EVs && Object.keys(finalPokemon.EVs).length > 0) { // MODIFIED: Access finalPokemon.EVs (uppercase)
        const evList = Object.entries(finalPokemon.EVs) // MODIFIED: Access finalPokemon.EVs (uppercase)
            .filter(([, value]) => (value as number) > 0) // MODIFIED: Cast value to number for comparison
            .map(([stat, value]) => `${value} ${statShowdownMap[stat.toLowerCase()] || stat.toUpperCase()}`)
            .join(" / ");
        if (evList) showdown += `EVs: ${evList}\n`;
    }

    // Nature
    if (finalPokemon.nature) showdown += `${finalPokemon.nature} Nature\n`;

    // IVs (if not all 31)
    if (finalPokemon.IVs && Object.keys(finalPokemon.IVs).length > 0) { // MODIFIED: Access finalPokemon.IVs (uppercase)
        const ivList = Object.entries(finalPokemon.IVs) // MODIFIED: Access finalPokemon.IVs (uppercase)
            .filter(([, value]) => (value as number) !== 31) // MODIFIED: Cast value to number for comparison
            .map(([stat, value]) => `${value} ${statShowdownMap[stat.toLowerCase()] || stat.toUpperCase()}`)
            .join(" / ");
        if (ivList) showdown += `IVs: ${ivList}\n`;
    }

    // Moves
    if (finalPokemon.moves && finalPokemon.moves.length > 0) {
        const movesList = finalPokemon.moves
            .filter(move => move && move.trim() !== "-")
            .map(move => `- ${Moves[move]?.name || move}`)
            .join("\n");
        if (movesList) showdown += `${movesList}\n`;
    }

    return showdown.trim();
  }

  // --- Particle Effects ---
  const controls = useAnimation();
  const [showParticles, setShowParticles] = useState(false);

  const startParticles = () => {
    setShowParticles(true);
    controls.start({
      opacity: 1,
      transition: { duration: 0.5 },
    });
  };

  const stopParticles = () => {
    controls.stop();
    setShowParticles(false);
  };

  // State for nature animation effects on EV boxes
  const [natureAffectedStats, setNatureAffectedStats] = useState<{ boosted: StatKey | null, reduced: StatKey | null }>({ boosted: null, reduced: null });
  const [isNatureEffectAnimating, setIsNatureEffectAnimating] = useState<boolean>(false);
  const natureAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle nature change and trigger EV stat animation
  useEffect(() => {
    if (natureAnimationTimeoutRef.current) {
      clearTimeout(natureAnimationTimeoutRef.current);
    }
    setIsNatureEffectAnimating(false); // Reset animation state immediately

    if (!Array.isArray(natureEntries)) {
        return; 
    }

    const nature = natureEntries.find(n => n.name === chosenNature);
    if (nature && nature.plus && nature.minus && nature.plus !== nature.minus) {
      setNatureAffectedStats({ boosted: nature.plus as StatKey, reduced: nature.minus as StatKey });
      setIsNatureEffectAnimating(true); // Start animation
      natureAnimationTimeoutRef.current = setTimeout(() => {
        setIsNatureEffectAnimating(false); // End animation after 1.5s
      }, 1500);
    } else {
      // Reset if nature is neutral or has no distinct effects
      setNatureAffectedStats({ boosted: null, reduced: null });
    }

    return () => {
      if (natureAnimationTimeoutRef.current) {
        clearTimeout(natureAnimationTimeoutRef.current);
      }
    };
  }, [chosenNature, natureEntries]);

  // Definir showdownEntries para la precarga de datos base
  const showdownEntries = basepokemonText.split(/\n(?=[A-Z][^\n]*\nAbility:)/g).filter(Boolean);

  // Precarga de datos base para Pokémon especiales
  useEffect(() => {
    if (currentPokemon) {
      const basePokemon = getLegalBasePokemon({
        name: (currentPokemon as ParsedPokemon)?.species || (currentPokemon as BasePokemon)?.name,
        gender: (currentPokemon as ParsedPokemon)?.gender,
        shiny: (currentPokemon as ParsedPokemon)?.isShiny
      }, showdownEntries);

      if (basePokemon) {
        setLevel(basePokemon.level || 100);
        setChosenAbility(basePokemon.ability || '');
        setChosenNature(basePokemon.nature || 'Serious');
        setMovesSlots(basePokemon.moves && basePokemon.moves.length ? basePokemon.moves : ['-', '-', '-', '-']);
        if (basePokemon.ivs) {
          // Convertir los IVs de basepokemon.ts al formato esperado por el componente
          const mappedIVs = {
            hp: basePokemon.ivs.HP || 31,
            atk: basePokemon.ivs.Atk || 31,
            def: basePokemon.ivs.Def || 31,
            spa: basePokemon.ivs.SpA || 31,
            spd: basePokemon.ivs.SpD || 31,
            spe: basePokemon.ivs.Spe || 31
          };
          setIVs(mappedIVs);
          // TODO: Implementar setIVsLocked cuando esté disponible
        }
        if (typeof basePokemon.shiny === 'boolean') {
          setIsShiny(basePokemon.shiny);
        }
      }
    }
  }, [currentPokemon, showdownEntries]);

  // --- Debug Info ---
  const debugInfo = `
  --- Parsed Pokémon Data ---
  ${JSON.stringify(parsedFromShowdown?.pokemon, null, 2)}
  --- Showdown Text ---
  ${showdownText}
  --- Team Text ---
  ${teamText}
  --- Edición Detections ---
  isEditMode: ${isEditMode}
  pokemon: ${JSON.stringify(currentPokemon)}
  `;

  // --- VISUAL STRUCTURE FROM edicion.tsx ---
  if (!isVisible) {
    return null; // Or a loading spinner
  }

  return (
    <div className="component-fade-in-1s">
      <div className="flex justify-center items-center min-h-screen w-full px-2">
        <div className="relative backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl shadow-lg p-3 sm:p-5 md:p-5 w-full max-w-[350px] sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-2 border border-gray-200/70 dark:border-gray-700/60 mt-1 mb-1 transition-all duration-200">
          <button
            onClick={() => navigate('/equipo')}
            className="absolute top-3 right-3 bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold py-1 px-3 rounded-lg shadow-md transition-colors duration-150 z-10 flex items-center gap-1"
            aria-label="Volver al equipo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Volver
          </button>
          {/* Sprite y datos principales */}
          <div className="mt-6">
            {/* Defensive: Ensure getSprite is a function before passing */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <PokemonDisplayCard
                entry={entry}
                currentPokemonName={(currentPokemon as ParsedPokemon)?.species || (currentPokemon as BasePokemon)?.name || ''}
                isShiny={isShiny}
                chosenTera={chosenTera}
                teraAnimating={teraAnimating}
                getSprite={typeof getSprite === 'function' ? getSprite : (() => '')}
                itemSpriteUrl={(() => {
                  const itemObj = items_sv.find(i => i.name === chosenItem);
                  return itemObj ? itemObj.sprite : undefined;
                })()}
              />
            </div>
          </div>
          <div className="mt-1">
            <div className="flex flex-row items-center justify-between w-full gap-1">
              <div className="w-1/3">
                <label htmlFor="nickname" className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Mote:</label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-1.5 py-0.5 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
                  maxLength={20}
                />
              </div>
              <div className="flex flex-row items-end gap-2 justify-end w-2/3">
                <div className="flex flex-col items-center">
                  <label htmlFor="shiny-toggle" className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Shiny</label>
                  <div className="relative">
                    <button 
                      id="shiny-toggle"
                      type="button" 
                      onClick={() => {
                        setIsShiny(!isShiny);
                        playSoundEffect('shiny', 0.2); // Sonido al activar/desactivar shiny
                      }} 
                      className={cn(
                        'w-12 h-6 flex items-center rounded-full transition-colors p-1',
                        isShiny ? 'bg-yellow-300' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                      aria-pressed={isShiny}
                    >
                      <span 
                        className={cn(
                          'block w-4 h-4 rounded-full transition-transform bg-white shadow-md flex items-center justify-center',
                          isShiny ? 'translate-x-6 bg-yellow-100' : 'translate-x-0'
                        )}
                      >
                        {isShiny && <span className="text-[10px]">✨</span>}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <label htmlFor="gender-toggle" className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Género</label>
                  <div className="relative">
                    <button 
                      id="gender-toggle"
                      type="button" 
                      onClick={() => {
                        setGender(gender === 'M' ? 'F' : 'M');
                        playSoundEffect('notification', 0.1); // Sonido al cambiar género
                      }} 
                      className={cn(
                        'w-12 h-6 flex items-center rounded-full transition-colors p-1',
                        gender === 'F' ? 'bg-pink-300' : 'bg-blue-300'
                      )}
                      aria-pressed={gender === 'F'}
                    >
                      <span 
                        className={cn(
                          'block w-4 h-4 rounded-full transition-transform bg-white shadow-md flex items-center justify-center text-xs',
                          gender === 'F' ? 'translate-x-6 text-pink-500' : 'translate-x-0 text-blue-500'
                        )}
                      >
                        {gender === 'F' ? '♀' : '♂'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <label htmlFor="level-input" className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Nivel</label>
                  <div className="relative">
                    <input
                      id="level-input"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min={1}
                      max={100}
                      value={inputLevel}
                      onChange={e => setInputLevel(e.target.value)}
                      onFocus={e => {
                        if (e.target.value === '1' || e.target.value === '100') {
                          setInputLevel('');
                        }
                      }}
                      onBlur={() => {
                        const num = Number(inputLevel);
                        if (!inputLevel || isNaN(num)) {
                          setInputLevel(level.toString());
                        } else {
                          const clamped = Math.min(100, Math.max(1, Math.floor(num)));
                          setLevel(clamped);
                          setInputLevel(clamped.toString());
                        }
                      }}
                      style={{ fontSize: 12 }}
                      className="w-12 px-2 py-0.5 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Campos de habilidad, naturaleza, ítem, teratipo en formato 2x2 */}
          <div className="mt-6 mb-3">
            <strong className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 bg-zinc-100 dark:bg-zinc-800 py-2 px-2 rounded-lg text-center">Detalles</strong>
            <div className="mt-2 w-full">
              <div className="grid grid-cols-2 gap-2 w-full">
                {/* Habilidad */}
                <div>
                  <label htmlFor="ability-select" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Habilidad:</label>
                  <select
                    id="ability-select"
                    value={chosenAbility}
                    onChange={e => {
                      setChosenAbility(e.target.value);
                      playSoundEffect('notification', 0.08); // Sonido al cambiar habilidad
                    }}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    {entry.abilities && Object.entries(entry.abilities).map(([key, ab]) => (
                      <option key={ab} value={ab}>
                        {ab}{key === 'H' ? ' (HO)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Naturaleza */}
                <div>
                  <label htmlFor="nature-select" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Naturaleza:</label>
                  <select
                    id="nature-select"
                    value={chosenNature}
                    onChange={e => {
                      setChosenNature(e.target.value);
                      playSoundEffect('notification', 0.08); // Sonido al cambiar naturaleza
                    }}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    {natureEntries.map((nature, idx) => {
                      let effect = '';
                      if (nature.plus && nature.minus && nature.plus !== nature.minus) {
                        effect = ` (+${statLabels[nature.plus]}, -${statLabels[nature.minus]})`;
                      }
                      return (
                        <option key={nature.name} value={nature.name}>
                          {nature.name}{effect}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {/* Objeto */}
                <div>
                  <label htmlFor="item-select" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Objeto:</label>
                  <select
                    id="item-select"
                    value={chosenItem}
                    onChange={e => setChosenItem(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="">(Ninguno)</option>
                    {itemsList.map((item, idx) => (
                      <option key={`${item.name}-${idx}`} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </div>
                {/* Tera Tipo */}
                <div>
                  <label htmlFor="tera-select" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Tera Tipo:</label>
                  <div className="relative w-full flex items-center">
                    <select
                      id="tera-select"
                      value={chosenTera}
                      onChange={e => { setChosenTera(e.target.value); setTeraAnimating(true); handleTeraChange(e.target.value); }}
                      className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 pr-8"
                    >
                      {teraOptions.map((opt, idx) => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                    {/* Tera icon animation overlay */}
                    <span className={`absolute right-7 flex items-center ${teraAnimating ? 'animate-pulse' : ''}`} style={{ pointerEvents: 'none' }}>
                      <img
                        src={teraSprites[chosenTera]}
                        alt={chosenTera}
                        className="w-5 h-5 drop-shadow"
                        style={{ filter: 'drop-shadow(0 0 4px #fff)' }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Movimientos en formato 2x2 */}
          <div className="mb-3">
            <strong className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 bg-zinc-100 dark:bg-zinc-800 py-2 px-2 rounded-lg text-center">Movimientos</strong>
            <div className="mt-2 w-full">
              <div className="grid grid-cols-2 gap-2 w-full">
                {movesSlots.map((mv, idx) => {
                  // Prevent duplicate moves: filter out moves already chosen in other slots
                  const otherMoves = movesSlots.filter((_, i) => i !== idx);
                  const filteredMoves = availableMoves.filter(
                    move => !otherMoves.includes(move) || move === mv
                  );
                  return (
                    <MoveSelectorSlot
                      key={`move-${idx}-${mv}`}
                      value={mv}
                      index={idx}
                      availableMoves={filteredMoves}
                      onChange={(moveIdx, val) => {
                        const newSlots = [...movesSlots];
                        newSlots[moveIdx] = val;
                        setMovesSlots(newSlots);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          {/* IVs y EVs lado a lado sin separador vertical, con más espacio entre casillas */}
          <div className="flex flex-row gap-5 mt-1 sm:gap-4 justify-between">
            <div className="w-full sm:w-1/2">
              <strong className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 bg-zinc-100 dark:bg-zinc-800 py-1 px-2 rounded-lg text-center">IVs</strong>
              <StatInputGroup
                label=""
                statsKeys={[...statsKeys]}
                statLabels={statLabels}
                inputValues={inputIVs}
                setInputValues={setInputIVs}
                values={IVs}
                setValues={setIVs}
                min={0}
                max={31}
                type="IV"
              />
            </div>
            <div className="w-full sm:w-1/2">
              <strong className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 bg-zinc-100 dark:bg-zinc-800 py-1 px-2 rounded-lg text-center">EVs</strong>
              <StatInputGroup
                label=""
                statsKeys={[...statsKeys]}
                statLabels={statLabels}
                inputValues={inputEVs}
                setInputValues={setInputEVs}
                values={EVs}
                setValues={setEVs}
                min={0}
                max={252}
                type="EV"
                natureAffectedStats={natureAffectedStats}
                isNatureEffectAnimating={isNatureEffectAnimating}
                onChange={handleEVChange}
              />
            </div>
          </div>
          {/* Botón guardar */}
          <div className="flex justify-center mt-4">
            <MagnetizeButtonEdicionTarjeta
              type="button"
              onClick={handleSave}
            >
              Guardar cambios
            </MagnetizeButtonEdicionTarjeta>
          </div>
          {/* Validación de legalidad */}
          {validationErrors.length > 0 && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
              <b>Advertencia de legalidad:</b>
              <ul>
                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Edicion

// NOTE: If you add new props to PokemonDisplayCard, do NOT spread them onto DOM elements or lower-level components like Button or MagnetizeButton. Only pass standard props to those components to avoid React warnings about invalid DOM properties.
