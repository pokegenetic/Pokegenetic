// Utilidades para la creación legal de Pokémon estáticos
import { parseShowdownEntry, applyBasePokemonEdit } from './basepokemon-util';
import { isTransferOnly } from './transfer-only';
// Recibe el nombre, género y shiny, y un array de entradas Showdown (string)
// Devuelve el objeto BasePokemon correspondiente, o null si no existe o es transfer-only
export function getLegalBasePokemon({ name, gender, shiny }, showdownEntries) {
    // Primero, bloquea si es transfer-only
    if (isTransferOnly(name, !!shiny)) {
        return null;
    }
    // Busca la entrada que coincida con nombre, género y shiny
    for (const entry of showdownEntries) {
        const parsed = parseShowdownEntry(entry);
        if (!parsed)
            continue;
        // Para género: si parsed.gender es undefined (sin género/legendario) y gender es 'N' (neutral), es match
        const genderMatch = typeof gender === 'undefined' ||
            parsed.gender === gender ||
            (parsed.gender === undefined && gender === 'N');
        if (parsed.name === name &&
            genderMatch &&
            (typeof shiny === 'undefined' || !!parsed.shiny === !!shiny)) {
            return parsed;
        }
    }
    return null;
}
// Aplica edición legal sobre un Pokémon base
export function editLegalBasePokemon(base, edit) {
    return applyBasePokemonEdit(base, edit);
}
