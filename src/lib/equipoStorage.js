export function getPokemonTeam() {
    try {
        const raw = localStorage.getItem('pokemonTeam');
        if (!raw)
            return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr)
            ? arr.filter(p => typeof p === 'object' && p !== null &&
                ((p.species && Array.isArray(p.moves)) ||
                    (p.type === 'pack' && typeof p.packName === 'string' && Array.isArray(p.pokemons)) ||
                    (p.type === 'homepack' && typeof p.packName === 'string' && typeof p.trainerName === 'string')))
            : [];
    }
    catch (e) {
        localStorage.removeItem('pokemonTeam');
        return [];
    }
}
export function setPokemonTeam(team) {
    localStorage.setItem('pokemonTeam', JSON.stringify(team));
}
export const addPokemonToTeam = (pokemon) => {
    const team = getPokemonTeam();
    team.push(pokemon);
    setPokemonTeam(team);
};
export const addHomePackToTeam = (homePack) => {
    const team = getPokemonTeam();
    team.push(homePack);
    setPokemonTeam(team);
};
