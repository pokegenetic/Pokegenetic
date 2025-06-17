// Utilidad para obtener la URL del cry de un Pokémon desde Pokémon Showdown
// Maneja casos especiales: Paradox, Nidoran, Oricorio, Kommo-o, formas Galar, etc.
export function getShowdownCryUrl(species) {
    if (!species)
        return '';
    let name = species.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Paradox sin guion
    const paradox = [
        'greattusk', 'screamtail', 'brutebonnet', 'fluttermane', 'slitherwing', 'sandyshocks',
        'irontreads', 'ironbundle', 'ironhands', 'ironjugulis', 'ironmoth', 'ironthorns',
        'roaringmoon', 'ironvaliant', 'walkingwake', 'ironleaves', 'gougingfire', 'ragingbolt', 'ironboulder', 'ironcrown', 'pecharunt'
    ];
    if (paradox.includes(name)) {
        name = name.replace(/-/g, '');
    }
    // Nidoran
    if (species.toLowerCase() === 'nidoran♀' || species.toLowerCase() === 'nidoran-f')
        return 'https://play.pokemonshowdown.com/audio/cries/nidoranf.mp3';
    if (species.toLowerCase() === 'nidoran♂' || species.toLowerCase() === 'nidoran-m')
        return 'https://play.pokemonshowdown.com/audio/cries/nidoranm.mp3';
    // Oricorio formas
    if (species.toLowerCase().startsWith('oricorio')) {
        if (species.toLowerCase().includes('pau'))
            return 'https://play.pokemonshowdown.com/audio/cries/oricorio-pau.mp3';
        if (species.toLowerCase().includes('pom'))
            return 'https://play.pokemonshowdown.com/audio/cries/oricorio-pompom.mp3';
        if (species.toLowerCase().includes('sensu'))
            return 'https://play.pokemonshowdown.com/audio/cries/oricorio-sensu.mp3';
        return 'https://play.pokemonshowdown.com/audio/cries/oricorio.mp3';
    }
    // Kommo-o
    if (name === 'kommoo')
        return 'https://play.pokemonshowdown.com/audio/cries/kommoo.mp3';
    // Slowpoke Galar y similares
    if (species.toLowerCase().includes('galar')) {
        name = species.toLowerCase().replace(/ /g, '-');
        return `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`;
    }
    // Default
    return `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`;
}
