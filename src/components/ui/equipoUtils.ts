// /Users/javierignacioherrera/Desktop/poke/src/components/ui/equipoUtils.ts
export function formatNameForPokedexLookup(name: string): string {
  if (!name) return '';
  // Converts to lowercase and removes all non-alphanumeric characters.
  // Consistent with Pokedex keys like 'mrmime', 'typenull', 'nidoranf'.
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}
