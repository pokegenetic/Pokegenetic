// Mapeo de nombres de Pokémon a IDs para sprites
export const pokemonNameToId: { [key: string]: number } = {
  // Kanto Pokémon
  'Geodude': 74,
  'Graveler': 75,
  'Onix': 95,
  'Golem': 76,
  'Machop': 66,
  'Staryu': 120,
  'Psyduck': 54,
  'Goldeen': 118,
  'Starmie': 121,
  'Tentacool': 72,
  'Horsea': 116,
  'Seaking': 119,
  'Pikachu': 25,
  'Voltorb': 100,
  'Magnemite': 81,
  'Raichu': 26,
  'Bellsprout': 69,
  'Weepinbell': 70,
  'Victreebel': 71,
  'Oddish': 43,
  'Gloom': 44,
  'Vileplume': 45,
  'Ponyta': 77,
  'Rapidash': 78,
  'Growlithe': 58,
  'Arcanine': 59,
  'Abra': 63,
  'Kadabra': 64,
  'Alakazam': 65,
  'Slowpoke': 79,
  'Slowbro': 80,
  'Gastly': 92,
  'Haunter': 93,
  'Gengar': 94,
  'Koffing': 109,
  'Weezing': 110,
  'Rhyhorn': 111,
  'Rhydon': 112,
  'Venomoth': 49,
  'Venonat': 48,
  'Nidorino': 33,
  'Nidoking': 34,
  'Nidorina': 30,
  'Nidoqueen': 31,
  'Hitmonlee': 106,
  'Hitmonchan': 107,
  'Machoke': 67,
  'Machamp': 68,
  'Gyarados': 130,
  'Sandslash': 28,
  'Sandshrew': 27,
  'Dugtrio': 51,
  'Diglett': 50,
  'Persian': 53,
  'Meowth': 52,
  'Primeape': 57,
  'Mankey': 56,
  'Jynx': 124,
  'Lapras': 131,
  'Cloyster': 91,
  'Dewgong': 87,
  'Magmar': 126,
  'Electabuzz': 125,
  'Tangela': 114,
  'Mr. Mime': 122,
  'Drowzee': 96,
  'Hypno': 97,
  'Golbat': 42,
  'Crobat': 169,
  'Arbok': 24,
  'Grimer': 88,
  'Muk': 89,
  // Elite Four Pokemon
  'Dragonair': 148,
  'Dragonite': 149,
  'Aerodactyl': 142,
  'Pidgeot': 18,
  'Venusaur': 3,
  'Charizard': 6,
  'Blastoise': 9,
  // Johto Pokemon that might appear
  'Forretress': 205,
  'Skarmory': 227,
  'Houndoom': 229,
  'Tyranitar': 248
};

// Función para obtener sprite por ID directo (más confiable)
export function getPokemonSpriteById(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;
}

// Función para obtener sprite estático por ID
export function getPokemonStaticSpriteById(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${pokemonId}.png`;
}

// Función para obtener sprite normal por ID
export function getPokemonBasicSpriteById(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}

export function getPokemonSpriteUrl(pokemonName: string): string {
  console.log('Getting sprite for:', pokemonName);
  
  const pokemonId = pokemonNameToId[pokemonName];
  if (pokemonId) {
    console.log('Found ID:', pokemonId, 'for', pokemonName);
    // Usar sprites animados de la generación 5 (B2W2) que se ven mucho mejor
    const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;
    console.log('Generated animated URL:', url);
    return url;
  }
  
  console.log('No ID found for:', pokemonName, 'using fallback');
  
  // Fallback: intentar buscar por nombre en la PokeAPI
  const fallbackName = pokemonName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/mr/g, 'mr-')
    .replace(/type/g, '-type');
  
  console.log('Fallback name:', fallbackName);
  
  // Intentar con varios formatos
  const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${fallbackName}.png`;
  console.log('Fallback URL:', fallbackUrl);
  return fallbackUrl;
}

export function getPokemonIconUrl(pokemonName: string): string {
  const pokemonId = pokemonNameToId[pokemonName];
  if (pokemonId) {
    // Usar sprites animados de la generación 5, pero con fallback a estáticos
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;
  }
  
  // Fallback a sprite normal
  return getPokemonSpriteUrl(pokemonName);
}

// Nueva función para sprites estáticos como alternativa
export function getPokemonStaticIconUrl(pokemonName: string): string {
  console.log('Getting static sprite for:', pokemonName);
  
  const pokemonId = pokemonNameToId[pokemonName];
  if (pokemonId) {
    console.log('Found ID:', pokemonId, 'for static sprite');
    // Usar sprites estáticos de alta calidad de la generación 5
    const url = getPokemonStaticSpriteById(pokemonId);
    console.log('Generated static URL:', url);
    return url;
  }
  
  console.log('No ID found for static sprite, using basic fallback');
  
  // Fallback: sprite estático normal
  const fallbackName = pokemonName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/mr/g, 'mr-')
    .replace(/type/g, '-type');
  
  const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${fallbackName}.png`;
  console.log('Static fallback URL:', fallbackUrl);
  return fallbackUrl;
}

// Función adicional para obtener sprites de showdown (como alternativa)
export function getShowdownSpriteUrl(pokemonName: string): string {
  const name = pokemonName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/mr/g, 'mr');
  
  return `https://play.pokemonshowdown.com/sprites/ani/${name}.gif`;
}
