// pokemonValidator.ts
// Validador centralizado para Pokémon especiales según basepokemonData

import { basepokemonData } from '../data/sv/basepokemon_module';

// 1. Parsear basepokemonData a objetos automáticamente
export interface BasePokemonRestriction {
  name: string;
  ability?: string;
  level?: number;
  shiny?: boolean;
  minLevel?: number;
  allowedAbilities?: string[];
  fixedIVs?: Record<string, number>; // IVs fijos que no se pueden cambiar
}

// Lista de Pokémon Paradox que NO pueden ser shiny
const NON_SHINY_PARADOX = [
  "Gouging Fire",
  "Raging Bolt", 
  "Iron Boulder",
  "Iron Crown",
  "Iron Leaves",
  "Walking Wake",
  "Ursaluna-Bloodmoon"
];

// Función para parsear AUTOMÁTICAMENTE todo el basepokemonData
function parseBasePokemonData(): BasePokemonRestriction[] {
  const blocks = basepokemonData.split(/\n\n+/);
  const restrictions: BasePokemonRestriction[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    
    const name = lines[0];
    const restriction: BasePokemonRestriction = { name };
    
    // IVs por defecto (31 en todos)
    const defaultIVs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    let hasCustomIVs = false;
    let hasExplicitShiny = false;
    
    for (const line of lines.slice(1)) {
      // Parsear habilidad
      if (line.startsWith('Ability:')) {
        restriction.ability = line.replace('Ability:', '').trim();
        restriction.allowedAbilities = [restriction.ability];
      }
      
      // Parsear nivel mínimo
      if (line.startsWith('Level:')) {
        const lvl = parseInt(line.replace('Level:', '').trim(), 10);
        restriction.level = lvl;
        restriction.minLevel = lvl;
      }
      
      // Parsear shiny (solo SI dice "Shiny: Yes" explícitamente)
      if (line.startsWith('Shiny:')) {
        restriction.shiny = line.includes('Yes');
        hasExplicitShiny = true;
      }
      
      // Parsear IVs específicos
      if (line.startsWith('IVs:')) {
        hasCustomIVs = true;
        const ivsText = line.replace('IVs:', '').trim();
        const ivParts = ivsText.split(' / ');
        
        for (const part of ivParts) {
          const match = part.trim().match(/^(\d+)\s+(.+)$/);
          if (match) {
            const value = parseInt(match[1], 10);
            const statName = match[2].toLowerCase();
            
            // Mapear nombres de stats a claves
            const statMap: Record<string, string> = {
              'hp': 'hp',
              'atk': 'atk', 'attack': 'atk',
              'def': 'def', 'defense': 'def',
              'spa': 'spa', 'special attack': 'spa', 'sp. atk': 'spa', 'spatk': 'spa',
              'spd': 'spd', 'special defense': 'spd', 'sp. def': 'spd', 'spdef': 'spd',
              'spe': 'spe', 'speed': 'spe'
            };
            
            const statKey = statMap[statName] || statName;
            if (defaultIVs.hasOwnProperty(statKey)) {
              defaultIVs[statKey as keyof typeof defaultIVs] = value;
            }
          }
        }
      }
    }
    
    // Si el Pokémon está en basepokemon.ts pero NO tiene "Shiny: Yes" explícito, 
    // entonces por defecto no puede ser shiny
    if (!hasExplicitShiny) {
      restriction.shiny = false;
    }
    
    // Solo prohibir shiny para los Pokémon específicamente listados en NON_SHINY_PARADOX
    // PERO solo si no se especificó explícitamente "Shiny: Yes"
    if (NON_SHINY_PARADOX.includes(name) && restriction.shiny === undefined) {
      restriction.shiny = false;
    }
    
    // Siempre asignar IVs (ya sean los por defecto 31 o los específicos)
    restriction.fixedIVs = defaultIVs;
    
    restrictions.push(restriction);
  }
  
  return restrictions;
}

const restrictions = parseBasePokemonData();

// 2. Validador principal
export function validatePokemon(pokemon: any): string[] {
  // pokemon: objeto con los datos del Pokémon a validar
  // Debe tener al menos: name, ability, level, shiny
  const errors: string[] = [];
  const r = restrictions.find(r => r.name.toLowerCase() === pokemon.name?.toLowerCase());
  if (!r) return errors; // No hay restricciones

  // Validar nivel mínimo
  if (r.minLevel && pokemon.level < r.minLevel) {
    errors.push(`El nivel mínimo permitido para ${r.name} es ${r.minLevel}.`);
  }
  
  // Validar shiny - solo bloquear si explícitamente está marcado como false
  if (r.shiny === false && pokemon.shiny) {
    errors.push(`${r.name} no puede ser shiny.`);
  }
  
  // Validar habilidad
  if (r.allowedAbilities && !r.allowedAbilities.includes(pokemon.ability)) {
    errors.push(`${r.name} solo puede tener la habilidad: ${r.allowedAbilities.join(', ')}.`);
  }
  
  // Validar IVs fijos
  if (r.fixedIVs && pokemon.IVs) {
    const statNames: Record<string, string> = { hp: 'HP', atk: 'Ataque', def: 'Defensa', spa: 'Ataque Esp.', spd: 'Defensa Esp.', spe: 'Velocidad' };
    for (const [stat, expectedValue] of Object.entries(r.fixedIVs)) {
      if (pokemon.IVs[stat] !== undefined && pokemon.IVs[stat] !== expectedValue) {
        errors.push(`${r.name} debe tener ${expectedValue} IV en ${statNames[stat] || stat}.`);
      }
    }
  }
  
  // Puedes agregar más validaciones aquí

  return errors;
}

// 3. (Opcional) Exponer restricciones para debug
export function getBasePokemonRestrictions() {
  return restrictions;
}
