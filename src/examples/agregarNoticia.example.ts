/**
 * EJEMPLO: Cómo agregar una nueva noticia a la aplicación
 * 
 * Este archivo muestra cómo agregar noticias reales relacionadas con los juegos de Pokémon para Nintendo Switch.
 * 
 * IMPORTANTE: Solo agregue noticias relevantes para los juegos principales de Switch:
 * - Pokémon Escarlata y Púrpura
 * - Pokémon Leyendas: Arceus  
 * - Pokémon Espada y Escudo
 * - Pokémon Diamante Brillante y Perla Reluciente
 * - Pokémon: Let's Go, Pikachu! y Let's Go, Eevee!
 * 
 * NO incluir noticias de:
 * - Pokémon TCG/JCC (juego de cartas)
 * - Pokémon GO (móvil)
 * - Pokémon Unite (MOBA)
 * - Otros juegos spin-off
 */

import type { Noticia } from '../data/noticias';

// Ejemplo de noticia de evento actual
const ejemploEventoActual: Noticia = {
  id: 'nueva-teraincursion-julio-2025',
  titulo: 'Nueva Teraincursión de Rayquaza confirmada para julio',
  resumen: 'El Pokémon legendario aparecerá en incursiones de 7 estrellas con tipo Tera Dragón.',
  contenido: `🐉 **¡Rayquaza llega a las Teraincursiones!**

  **Fechas**: 15-25 de julio de 2025

  **Características del evento:**
  • Rayquaza de nivel 100 con tipo Tera Dragón
  • Habilidad: Corriente de Aire
  • Movimientos especiales: Ascenso Draco, Vuelo, Terremoto, Pulso Dragón
  • Naturaleza: Ingenua (+Velocidad, -Def. Esp.)

  **Recompensas exclusivas:**
  - Terafragmentos Dragón (hasta 50)
  - MT164 Ascenso Draco (solo una vez)
  - Caramelos EXP XL
  - Objetos competitivos raros

  Este es el primer evento de Rayquaza en Paldea. ¡No te pierdas la oportunidad de capturar a esta leyenda!`,
  imagen: 'https://www.serebii.net/pokedex-sv/art/384.png',
  fecha: '2025-07-10',
  categoria: 'eventos',
  link: 'https://serebii.net/scarletviolet/teraraidbattles/'
};

// Ejemplo de noticia de código de regalo
const ejemploCodigoRegalo: Noticia = {
  id: 'codigo-verano-2025',
  titulo: 'Código de verano: Objetos para el calor',
  resumen: 'Nuevo código disponible con objetos perfectos para aventuras veraniegas.',
  contenido: `☀️ **¡Código de verano disponible!**

  **Código**: SUMMERPA1DEA25
  **Válido hasta**: 31 de agosto de 2025

  **Recompensas incluidas:**
  - 10 Bayas Zanama (reducen el daño de tipo Fuego)
  - 5 Poción Máxima
  - 3 Revivir Máximo  
  - 2 Piedra Solar
  - Sombrero de Verano (accesorio exclusivo)

  **Cómo canjear:**
  1. Ve a Regalo Misterioso en el menú principal
  2. Selecciona "Recibir con código/contraseña"
  3. Introduce: SUMMERPA1DEA25
  4. ¡Disfruta de tus recompensas!

  Perfecto para entrenar en las zonas más cálidas de Paldea.`,
  imagen: 'https://www.serebii.net/scarletviolet/mysterygift.png',
  fecha: '2025-07-01',
  categoria: 'eventos'
};

// Ejemplo de noticia competitiva
const ejemploCompetitivo: Noticia = {
  id: 'formato-competitivo-temporada-4',
  titulo: 'Nueva temporada competitiva: Formato Paldea Extendido',
  resumen: 'Cambios en las reglas de batallas clasificadas con nuevos Pokémon permitidos.',
  contenido: `⚔️ **Temporada 4 de Batallas Clasificadas**

  **Inicio**: 1 de agosto de 2025
  **Formato**: Paldea Extendido

  **Pokémon permitidos:**
  - Pokédex de Paldea completa
  - Pokémon del DLC Tesoro Oculto de Área Cero
  - Pokémon de Kiria y Academia Arándano
  - Algunos legendarios y míticos específicos

  **Nuevas restricciones:**
  - Máximo 2 Pokémon Paradoja por equipo
  - Prohibido: Koraidon y Miraidon
  - Límite de elementos repetidos

  **Premios de temporada:**
  - Título: "Maestro de Paldea"
  - BP extra según ranking final
  - Accesorio exclusivo: Corona Tera

  ¡Prepara tu equipo para la nueva meta competitiva!`,
  imagen: 'https://www.serebii.net/scarletviolet/rankedbattles.png',
  fecha: '2025-07-25',
  categoria: 'noticias'
};

/**
 * PASOS PARA AGREGAR UNA NUEVA NOTICIA:
 * 
 * 1. Abrir el archivo `/src/data/noticias.ts`
 * 2. Copiar uno de los ejemplos de arriba
 * 3. Modificar los campos según la noticia real:
 *    - id: identificador único (formato: slug-fecha)
 *    - titulo: título llamativo y claro
 *    - resumen: descripción breve (1-2 líneas)
 *    - contenido: información completa con formato markdown
 *    - imagen: URL de imagen oficial (preferir serebii.net o pokemon.com)
 *    - fecha: formato 'YYYY-MM-DD'
 *    - categoria: 'eventos' | 'noticias' | 'actualizacion' | 'juegos'
 *    - link: (opcional) enlace a fuente oficial
 * 4. Agregar al inicio del array `noticias`
 * 5. Verificar que no hay errores de compilación
 * 6. Las noticias aparecerán automáticamente en el carrusel
 * 
 * FUENTES RECOMENDADAS:
 * - Serebii.net (eventos y códigos)
 * - Pokemon.com (noticias oficiales)
 * - Centro Pokémon (noticias en español)
 * - Vandal (guías y códigos)
 * 
 * IMÁGENES OFICIALES ÚTILES:
 * - Serebii Pokédex: https://www.serebii.net/pokedex-sv/art/[número].png
 * - Mystery Gift: https://www.serebii.net/scarletviolet/mysterygift.png
 * - Pokémon oficiales: https://assets.pokemon.com/assets/cms2/img/...
 * - Escarlata/Púrpura: https://assets.pokemon.com/assets/cms2/img/video-games/scarlet-violet/sv-artwork.png
 */

export {
  ejemploEventoActual,
  ejemploCodigoRegalo,
  ejemploCompetitivo
};
