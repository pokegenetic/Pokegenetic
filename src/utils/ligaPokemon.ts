// Función para generar huevo de tipo específico para incubadoras
export const generateEggForType = (tipo: string) => {
  const now = Date.now();
  return {
    createdAt: now,
    hatched: false,
    pokemon: null,
    id: Math.random().toString(36).slice(2),
    lastSaved: now,
    type: tipo, // Tipo específico del gimnasio
    source: 'liga-pokemon' // Marca de origen
  };
};
