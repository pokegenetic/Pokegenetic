import { getLegalBasePokemon, editLegalBasePokemon } from '../../data/sv/pokemonCreationUtils';
import { BASEPOKEMON_EDIT_RULES, BasePokemon as BasePokemonData } from '../../data/sv/basepokemon-util';
// @ts-ignore
import basepokemonText from '../../data/sv/basepokemon.ts?raw';
import { basepokemonData } from '../../data/sv/basepokemon';
import { isTransferOnly } from '../../data/sv/transfer-only';
import { MagnetizeButton } from "@/components/ui/magnetize-button";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Magnet } from 'lucide-react';
import pokeballIcon from '@/img/pokeball.png';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pokedex, SpeciesData, GenderName } from '@/data/sv/pokedex_module'; 
import { Natures as allNatures } from '@/data/sv/natures';
import { items_sv } from '@/data/sv/items_sv';
import { Abilities as allAbilities } from '@/data/sv/abilities';
import { Learnsets } from '@/data/sv/learnsets';
import { Moves } from '@/data/sv/moves'; // This should be Record<string, MoveData>
import { parseShowdownText, ParsedPokemon } from '../../lib/parseShowdown';
import { getGenderForSpecies, getRandomMovesForSpecies, getPokemonDetails } from '../../lib/pokedexHelper';
import { parseShowdownTextToArray } from '../../lib/parseShowdown';
import MoveSelectorSlot from '@/components/EdicionTarjeta/MoveSelectorSlot';
import StatInputGroup from '@/components/EdicionTarjeta/StatInputGroup';
import { getPokemonTeam, setPokemonTeam } from '@/lib/equipoStorage';
import { useGame } from '@/context/GameContext';
import { statsKeys, statLabels, statShowdownMap, typeColors } from '@/data/pokemonConstants';
import { validatePokemon } from '../../lib/pokemonValidator';
type StatKey = typeof statsKeys[number];

import aceroIcon from '@/img/teratipos/Teratipo_acero_icono_EP.png';
import aguaIcon from '@/img/teratipos/Teratipo_agua_icono_EP.png';
import astralIcon from '@/img/teratipos/Teratipo_astral_icono_EP.png';
import bichoIcon from '@/img/teratipos/Teratipo_bicho_icono_EP.png';
import dragónIcon from '@/img/teratipos/Teratipo_dragón_icono_EP.png';
import eléctricoIcon from '@/img/teratipos/Teratipo_eléctrico_icono_EP.png';
import fantasmaIcon from '@/img/teratipos/Teratipo_fantasma_icono_EP.png';
import fuegoIcon from '@/img/teratipos/Teratipo_fuego_icono_EP.png';
import hadaIcon from '@/img/teratipos/Teratipo_hada_icono_EP.png';
import hieloIcon from '@/img/teratipos/Teratipo_hielo_icono_EP.png';
import luchaIcon from '@/img/teratipos/Teratipo_lucha_icono_EP.png';
import normalIcon from '@/img/teratipos/Teratipo_normal_icono_EP.png';
import plantaIcon from '@/img/teratipos/Teratipo_planta_icono_EP.png';
import psíquicoIcon from '@/img/teratipos/Teratipo_psíquico_icono_EP.png';
import rocaIcon from '@/img/teratipos/Teratipo_roca_icono_EP.png';
import siniestroIcon from '@/img/teratipos/Teratipo_siniestro_icono_EP.png';
import tierraIcon from '@/img/teratipos/Teratipo_tierra_icono_EP.png';
import venenoIcon from '@/img/teratipos/Teratipo_veneno_icono_EP.png';
import voladorIcon from '@/img/teratipos/Teratipo_volador_icono_EP.png';

type BasePokemon = {
  name: string;
  num: number;
  sprite: string;
};

type PokedexEntry = SpeciesData;

const teraOptions = [
  { key: 'acero',    label: 'Acero' },
  { key: 'agua',     label: 'Agua' },
  { key: 'astral',   label: 'Astral' },
  { key: 'bicho',    label: 'Bicho' },
  { key: 'dragón',   label: 'Dragón' },
  { key: 'eléctrico',label: 'Eléctrico' },
  { key: 'fantasma', label: 'Fantasma' },
  { key: 'fuego',    label: 'Fuego' },
  { key: 'hada',     label: 'Hada' },
  { key: 'hielo',    label: 'Hielo' },
  { key: 'lucha',    label: 'Lucha' },
  { key: 'normal',   label: 'Normal' },
  { key: 'planta',   label: 'Planta' },
  { key: 'psíquico', label: 'Psíquico' },
  { key: 'roca',     label: 'Roca' },
  { key: 'siniestro',label: 'Siniestro' },
  { key: 'tierra',   label: 'Tierra' },
  { key: 'veneno',   label: 'Veneno' },
  { key: 'volador',  label: 'Volador' },
];

const teraSprites: Record<string, string> = {
    acero: aceroIcon,
    agua: aguaIcon,
    astral: astralIcon,
    bicho: bichoIcon,
    dragón: dragónIcon,
    eléctrico: eléctricoIcon,
    fantasma: fantasmaIcon,
    fuego: fuegoIcon,
    hada: hadaIcon,
    hielo: hieloIcon,
    lucha: luchaIcon,
    normal: normalIcon,
    planta: plantaIcon,
    psíquico: psíquicoIcon,
    roca: rocaIcon,
    siniestro: siniestroIcon,
    tierra: tierraIcon,
    veneno: venenoIcon,
    volador: voladorIcon,
  };

const Edicion: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as any) || {};
  const initialPokemon = state.pokemon as BasePokemon | undefined;
  const showdownText = state.showdownText as string | undefined;
  const isEditMode = Boolean(showdownText);

  let parsedResult: { pokemon: ParsedPokemon, messages: string[] } | undefined = undefined;
  if (isEditMode && showdownText) {
    parsedResult = parseShowdownText(showdownText);
  }
  const parsedPokemon = parsedResult?.pokemon;

  const speciesKey = (parsedPokemon?.species || initialPokemon?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, '');
  const entry = Pokedex[speciesKey] as PokedexEntry | undefined;

  const generation =
    entry && entry.num <= 151  ? 1 :
    entry && entry.num <= 251  ? 2 :
    entry && entry.num <= 386  ? 3 :
    entry && entry.num <= 493  ? 4 :
    entry && entry.num <= 649  ? 5 :
    entry && entry.num <= 721  ? 6 :
    entry && entry.num <= 809  ? 7 :
    entry && entry.num <= 898  ? 8 :
                       9;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const audio = new Audio('/src/sounds/sfx/pc.mp3');
    audio.volume = 0.02; // Set volume to 2%
    audio.play().catch(error => console.error("Error playing sound:", error));
    // Delay visibility to sync with sound
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Adjust delay as needed, 100ms is a starting point
    return () => clearTimeout(timer);
  }, []);

  // Function to play sound on saving Pokémon data
  const playSaveSound = () => {
    const audio = new Audio('/src/sounds/sfx/pokeballcatch.mp3');
    audio.volume = 0.05; // Set volume to 5%
    audio.play().catch(error => console.error("Error playing pokeballcatch.mp3:", error));
  };

  useEffect(() => {
    if (parsedResult?.messages && parsedResult.messages.length > 0) {
      console.info("Showdown Import Messages:", parsedResult.messages.join('\\n'));
      // Consider using a toast notification library to display these messages to the user.
    }
  }, [parsedResult?.messages]);

  if (!entry && !parsedPokemon) {
    return (
      <div className="p-4 text-center text-red-500">
        No se ha seleccionado ningún Pokémon o no se pudo procesar. Vuelve a la pantalla de creación.
      </div>
    );
  }
  if (!entry && (initialPokemon?.name || parsedPokemon?.species)) {
      console.warn(`Pokedex entry not found for ${initialPokemon?.name || parsedPokemon?.species}. Some features might be limited.`);
  }

  // Prepend (Ninguno) as the default item
  const itemsList = [{ name: "(Ninguno)", sprite: "" }, ...items_sv.map(item => ({ name: item.name, sprite: item.sprite }))];
  // Memoize natureEntries to avoid infinite re-renders
  const natureEntries = React.useMemo(() => Object.values(allNatures) as Array<{name: string, plus?: string, minus?: string}>, []);
  const abilityOptions = entry ? Object.values(entry.abilities || {}).filter(ab => typeof ab === 'string') as string[] : (parsedPokemon?.ability ? [parsedPokemon.ability] : []);
  
  const rawLearnset = entry ? (Learnsets[speciesKey]?.learnset || {}) : {};
  const availableMoves: string[] = Object.entries(rawLearnset)
    .filter(([, versions]) => Array.isArray(versions) && (versions as string[]).some(v => typeof v === 'string' && v.startsWith('9')))
    .map(([moveId]) => moveId); // Store move IDs

  const [nickname, setNickname] = useState<string>(
    parsedPokemon ? (parsedPokemon.name !== parsedPokemon.species ? parsedPokemon.name : "") : (initialPokemon?.name && entry?.name && initialPokemon.name.toLowerCase() !== entry.name.toLowerCase() ? initialPokemon.name : "")
  );

  const [chosenAbility, setChosenAbility] = useState<string>(
    parsedPokemon?.ability || abilityOptions[0] || (entry?.abilities?.[0] || 'Pressure')
  );

  const [chosenNature, setChosenNature] = useState<string>(
    parsedPokemon?.nature || natureEntries[0]?.name || 'Serious'
  );

  const [chosenItem, setChosenItem] = useState<string>(() => {
    if (parsedPokemon?.item) {
      const foundItemByName = itemsList.find(i => i.name.toLowerCase() === parsedPokemon.item!.toLowerCase());
      // If found in list, use the cased name from the list. Otherwise, use the item name as parsed.
      return foundItemByName ? foundItemByName.name : parsedPokemon.item;
    }
    return ""; // Default to no item for new Pokémon or if not specified in import
  });

  const [gender, setGender] = useState<GenderName>(() => {
    if (parsedPokemon?.gender) return parsedPokemon.gender;
    const targetSpecies = entry?.name || parsedPokemon?.species;
    if (targetSpecies) {
        const determinedGender = getGenderForSpecies(targetSpecies);
        if (determinedGender) return determinedGender;
    }
    // Default based on species if possible, else 'N'
    const speciesDataForGender = entry || (targetSpecies ? Pokedex[targetSpecies.toLowerCase().replace(/[^a-z0-9]+/g, '')] : undefined);
    if (speciesDataForGender?.gender) return speciesDataForGender.gender;
    if (speciesDataForGender?.genderRatio) {
        if (speciesDataForGender.genderRatio.M > 0 && speciesDataForGender.genderRatio.F === 0) return 'M';
        if (speciesDataForGender.genderRatio.F > 0 && speciesDataForGender.genderRatio.M === 0) return 'F';
        if (speciesDataForGender.genderRatio.M > 0) return 'M'; // Default to M if both possible
    }
    return 'N'; 
  });

  const [isShiny, setIsShiny] = useState<boolean>(parsedPokemon?.isShiny || false);
  const [level, setLevel] = useState<number>(parsedPokemon?.level || 100);
  const [inputLevel, setInputLevel] = useState<string>((parsedPokemon?.level || 100).toString());

  const teraTypeMap: Record<string, string> = {
    acero: "Steel", fuego: "Fire", agua: "Water", dragón: "Dragon", planta: "Grass", eléctrico: "Electric",
    hada: "Fairy", hielo: "Ice", lucha: "Fighting", veneno: "Poison", tierra: "Ground", volador: "Flying",
    psíquico: "Psychic", bicho: "Bug", roca: "Rock", fantasma: "Ghost", siniestro: "Dark", normal: "Normal", astral: "Stellar",
  };

  const [chosenTera, setChosenTera] = useState<string>(() => {
    let englishTeraType: string | undefined = undefined;
    if (parsedPokemon?.teraType) {
      englishTeraType = parsedPokemon.teraType;
    } else if (entry?.types?.[0]) {
      englishTeraType = entry.types[0];
    }

    if (englishTeraType) {
      const spanishKey = Object.entries(teraTypeMap).find(([, en]) => en.toLowerCase() === englishTeraType!.toLowerCase())?.[0];
      if (spanishKey && teraOptions.find(opt => opt.key === spanishKey)) return spanishKey;
    }
    // Fallback to first type of pokemon if entry exists and tera not specified, else first option
    if (entry?.types?.[0]) {
        const firstTypeSpanishKey = Object.entries(teraTypeMap).find(([, en]) => en.toLowerCase() === entry.types[0].toLowerCase())?.[0];
        if (firstTypeSpanishKey && teraOptions.find(opt => opt.key === firstTypeSpanishKey)) return firstTypeSpanishKey;
    }
    return teraOptions[0].key; 
  });

  const getMoveId = useCallback((moveNameOrId: string): string => {
    if (Moves[moveNameOrId] && typeof (Moves[moveNameOrId] as any).name === 'string') return moveNameOrId; // It's already a valid ID with a name property
    const moveEntry = Object.entries(Moves as Record<string, any>).find(([, moveDataObject]) => moveDataObject.name?.toLowerCase() === moveNameOrId?.toLowerCase());
    return moveEntry ? moveEntry[0] : moveNameOrId; // return ID if found, else original (could be a placeholder like '-')
  }, []);

  const [movesSlots, setMovesSlots] = useState<string[]>(() => {
    let initialMoves: string[] = [];
    if (parsedPokemon?.moves && parsedPokemon.moves.length > 0 && !parsedPokemon.moves.every(m => m === '-')) {
        initialMoves = parsedPokemon.moves.map(move => getMoveId(move));
    } else {
        const targetSpeciesForMoves = entry?.name || parsedPokemon?.species;
        if (targetSpeciesForMoves) {
            initialMoves = getRandomMovesForSpecies(targetSpeciesForMoves).map(moveName => getMoveId(moveName));
        }
    }
    
    const filledMoves: string[] = [];
    for (let i = 0; i < 4; i++) {
        if (initialMoves[i] && initialMoves[i] !== '-' && (Moves[initialMoves[i]] || availableMoves.includes(initialMoves[i]))){
            filledMoves.push(initialMoves[i]);
        } else {
            // Try to pick a different random move if the slot is empty or invalid
            let attempts = 0;
            let randomMoveId = '-';
            while(attempts < availableMoves.length || availableMoves.length === 0) { // Prevent infinite loop if no moves
                if (availableMoves.length > 0) {
                    randomMoveId = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                    if (!filledMoves.includes(randomMoveId) || filledMoves.filter(m => m === randomMoveId).length < 2) { // Allow up to two of the same move if few options
                        break;
                    }
                } else {
                    break; // No available moves
                }
                attempts++;
            }
            filledMoves.push(randomMoveId);
        }
    }
    // If still not 4 moves, fill remaining with placeholders
    while(filledMoves.length < 4) filledMoves.push('-');
    return filledMoves.slice(0, 4);
  });

  const [IVs, setIVs] = useState<Record<StatKey, number>>(
    parsedPokemon?.IVs || (Object.fromEntries(statsKeys.map(k => [k, 31])) as Record<StatKey, number>)
  );
  const [inputIVs, setInputIVs] = useState<Record<StatKey, string>>(
    parsedPokemon ? Object.fromEntries(statsKeys.map(k => [k, String(parsedPokemon.IVs[k])])) as Record<StatKey, string> : Object.fromEntries(statsKeys.map(k => [k, '31'])) as Record<StatKey, string>
  );
  const [IVsLocked, setIVsLocked] = useState<boolean>(false); // Estado para bloquear IVs de Pokémon especiales
  const [EVs, setEVs] = useState<Record<StatKey, number>>(
    parsedPokemon?.EVs || (Object.fromEntries(statsKeys.map(k => [k, 0])) as Record<StatKey, number>)
  );
  const [inputEVs, setInputEVs] = useState<Record<StatKey, string>>(
    parsedPokemon ? Object.fromEntries(statsKeys.map(k => [k, String(parsedPokemon.EVs[k])])) as Record<StatKey, string> : Object.fromEntries(statsKeys.map(k => [k, '0'])) as Record<StatKey, string>
  );

  const spriteRef = useRef<HTMLDivElement>(null);
  const IVsRef = useRef<HTMLDivElement>(null);
  const EVsRef = useRef<HTMLDivElement>(null);

  function capitalizeMoveName(moveId: string): string {
    return (Moves[moveId] as any)?.name || moveId;
  }

  const generateShowdownText = useCallback(() => {
    let genderOutput = "";
    if (gender === 'F') genderOutput = " (F)";
    else if (gender === 'M') genderOutput = " (M)";

    let displayItemName = chosenItem; // Use the chosen item from state

    if (chosenItem) { // If an item string is present
        const lcChosenItem = chosenItem.toLowerCase();
        const foundInListByName = itemsList.find(i => i.name.toLowerCase() === lcChosenItem);
        if (foundInListByName) {
            displayItemName = foundInListByName.name; // Use the exact cased name from our list
        } else {
            // If chosenItem is specified (e.g. from import or manual input) but not found in our itemsList,
            // we'll use the user-provided name as is.
            console.warn(`Item "${chosenItem}" not found in the predefined item list. It will be used as is in the Showdown export.`);
            // displayItemName is already chosenItem here, so it's correctly set to the user's input.
        }
    }

    const evEntries = Object.entries(EVs)
      .filter(([_, val]) => val > 0)
      .map(([stat, val]) => `${val} ${statLabels[stat as StatKey]}`)
      .join(" / ");

    const ivEntries = Object.entries(IVs)
      .filter(([_, val]) => val !== 31)
      .map(([stat, val]) => `${val} ${statLabels[stat as StatKey]}`);

    const movesLines = movesSlots
      .map(moveId => `- ${capitalizeMoveName(moveId)}`)
      .join("\n");

    const teraEnglish = teraTypeMap[chosenTera.toLowerCase()] || chosenTera;
    
    const speciesToDisplay = entry?.name || parsedPokemon?.species || "Unknown";
    const namePart = nickname && nickname.trim().length > 0 && nickname.trim().toLowerCase() !== speciesToDisplay.toLowerCase()
      ? `${nickname.trim()} (${speciesToDisplay})`
      : speciesToDisplay;
    
    // Conditionally add item to the first line
    const itemString = displayItemName ? ` @ ${displayItemName}` : "";
    const firstLine = `${namePart}${genderOutput}${itemString}`;

    const finalAbility = chosenAbility || (entry?.abilities?.[0] || 'Pressure');

    const lines = [
      firstLine,
      `Ability: ${finalAbility}`,
      isShiny ? `Shiny: Yes` : null,
      chosenTera ? `Tera Type: ${teraEnglish}` : null,
      evEntries ? `EVs: ${evEntries}` : null,
      chosenNature ? `${chosenNature} Nature` : null,
      ivEntries.length ? `IVs: ${ivEntries.join(" / ")}` : null,
      level !== 100 ? `Level: ${level}` : null,
      movesLines
    ].filter(Boolean).map(line => line!.trim()); // Ensure lines are trimmed and not null

    return lines.join("\n");
  }, [EVs, IVs, chosenAbility, chosenNature, chosenTera, isShiny, movesSlots, entry, nickname, level, chosenItem, gender, itemsList, parsedPokemon?.species]);

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
      .replace(/-shield$/, '') // Aegislash-Shield -> Aegislash
      .replace(/-sunshine$/, '-sunshine')
      .replace(/-overcast$/, '') // Cherrim-Overcast -> Cherrim
      .replace(/-school$/, '-school')
      .replace(/-solo$/, '') // Wishiwashi-Solo -> Wishiwashi
      .replace(/-aria$/, '-aria')
      .replace(/-pirouette$/, '-pirouette')
      .replace(/-resolute$/, '-resolute')
      .replace(/-ordinary$/, '') // Keldeo-Ordinary -> Keldeo
      .replace(/-strike$/, '') // Urshifu Single Strike -> Urshifu
      .replace(/-rapid-strike$/, '-rapid-strike')
      .replace(/-crowned$/, '-crowned')
      .replace(/-hero$/, '') // Palafin-Hero -> Palafin
      .replace(/-eternamax$/, '-eternamax')
      .replace(/-hangry$/, '-hangry')
      .replace(/-full-belly$/, '') // Morpeko-Full-Belly -> Morpeko
      .replace(/-amped$/, '-amped')
      .replace(/-low-key$/, '-low-key')
      .replace(/-10%?$/, '-10')
      .replace(/-50%?$/, '') // Zygarde-50% -> Zygarde
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
      .replace(/-zero$/, '-zero') // Palafin-Zero -> Palafin-Zero (explicitly handled later)
      .replace(/-hero-form$/, '-hero') // Palafin-Hero -> Palafin-Hero (explicitly handled later)
      .replace(/-curly$/, '-curly')
      .replace(/-droopy$/, '-droopy')
      .replace(/-stretchy$/, '-stretchy')
      .replace(/-green-plumage$/, '-green-plumage')
      .replace(/-blue-plumage$/, '-blue-plumage')
      .replace(/-yellow-plumage$/, '-yellow-plumage')
      .replace(/-white-plumage$/, '-white-plumage')
      .replace(/-family-of-three$/, '-family-of-three')
      .replace(/-family-of-four$/, '') // Maushold-Family-of-Four -> Maushold
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
      'palafin': 'palafin-zero', // Default Palafin to Palafin-Zero for sprite
      'palafin-hero': 'palafin-hero',
    };
    if (specificNameMap[formattedName]) {
      formattedName = specificNameMap[formattedName];
    }
    formattedName = formattedName.replace(/--+/g, '-').replace(/^-+|-+$/g, '');
    return formattedName;
  }

  function getSprite(speciesName: string, shiny: boolean): string {
    const nameForUrl = formatNameForPokemondb(speciesName);
    const shinyStr = shiny ? "shiny" : "normal";
    // Ensure the URL is correct, especially for newer games if sprites are from different sources
    return `https://img.pokemondb.net/sprites/home/${shinyStr}/${nameForUrl}.png`;
  }

  // Usar basepokemonData exportado en lugar del raw
  const showdownEntries = basepokemonData.split(/\n\n(?=[A-Z])/g).filter(Boolean);

  const handleSave = () => {
    try {
      // Verificar si hay errores de validación antes de guardar
      if (validationErrors.length > 0) {
        alert('No se puede guardar: ' + validationErrors.join(' '));
        return;
      }
      
      // Buscar base legal (solo para Pokémon especiales en basepokemon.ts)
      const base = getLegalBasePokemon({ name: entry?.name || parsedPokemon?.species || initialPokemon?.name, gender, shiny: isShiny }, showdownEntries);
      
      let team = getPokemonTeam();
      let pokemonIndexToUpdate = -1;
      
      // Determinar si estamos editando un Pokémon existente
      if (isEditMode && parsedPokemon && entry) {
          if (state.showdownText) {
              pokemonIndexToUpdate = team.findIndex(p =>
                'name' in p && 'species' in p && 'level' in p &&
                p.name === parsedPokemon.name &&
                p.species === parsedPokemon.species &&
                p.level === parsedPokemon.level
              );
          }
      }

      // Si no hay base legal, permitir guardado normal para Pokémon regulares
      if (!base) {
        const pokemonToSave = {
          name: nickname || entry?.name || parsedPokemon?.species || '',
          species: entry?.name || parsedPokemon?.species || '',
          level: level,
          ability: chosenAbility,
          nature: chosenNature,
          item: chosenItem || undefined,
          gender: gender as any,
          isShiny: isShiny,
          teraType: chosenTera,
          moves: movesSlots.filter(move => move && move !== '-'),
          IVs: IVs,
          EVs: EVs
        };
        
        if (pokemonIndexToUpdate >= 0) {
          team[pokemonIndexToUpdate] = pokemonToSave as any;
        } else {
          team.push(pokemonToSave as any);
        }
        
        setPokemonTeam(team);
        playSaveSound();
        
        // Navegar de forma segura
        try {
          navigate('/equipo');
        } catch (error) {
          console.error('Error navigating after save:', error);
          window.location.href = '/equipo';
        }
        return;
      }

      // Pokémon especial con base legal
      const edit: Partial<typeof base> = {
        level,
        moves: movesSlots.filter(move => move && move !== '-'),
        item: chosenItem || undefined,
        ability: chosenAbility || undefined,
        nature: chosenNature || undefined
      };
      
      // Aplicar reglas de legalidad
      const result = editLegalBasePokemon(base, edit);
      
      // Validar si el usuario intentó editar campos no permitidos
      if ((edit.level && edit.level < base.level) ||
          (edit.ability && edit.ability !== base.ability && !BASEPOKEMON_EDIT_RULES.allowAbilityEdit) ||
          (edit.nature && edit.nature !== base.nature && !BASEPOKEMON_EDIT_RULES.allowNatureEdit)) {
        alert('Algunos cambios no están permitidos según las reglas de legalidad. Solo puedes subir de nivel, cambiar movimientos, ítem, habilidad y naturaleza permitidos.');
        return;
      }
      
      // Guardar el Pokémon editado legalmente
      const pokemonToSave = {
        name: nickname || entry?.name || parsedPokemon?.species || result.name || '',
        species: entry?.name || parsedPokemon?.species || result.name || '',
        level: result.level || level,
        ability: result.ability || chosenAbility,
        nature: result.nature || chosenNature,
        item: result.item || chosenItem || undefined,
        gender: gender as any,
        isShiny: result.shiny !== undefined ? result.shiny : isShiny,
        teraType: chosenTera,
        moves: result.moves || movesSlots.filter(move => move && move !== '-'),
        IVs: result.ivs ? {
          hp: result.ivs.HP || 31,
          atk: result.ivs.Atk || 31,
          def: result.ivs.Def || 31,
          spa: result.ivs.SpA || 31,
          spd: result.ivs.SpD || 31,
          spe: result.ivs.Spe || 31
        } : IVs,
        EVs: EVs
      };
      
      if (pokemonIndexToUpdate !== -1) {
        team[pokemonIndexToUpdate] = pokemonToSave as any;
      } else {
        team.push(pokemonToSave as any);
      }
      
      setPokemonTeam(team);
      playSaveSound();
      
      // Navegar de forma segura
      try {
        navigate('/equipo');
      } catch (error) {
        console.error('Error navigating after save:', error);
        window.location.href = '/equipo';
      }
      
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('Error al guardar el Pokémon. Por favor, inténtalo de nuevo.');
    }
  };

  // --- Animación de TeraType ---
  const [teraAnimating, setTeraAnimating] = useState(false);
  const handleTeraChange = (value: string) => {
    setTeraAnimating(true);
    setChosenTera(value);
    setTimeout(() => setTeraAnimating(false), 800);
  };
  // --- Animación de naturaleza en EVs ---
  const [natureAffectedStats, setNatureAffectedStats] = useState<{ boosted: StatKey | null, reduced: StatKey | null }>({ boosted: null, reduced: null });
  const [isNatureEffectAnimating, setIsNatureEffectAnimating] = useState<boolean>(false);
  const natureAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (natureAnimationTimeoutRef.current) clearTimeout(natureAnimationTimeoutRef.current);
    setIsNatureEffectAnimating(false);
    const nature = natureEntries.find(n => n.name === chosenNature);
    if (nature && nature.plus && nature.minus && nature.plus !== nature.minus) {
      setNatureAffectedStats({ boosted: nature.plus as StatKey, reduced: nature.minus as StatKey });
      setIsNatureEffectAnimating(true);
      natureAnimationTimeoutRef.current = setTimeout(() => setIsNatureEffectAnimating(false), 1500);
    } else {
      setNatureAffectedStats({ boosted: null, reduced: null });
    }
    return () => { if (natureAnimationTimeoutRef.current) clearTimeout(natureAnimationTimeoutRef.current); };
  }, [chosenNature, natureEntries]);

  const handleShinyChange = (isShiny: boolean) => {
    if (entry && isTransferOnly(entry.name) && isShiny) {
      alert('No puedes cambiar este Pokémon a su versión shiny porque es transfer-only.');
      return;
    }
    setIsShiny(isShiny);
  };

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Efecto para cargar Pokémon base legal si existe
  const [basePokemon, setBasePokemon] = useState<BasePokemonData | null>(null);
  const [baseDataApplied, setBaseDataApplied] = useState<boolean>(false);

  useEffect(() => {
    // Solo validar después de que los datos base se hayan aplicado (si aplica)
    if (!basePokemon || baseDataApplied) {
      // Construir el objeto pokemon a validar
      const pokemonToValidate = {
        name: entry?.name || parsedPokemon?.species || '',
        ability: chosenAbility,
        level: level,
        shiny: isShiny,
        IVs: IVs,
        // Puedes agregar más campos si los usas en el validador
      };
      setValidationErrors(validatePokemon(pokemonToValidate));
    }
  }, [entry, chosenAbility, level, isShiny, IVs, basePokemon, baseDataApplied]);
  
  useEffect(() => {
    // Solo para Pokémon en la base (no nuevos) Y solo si no se han aplicado ya los datos
    if (entry && entry.num && entry.num > 0 && !baseDataApplied) {
      const basePokemonData = getLegalBasePokemon({ 
        name: entry.name, 
        gender, 
        shiny: isShiny 
      }, showdownEntries);
      
      if (basePokemonData) {
        setBasePokemon(basePokemonData);
      } else {
        setBasePokemon(null);
      }
    }
  }, [entry, showdownEntries, gender, baseDataApplied]); // Quitar isShiny para evitar bucles

  // Efecto para sincronizar estado con Pokémon base legal - SOLO una vez al cargar
  useEffect(() => {
    if (basePokemon && !baseDataApplied) { // Solo aplicar si no se han aplicado ya los datos base
      setLevel(basePokemon.level || 100);
      setInputLevel(String(basePokemon.level || 100));
      setChosenAbility(basePokemon.ability || '');
      setChosenNature(basePokemon.nature || 'Serious');
      
      // Procesar movimientos - convertir nombres a IDs y evitar repeticiones
      if (basePokemon.moves && basePokemon.moves.length > 0) {
        const processedMoves: string[] = [];
        
        for (const moveName of basePokemon.moves) {
          if (moveName && moveName !== '-') {
            const moveId = getMoveId(moveName);
            
            // Solo agregar si no está duplicado
            if (!processedMoves.includes(moveId)) {
              processedMoves.push(moveId);
            }
          }
        }
        
        // Completar con placeholders si no hay suficientes movimientos
        while (processedMoves.length < 4) {
          processedMoves.push('-');
        }
        
        setMovesSlots(processedMoves.slice(0, 4));
      } else {
        setMovesSlots(['-', '-', '-', '-']);
      }
      
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
        setInputIVs({
          hp: String(mappedIVs.hp),
          atk: String(mappedIVs.atk),
          def: String(mappedIVs.def),
          spa: String(mappedIVs.spa),
          spd: String(mappedIVs.spd),
          spe: String(mappedIVs.spe)
        });
        setIVsLocked(true); // Bloquear cambios en IVs
      }
      if (typeof basePokemon.shiny === 'boolean') setIsShiny(basePokemon.shiny);
      
      // Marcar que los datos base han sido aplicados
      setBaseDataApplied(true);
    }
  }, [basePokemon, baseDataApplied]); // Quitar getMoveId de las dependencias para evitar bucle infinito

  if (!isVisible) {
    return null; // Or a loading spinner
  }

  // JSX structure (simplified for brevity, ensure all state bindings are correct in actual code)
  return (
    <>
    <div className="flex justify-center items-center min-h-screen w-full px-2">
      <div className="relative backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl shadow-lg p-3 sm:p-5 md:p-5 w-full max-w-[350px] sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-2 border border-gray-200/70 dark:border-gray-700/60 mt-1 mb-1 transition-all duration-200">
        {/* Título eliminado según solicitud */}
        {/* Sprite y datos principales */}
        <div className="mt-6">
          <div className="flex flex-row items-center gap-3 sm:gap-6 w-full mt-2">
            <div className="relative flex-shrink-0">
              {(entry || parsedPokemon) && (
                <img 
                  src={getSprite(entry?.name || parsedPokemon!.species, isShiny)}
                  alt={entry?.name || parsedPokemon!.species}
                  className="w-40 h-40 sm:w-44 sm:h-44 object-contain drop-shadow-lg"
                />
              )}
              {isShiny && (
                <span className="absolute top-0 right-0 z-10 text-yellow-400 text-xl animate-bounce pointer-events-none select-none drop-shadow-lg">
                  ✨
                </span>
              )}
            </div>
            <div className="flex flex-col flex-1 items-start justify-center gap-1 w-full">
              <div className="flex items-center w-full">
                <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight drop-shadow-sm text-left">{entry?.name || parsedPokemon?.species || "N/A"}</span>
                {entry && <span className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-colors ml-2">#{entry.num}</span>}
              </div>
              <div className="flex flex-wrap gap-1 w-full justify-start items-center mt-1">
                {entry?.types && entry.types.map((type: string) => (
                  <span
                    key={type}
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium shadow-sm transition-colors',
                      typeColors[type.toLowerCase()] || 'bg-gray-400 text-white',
                      'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {type}
                  </span>
                ))}
                {chosenTera && teraSprites[chosenTera] && (
                  <span className="inline-flex items-center ml-1">
                    <img
                      src={teraSprites[chosenTera]}
                      alt={chosenTera}
                      className="w-5 h-5 drop-shadow"
                      style={{ filter: 'drop-shadow(0 0 4px #fff)' }}
                    />
                  </span>
                )}
                {/* Sprite del ítem asignado */}
                {chosenItem && itemsList.find(i => i.name === chosenItem)?.sprite && (
                  <span className="inline-flex items-center ml-2">
                    <img
                      src={itemsList.find(i => i.name === chosenItem)?.sprite}
                      alt={chosenItem}
                      className="w-8 h-8 drop-shadow"
                      title={chosenItem}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Nickname, Shiny, Gender, Level */}
        <div className="mt-4 flex flex-row items-end gap-2 justify-between w-full">
          <div className="flex flex-col items-center w-1/2">
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
          <div className="flex flex-col items-center w-1/4">
            <label htmlFor="shiny-toggle" className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Shiny</label>
            <div className="relative">
              <button 
                id="shiny-toggle"
                type="button" 
                onClick={() => handleShinyChange(!isShiny)} 
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
          <div className="flex flex-col items-center w-1/4">
            <label htmlFor="gender-toggle" className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Género</label>
            <div className="relative">
              <button 
                id="gender-toggle"
                type="button" 
                onClick={() => setGender(gender === 'M' ? 'F' : 'M')} 
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
          <div className="flex flex-col items-center w-1/4">
            <label htmlFor="level-input" className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Nivel</label>
            <div className="relative">
              <input
                id="level-input"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                value={inputLevel}
                onChange={e => setInputLevel(e.target.value)}
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
                className="w-12 px-2 py-0.5 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
        {/* Gender Toggle */}
        {/* <div className="flex flex-col items-center w-1/4">
          <label htmlFor="gender-toggle" className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">Género</label>
          <div className="relative">
            <button 
              id="gender-toggle"
              type="button" 
              onClick={() => setGender(gender === 'M' ? 'F' : 'M')} 
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
        </div> */}
        {/* Detalles: Habilidad, Naturaleza, Ítem, Teratipo en grid 2x2 */}
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
                  onChange={e => setChosenAbility(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {abilityOptions.map((ab) => (
                    <option key={ab} value={ab}>{ab}{entry?.abilities?.H === ab ? ' (HO)' : ''}</option>
                  ))}
                </select>
              </div>
              {/* Naturaleza */}
              <div>
                <label htmlFor="nature-select" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Naturaleza:</label>
                <select
                  id="nature-select"
                  value={chosenNature}
                  onChange={e => setChosenNature(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {natureEntries.map((n, idx) => {
                    const hasEffect = n.plus && n.minus && (n.plus !== n.minus);
                    const plusLabel = hasEffect ? statLabels[n.plus as StatKey] : '';
                    const minusLabel = hasEffect ? statLabels[n.minus as StatKey] : '';
                    const label = hasEffect
                      ? `${n.name} (+${plusLabel} -${minusLabel})`
                      : `${n.name} (Neutral)`;
                    return (
                      <option key={`${n.name}-${idx}`} value={n.name}>{label}</option>
                    );
                  })}
                </select>
              </div>
              {/* Ítem */}
              <div>
                <label htmlFor="item-select" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Ítem:</label>
                <select
                  id="item-select"
                  value={chosenItem}
                  onChange={e => setChosenItem(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {/* Add (Ninguno) as the first option */}
                  <option value="">(Ninguno)</option>
                  {items_sv.map((item, idx) => (
                    <option key={`${item.name}-${idx}`} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
              {/* Teratipo con animación */}
              <div className="relative">
                <label htmlFor="tera-select" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Tera Tipo:</label>
                <div className="relative w-full flex items-center">
                  <select
                    id="tera-select"
                    value={chosenTera}
                    onChange={e => { handleTeraChange(e.target.value); }}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 pr-8"
                  >
                    {teraOptions.map((opt, idx) => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                  {teraSprites[chosenTera] && (
                    <span className={`absolute right-7 flex items-center ${teraAnimating ? 'animate-pulse' : ''}`} style={{ pointerEvents: 'none' }}>
                      <img
                        src={teraSprites[chosenTera]}
                        alt={chosenTera}
                        className="w-5 h-5 drop-shadow"
                        style={{ filter: 'drop-shadow(0 0 4px #fff)' }}
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Movimientos en formato 2x2 con MoveSelectorSlot */}
        <div className="mb-3">
          <strong className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 bg-zinc-100 dark:bg-zinc-800 py-2 px-2 rounded-lg text-center">Movimientos</strong>
          <div className="mt-2 w-full">
            <div className="grid grid-cols-2 gap-2 w-full">
              {movesSlots.map((mv, idx) => (
                <MoveSelectorSlot
                  key={`move-${idx}-${mv}`}
                  value={mv}
                  index={idx}
                  availableMoves={availableMoves}
                  // Nueva prop: movesSeleccionados para bloquear repetidos
                  movesSeleccionados={movesSlots}
                  onChange={(moveIdx, val) => {
                    const newSlots = [...movesSlots];
                    newSlots[moveIdx] = val;
                    setMovesSlots(newSlots);
                  }}
                />
              ))}
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
              locked={IVsLocked} // Nueva prop para bloquear cambios
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
              // onChange={handleEVChange} // If you have a custom handler, pass it here
            />
          </div>
        </div>
        {/* Botón guardar */}
        <div className="flex justify-center mt-4">
          <MagnetizeButton type="button" onClick={handleSave}>
            Guardar cambios
          </MagnetizeButton>
        </div>
        {/* Volver al equipo button (top right, floating) */}
        <button
          onClick={() => {
            try {
              navigate('/equipo');
            } catch (error) {
              console.error('Error navigating back:', error);
              window.location.href = '/equipo';
            }
          }}
          className="absolute top-3 right-3 bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold py-1 px-3 rounded-lg shadow-md transition-colors duration-150 z-10 flex items-center gap-1"
          aria-label="Volver al equipo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Volver
        </button>
        {/* Advertencias de legalidad */}
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
    </>
  );
};

export default Edicion;

function convertirAShowdown(pokemonData: ParsedPokemon): string {
  // Validación robusta: species y al menos un movimiento válido
  if (!pokemonData || !pokemonData.species || !pokemonData.moves || !pokemonData.moves.some(m => m && m !== "- -" && m !== "-" && m !== "")) {
    return "";
  }
  
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
  if (finalPokemon.EVs && Object.keys(finalPokemon.EVs).length > 0) {
      const evList = Object.entries(finalPokemon.EVs)
          .filter(([, value]) => (value as number) > 0)
          .map(([stat, value]) => `${value} ${statShowdownMap[stat.toLowerCase()] || stat.toUpperCase()}`)
          .join(" / ");
      if (evList) showdown += `EVs: ${evList}\n`;
  }

  // Nature
  if (finalPokemon.nature) showdown += `${finalPokemon.nature} Nature\n`;

  // IVs (if not all 31)
  if (finalPokemon.IVs && Object.keys(finalPokemon.IVs).length > 0) {
      const ivList = Object.entries(finalPokemon.IVs)
          .filter(([, value]) => (value as number) !== 31)
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