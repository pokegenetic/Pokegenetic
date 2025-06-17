// src/lib/parseShowdown.ts
import { getGenderForSpecies, getRandomMovesForSpecies, getPokemonDetails } from './pokedexHelper';
import { Moves } from '@/data/sv/moves';
// Helper function to get a random element from an array
function getRandomElement(arr) {
    if (arr.length === 0)
        return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}
// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
const ALL_PKMN_TYPES = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Stellar"];
export function parseShowdownText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const autoAssignmentMessages = [];
    let nickname = '';
    let speciesName = '';
    let gender = undefined;
    let item = undefined;
    let ability = null;
    let level = 100;
    let isShiny = false;
    let nature = 'Serious';
    let moves = [];
    let teraType = '';
    let types = ['Normal'];
    // Default IVs
    const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    // Default EVs
    const evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    if (lines.length === 0) {
        autoAssignmentMessages.push("Input text is empty. Cannot parse Pokémon.");
        return {
            pokemon: {
                name: 'Unknown',
                species: 'Unknown',
                gender: 'N',
                item: '',
                ability: null,
                isShiny: false,
                teraType: 'Normal',
                EVs: evs,
                IVs: ivs,
                nature: 'Serious',
                moves: ['-', '-', '-', '-'],
                level: 100,
                types: ['Normal']
            },
            messages: autoAssignmentMessages
        };
    }
    // Parse the first line: Nickname (Species) (Gender) @ Item
    const firstLine = lines[0];
    const itemSplit = firstLine.split('@');
    let nameInfoPart = itemSplit[0].trim();
    if (itemSplit.length > 1) {
        item = itemSplit[1].trim();
    }
    const genderMatch = nameInfoPart.match(/\s\(([MF])\)$/i);
    if (genderMatch) {
        gender = genderMatch[1].toUpperCase();
        nameInfoPart = nameInfoPart.substring(0, nameInfoPart.length - genderMatch[0].length).trim();
    }
    const speciesParenthesesMatch = nameInfoPart.match(/^(.*?)\s\(([^)]+?)\)$/);
    if (speciesParenthesesMatch) {
        nickname = speciesParenthesesMatch[1].trim();
        speciesName = speciesParenthesesMatch[2].trim();
        if (!nickname) {
            nickname = speciesName;
        }
    }
    else {
        speciesName = nameInfoPart.trim();
        nickname = speciesName;
    }
    if (!nickname && speciesName) {
        nickname = speciesName;
    }
    // --- MEJORA ROBUSTA: Soporte para '[Mote] ([Especie]) ([Género]) @ [Objeto]' ---
    let raw = itemSplit[0].trim();
    let genderMatch2 = raw.match(/\((M|F|N)\)\s*$/i);
    if (genderMatch2) {
        gender = genderMatch2[1].toUpperCase();
        raw = raw.replace(/\((M|F|N)\)\s*$/i, '').trim();
    }
    let speciesMatch2 = raw.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (speciesMatch2) {
        nickname = speciesMatch2[1].trim();
        speciesName = speciesMatch2[2].trim();
        if (!nickname)
            nickname = speciesName;
    }
    else {
        speciesName = raw.trim();
        nickname = speciesName;
    }
    let cleanSpeciesName = speciesName.replace(/\s*\((M|F|N)\)$/i, '').trim();
    const innerSpeciesMatch = cleanSpeciesName.match(/\(([^)]+)\)$/);
    if (innerSpeciesMatch) {
        cleanSpeciesName = innerSpeciesMatch[1].trim();
    }
    // Buscar en el Pokédex usando el nombre limpio
    const pokemonDetails = getPokemonDetails(cleanSpeciesName);
    if (!pokemonDetails) {
        autoAssignmentMessages.push(`Species "${cleanSpeciesName}" not found. Some data may be incorrect or missing.`);
        types = ['Normal'];
        teraType = 'Normal';
        const randomFallbackMoves = getRandomMovesForSpecies(cleanSpeciesName);
        if (randomFallbackMoves.length > 0 && !randomFallbackMoves.every(m => m === "-")) {
            moves = randomFallbackMoves;
        }
        else {
            moves = ['-', '-', '-', '-'];
        }
        if (moves.length < 4)
            autoAssignmentMessages.push(`Assigned default/random moves for ${cleanSpeciesName} as it was not found or had no moves.`);
    }
    else {
        types = pokemonDetails.types;
        teraType = pokemonDetails.types?.[0] || 'Normal';
        if (!gender) {
            gender = pokemonDetails.gender || getGenderForSpecies(cleanSpeciesName) || 'N';
            autoAssignmentMessages.push(`Gender for ${cleanSpeciesName} was auto-assigned to ${gender}.`);
        }
    }
    // Parse other lines
    let movesFound = 0;
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('Ability: ')) {
            ability = line.substring('Ability: '.length).trim();
        }
        else if (line.startsWith('Level: ')) {
            level = parseInt(line.substring('Level: '.length).trim(), 10) || 100;
        }
        else if (line.startsWith('Shiny: Yes')) {
            isShiny = true;
        }
        else if (line.startsWith('Tera Type: ')) {
            teraType = line.substring('Tera Type: '.length).trim();
        }
        else if (line.startsWith('EVs: ')) {
            const evParts = line.substring('EVs: '.length).split('/');
            evParts.forEach(part => {
                const [valueStr, statKeyDirty] = part.trim().split(' ');
                const key = statKeyDirty?.toLowerCase();
                if (key && evs.hasOwnProperty(key)) {
                    evs[key] = parseInt(valueStr, 10) || 0;
                }
            });
        }
        else if (line.startsWith('IVs: ')) {
            const ivParts = line.substring('IVs: '.length).split('/');
            ivParts.forEach(part => {
                const [valueStr, statKeyDirty] = part.trim().split(' ');
                const key = statKeyDirty?.toLowerCase();
                if (key && ivs.hasOwnProperty(key)) {
                    ivs[key] = parseInt(valueStr, 10) || 0;
                }
            });
        }
        else if (line.match(/^[A-Za-zÀ-ÿ]+ Nature$/)) {
            nature = line.replace(/ Nature$/, '').trim();
        }
        else if (line.startsWith('- ') && movesFound < 4) {
            let move = line.substring(2).split('\n')[0].trim();
            move = move.split('\r')[0].trim();
            move = move.replace(/\s+/g, ' ');
            if (move && move !== '-') {
                moves.push(move);
            }
            else {
                moves.push('-');
            }
            movesFound++;
        }
        if (movesFound >= 4)
            break;
    }
    // Auto-complete moves if not enough were parsed and species was found
    if (moves.length < 4 && pokemonDetails) {
        const extraMoves = (pokemonDetails.moves || []).filter(m => !moves.includes(m) && m !== '-');
        while (moves.length < 4 && extraMoves.length > 0) {
            moves.push(extraMoves.shift());
        }
    }
    while (moves.length < 4) {
        moves.push("-");
    }
    moves = moves.slice(0, 4);
    const parsedPokemon = {
        name: nickname,
        species: cleanSpeciesName,
        gender,
        item,
        ability,
        isShiny,
        isHO: false,
        teraType,
        EVs: { ...evs },
        IVs: { ...ivs },
        nature,
        moves: [...moves],
        level,
        types,
    };
    return { pokemon: parsedPokemon, messages: autoAssignmentMessages };
}
export function parseShowdownTeam(text) {
    // Split por dos o más saltos de línea (con o sin espacios)
    const pokemonBlocks = text.trim().split(/\n{2,}|(?:\r?\n){2,}/);
    return pokemonBlocks
        .map(block => block.trim())
        .filter(block => block.length > 0)
        .map(block => parseShowdownText(block))
        .filter(p => p.pokemon.species && p.pokemon.species !== 'Unknown' && p.pokemon.moves.some(m => m && m !== "- -" && m !== "-" && m !== ""));
}
export function parseShowdownTextToArray(fullText) {
    if (!fullText || fullText.trim() === '') {
        return [];
    }
    const pokemonBlocks = fullText.split('\n\n');
    const parsedTeam = [];
    for (const block of pokemonBlocks) {
        const trimmedBlock = block.trim();
        if (trimmedBlock !== '') {
            const { pokemon } = parseShowdownText(trimmedBlock);
            if (pokemon &&
                pokemon.species &&
                pokemon.species !== 'Unknown' &&
                pokemon.moves.some(m => m && m !== "- -" && m !== "-" && m !== "")) {
                parsedTeam.push(pokemon);
            }
        }
    }
    return parsedTeam;
}
// Helper: read equipo.txt, parse all blocks, and return as ParsedPokemon[]
export async function readEquipoTxtAndParse() {
    const response = await fetch('/equipo.txt');
    const text = await response.text();
    return parseShowdownTextToArray(text);
}
// Helper: write the full team to equipo.txt (overwrite)
export async function writeEquipoTxtFromTeam(team) {
    // Filtra Pokémon válidos antes de exportar
    const validTeam = team.filter(p => p &&
        p.species &&
        Array.isArray(p.moves) &&
        p.moves.some(m => m && m !== "- -" && m !== ""));
    // generateShowdownTextFromParsed debe recibir el Pokémon como argumento
    const showdownText = validTeam.map(generateShowdownTextFromParsed).filter(Boolean).join('\n\n');
    await fetch('/equipo.txt', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: showdownText,
    });
}
// Helper: add a new Pokémon to equipo.txt
export async function addPokemonToEquipoTxt(newPokemon) {
    const team = await readEquipoTxtAndParse();
    team.push(newPokemon);
    await writeEquipoTxtFromTeam(team);
}
// Helper: update a Pokémon at a given index in equipo.txt
export async function updatePokemonInEquipoTxt(index, updatedPokemon) {
    const team = await readEquipoTxtAndParse();
    if (index >= 0 && index < team.length) {
        team[index] = updatedPokemon;
        await writeEquipoTxtFromTeam(team);
    }
}
// Helper: delete a Pokémon at a given index in equipo.txt
export async function deletePokemonFromEquipoTxt(index) {
    const team = await readEquipoTxtAndParse();
    if (index >= 0 && index < team.length) {
        team.splice(index, 1);
        await writeEquipoTxtFromTeam(team);
    }
}
// Helper to generate Showdown text from a ParsedPokemon object
export function generateShowdownTextFromParsed(p) {
    const lines = [];
    // First Line: Name, Species, Gender, Item
    const namePart = (p.name && p.name.toLowerCase() !== p.species.toLowerCase())
        ? `${p.name} (${p.species})`
        : p.species;
    const genderPart = (p.gender && p.gender !== 'N') ? ` (${p.gender})` : '';
    const itemPart = p.item ? ` @ ${p.item}` : '';
    lines.push(`${namePart}${genderPart}${itemPart}`);
    // Ability
    if (p.ability) {
        lines.push(`Ability: ${p.ability}`);
    }
    // Level
    if (p.level && p.level !== 100) {
        lines.push(`Level: ${p.level}`);
    }
    // Shiny
    if (p.isShiny) {
        lines.push('Shiny: Yes');
    }
    // Tera Type
    if (p.teraType && p.teraType.toLowerCase() !== 'none' && p.teraType.trim() !== '') {
        lines.push(`Tera Type: ${p.teraType}`);
    }
    // EVs
    const statsOrder = [
        { key: 'hp', display: 'HP' },
        { key: 'atk', display: 'Atk' },
        { key: 'def', display: 'Def' },
        { key: 'spa', display: 'SpA' },
        { key: 'spd', display: 'SpD' },
        { key: 'spe', display: 'Spe' }
    ];
    if (p.EVs && Object.values(p.EVs).some(ev => typeof ev === 'number' && ev > 0)) {
        const evParts = [];
        for (const stat of statsOrder) {
            const value = p.EVs[stat.key];
            if (typeof value === 'number' && value > 0) {
                evParts.push(`${value} ${stat.display}`);
            }
        }
        if (evParts.length > 0) {
            lines.push(`EVs: ${evParts.join(' / ')}`);
        }
    }
    // IVs
    if (p.IVs && Object.values(p.IVs).some(iv => typeof iv === 'number' && iv !== 31)) {
        const ivParts = [];
        for (const stat of statsOrder) {
            const value = p.IVs[stat.key];
            if (typeof value === 'number' && value !== 31) {
                ivParts.push(`${value} ${stat.display}`);
            }
        }
        if (ivParts.length > 0) {
            lines.push(`IVs: ${ivParts.join(' / ')}`);
        }
    }
    // Nature
    if (p.nature) {
        lines.push(`${p.nature} Nature`);
    }
    // Moves
    if (p.moves && Array.isArray(p.moves)) {
        for (let i = 0; i < 4; i++) {
            let moveName = p.moves[i];
            if (moveName && typeof moveName === 'string') {
                const newlineIndex = moveName.indexOf('\n');
                if (newlineIndex !== -1) {
                    moveName = moveName.substring(0, newlineIndex);
                }
                moveName = moveName.trim();
                if (moveName) {
                    // Usar el nombre formateado desde Moves si existe
                    let displayName = Moves[moveName]?.name || moveName;
                    // Capitalizar la primera letra por si acaso
                    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                    lines.push(`- ${displayName}`);
                }
                else {
                    lines.push(`- -`);
                }
            }
            else {
                lines.push(`- -`);
            }
        }
    }
    else {
        for (let i = 0; i < 4; i++) {
            lines.push(`- -`);
        }
    }
    return lines.filter(line => line !== null && line !== undefined).join('\n');
}
