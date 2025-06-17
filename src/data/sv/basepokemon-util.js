// Utilidad para obtener datos base de Pokémon estáticos de basepokemon.ts
// y aplicar las restricciones de edición según reglas de legalidad
import { isTransferOnly } from './transfer-only';
// Función para validar la legalidad de un Pokémon basado en sus datos
function isLegalPokemon(pokemon) {
    // Asegura que shiny siempre sea booleano
    const shiny = !!pokemon.shiny;
    // Usar la función isTransferOnly para verificar la legalidad
    if (isTransferOnly(pokemon.name, shiny)) {
        return false;
    }
    // Si no es transfer-only, es legal
    return true;
}
// Función para parsear una entrada Showdown de basepokemon.ts a objeto BasePokemon
export function parseShowdownEntry(entry) {
    // Implementación básica para extraer datos clave
    // (Se recomienda mejorar con expresiones regulares según formato exacto)
    const lines = entry.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length)
        return null;
    let name = lines[0];
    let gender, shiny = false, level = 100, ability = '', friendship, teraType, nature = '', ivs = {}, moves = [], item;
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('Ability:'))
            ability = line.replace('Ability:', '').trim();
        else if (line.startsWith('Level:'))
            level = parseInt(line.replace('Level:', '').trim());
        else if (line.startsWith('Shiny:'))
            shiny = line.includes('Yes');
        else if (line.startsWith('Friendship:'))
            friendship = parseInt(line.replace('Friendship:', '').trim());
        else if (line.startsWith('Tera Type:'))
            teraType = line.replace('Tera Type:', '').trim();
        else if (line.endsWith('Nature'))
            nature = line.replace('Nature', '').trim();
        else if (line.startsWith('IVs:')) {
            const ivPairs = line.replace('IVs:', '').split('/').map(s => s.trim());
            for (const pair of ivPairs) {
                const [val, stat] = pair.split(' ');
                if (stat)
                    ivs[stat] = parseInt(val);
            }
        }
        else if (line.startsWith('- '))
            moves.push(line.replace('- ', ''));
        else if (line.endsWith('(M)') || line.endsWith('(F)'))
            gender = line.endsWith('(M)') ? 'M' : 'F';
    }
    const pokemon = {
        name,
        gender,
        shiny: !!shiny,
        level,
        ability,
        friendship,
        teraType,
        nature,
        ivs,
        moves,
        item
    };
    // Validar legalidad
    if (!isLegalPokemon(pokemon)) {
        // No mostrar alert aquí, solo devolver null
        return null;
    }
    return pokemon;
}
// Nueva función: valida si un Pokémon es seleccionable (está en la lista de disponibles)
export function isSelectablePokemon(name, pokemonList) {
    return pokemonList.some(p => p.name === name);
}
// Restricciones de edición para la UI/backend
export const BASEPOKEMON_EDIT_RULES = {
    allowLevelUp: true, // Solo hacia arriba
    allowLevelDown: false,
    allowIVEdit: false,
    allowGenderEdit: false,
    allowShinyEdit: false,
    allowMovesEdit: true,
    allowItemEdit: true,
    allowAbilityEdit: true,
    allowNatureEdit: true
};
// Dado un objeto BasePokemon y un payload de edición, aplica solo los cambios permitidos
export function applyBasePokemonEdit(base, edit) {
    const result = { ...base };
    if (BASEPOKEMON_EDIT_RULES.allowLevelUp && edit.level && edit.level > base.level)
        result.level = edit.level;
    if (BASEPOKEMON_EDIT_RULES.allowMovesEdit && edit.moves)
        result.moves = edit.moves;
    if (BASEPOKEMON_EDIT_RULES.allowItemEdit && edit.item)
        result.item = edit.item;
    if (BASEPOKEMON_EDIT_RULES.allowAbilityEdit && edit.ability)
        result.ability = edit.ability;
    if (BASEPOKEMON_EDIT_RULES.allowNatureEdit && edit.nature)
        result.nature = edit.nature;
    // IVs, género y shiny no se pueden modificar
    return result;
}
