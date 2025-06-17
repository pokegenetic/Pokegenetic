export interface Noticia {
  id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  imagen: string;
  fecha: string;
  categoria: 'juegos' | 'actualizacion' | 'eventos' | 'noticias';
  link?: string;
}

export const noticias: Noticia[] = [
  {
    id: 'pokemon-home-update-meloetta-shiny',
    titulo: 'Nueva actualización de Pokémon HOME y un Meloetta variocolor de regalo',
    resumen: '¡Consigue a Meloetta variocolor (shiny) en Pokémon HOME completando las Pokédex de Paldea, Noroteo y Arándano en Pokémon Escarlata y Púrpura! Descubre cómo obtener este Pokémon mítico y musical de evento oficial.',
    contenido: `🎵 **¡Nueva actualización de Pokémon HOME disponible!**\n\n**¿Cómo conseguir a Meloetta variocolor?**\n\nPara recibir a Meloetta variocolor (shiny) en Pokémon HOME, debes completar las siguientes Pokédex en Pokémon Escarlata y Púrpura:\n\n• Pokédex de Paldea\n• Pokédex de Noroteo\n• Pokédex Arándano\n\nUna vez completadas, entra en la app móvil de Pokémon HOME, ve a la pestaña de Juegos y confirma el progreso. Si ya las habías completado antes, también puedes reclamar el regalo.\n\n**Requisitos:**\n- Tener vinculada una cuenta Nintendo a Pokémon HOME\n- Haber actualizado la app a la versión 3.2.2 o superior\n- Solo se puede recibir un Meloetta variocolor por cuenta Nintendo\n\n**Detalles del Pokémon:**\n- **Pokémon**: Meloetta (Forma Lírica)\n- **Características**: Shiny/Variocolor\n- **Nivel**: 50\n- **Naturaleza**: Modesta\n- **Habilidad**: Dicha\n- **Movimientos**: Canto Arcaico, Eco Voz, Psicorrayo, Canto\n- **Entrenador original**: HOME\n\n**Disponible hasta el 31 de julio de 2025**\n\n¡No te pierdas esta oportunidad única de agregar a Meloetta variocolor a tu colección en Pokémon Escarlata y Púrpura!\n\n[Ver fuente oficial](https://scarletviolet.pokemon.com/es-es/events/shiny-meloetta-pokemon-home-update/)`,
    imagen: 'https://www.pokemon.com/static-assets/content-assets/cms2/img/video-games/_tiles/pokemon-home/distributions/2024/10/18/pokemon-home-169.png',
    fecha: '2025-06-13',
    categoria: 'actualizacion',
    link: 'https://scarletviolet.pokemon.com/es-es/events/shiny-meloetta-pokemon-home-update/'
  },
  {
    id: 'porygon2-mighty-raid-june-2025',
    titulo: '¡Evento Porygon2 Poderoso activo hasta el 15 de junio!',
    resumen: 'Enfréntate al Porygon2 Poderoso de 7 estrellas con tipo Tera Normal y grandes recompensas.',
    contenido: `🔥 **¡Evento especial en marcha!** Del 5 al 15 de junio de 2025

    **Porygon2 Poderoso** aparece en las Teraincursiones de 7 estrellas con características únicas:
    • **Nivel 100** con habilidad Analítico
    • **Tipo Tera Normal** y naturaleza Calmada
    • Movimientos: Tri Ataque, Psíquico, Rayo, Rayo Hielo
    • Movimientos adicionales: Espacio Raro, Descarga

    **Recompensas especiales:**
    - Terafragmentos Normal (hasta 40)
    - MT126 (solo una vez para el anfitrión)
    - Parche Habilidad (solo una vez)
    - Caramelos EXP, Calcio y más objetos valiosos

    ¡Solo se puede capturar una vez, pero puedes desafiarlo múltiples veces para obtener más recompensas!`,
    imagen: 'https://www.serebii.net/scarletviolet/porygon2raids.jpg',
    fecha: '2025-06-05',
    categoria: 'eventos',
    link: 'https://serebii.net/scarletviolet/teraraidbattles/event-mightyporygon2.shtml'
  },
  {
    id: 'porygon2-mass-outbreak-june-2025',
    titulo: 'Brotes Masivos de Porygon2 - Evento especial',
    resumen: 'Porygon2 aparece en brotes masivos por toda Paldea, Kiria y Academia Arándano.',
    contenido: `🎯 **Evento de Brotes Masivos activo hasta el 15 de junio**

    **Porygon2** aparece con mayor frecuencia en todas las regiones:
    • **Paldea**: Todas las áreas (niveles 10-65)
    • **Kiria**: Todas las áreas (niveles 10-65)  
    • **Academia Arándano**: Todas las áreas (niveles 55-65)

    **Características especiales:**
    - Probabilidad de Shiny: **0.5%** (10 veces mayor que lo normal)
    - Bioma: Aéreo (100% de aparición en brotes)
    - Movimientos y habilidades estándar
    - Escala normal

    ¡Perfecta oportunidad para conseguir un Porygon2 shiny o completar tu Pokédex!`,
    imagen: 'https://www.serebii.net/scarletviolet/porygon2outbreaks.jpg',
    fecha: '2025-06-05',
    categoria: 'eventos',
    link: 'https://serebii.net/scarletviolet/massoutbreakevent/porygon2outbreaks.shtml'
  },
  {
    id: 'active-serial-codes-june-2025',
    titulo: 'Códigos de regalo activos - Junio 2025',
    resumen: 'Códigos especiales disponibles para objetos, Pokémon y accesorios únicos.',
    contenido: `🎁 **Códigos activos en Pokémon Escarlata y Púrpura:**

    **Códigos de objetos (válidos hasta enero 2026):**
    - **P4LD3AP1CN1C**: 5 Pepinillos, 5 Tomates, 5 Cebollas, 5 Hamburguesas, 5 Huevos, 5 Ensalada de Papa
    - **ELEMENTST0NES**: Piedra Fuego, Trueno, Agua, Hoja y Hielo
    - **C0SM1CST0NES**: Piedra Solar, Lunar, Brillante, Noche y Alba
    - **V1TAM1NS**: 2x Más PS, Proteína, Hierro, Carburante, Calcio y Zinc

    **Códigos de accesorios:**
    - **SB00KC0VER** (Escarlata): Funda Escarlata
    - **VB00KC0VER** (Púrpura): Funda Púrpura

    **Pokémon especiales disponibles:**
    - **Y0AS0B1B1R1B1R1**: Pawmot de YOASOBI (válido hasta feb 2025)
    - **L1K0W1TH906**: Sprigatito de Liko (válido hasta sep 2024)

    ¡Usa Regalo Misterioso > Recibir con código/contraseña!`,
    imagen: 'https://nintendosoup.com/wp-content/uploads/2022/12/Pokemon-SV-Mystery-Gift-1038x576.jpg',
    fecha: '2025-06-01',
    categoria: 'eventos'
  },
  {
    id: 'championship-pokemon-distributions-2025',
    titulo: 'Campeonatos de Pokémon 2025 - Distribuciones especiales',
    resumen: 'Pokémon ganadores de campeonatos mundiales disponibles por tiempo limitado.',
    contenido: `🏆 **Pokémon de campeones disponibles:**

    **Recién distribuidos (junio 2025):**
    - **Flutter Mane de Hyuma** (21-22 jun): Del campeón de Japón 2024
    - **Incineroar de Wolfe** (13-15 jun): Del campeón europeo 2025  
    - **Porygon2 de Juyoung Hong** (7-8 jun): Del ganador de Trainers Cup 2024

    **Aún disponibles:**
    - **Rillaboom** (hasta 31 jul): R1LLAB00M2024TW
    - **Jumpluff** (hasta 28 feb): EU1C25SUNNYDAY
    - **Pelipper** (hasta 21 nov): W1DEGUARDLA1C25

    Estos Pokémon tienen la cinta de Campeón de Batalla y movimientos optimizados para competitivo. ¡Perfectos para mejorar tu equipo en batallas clasificadas!

    Todos los códigos se pueden canjear en Regalo Misterioso.`,
    imagen: 'https://www.serebii.net/themeparks/universalstudiosjapan/unstoppablehalloweenparty.jpg',
    fecha: '2025-06-01',
    categoria: 'noticias',
    link: 'https://serebii.net/scarletviolet/serialcode.shtml'
  },
  {
    id: 'nintendo-switch-2-backward-compatibility',
    titulo: 'Nintendo Switch 2: Mejoras y retrocompatibilidad para Pokémon Escarlata y Púrpura',
    resumen: 'Pokémon Escarlata y Púrpura recibe un parche gratuito en Switch 2 con mejoras gráficas, de rendimiento y compatibilidad total. Descubre las diferencias y novedades.',
    contenido: `🆕 **Pokémon Escarlata y Púrpura: Parche de mejora gratuito en Nintendo Switch 2**\n\nLa nueva Nintendo Switch 2 no solo es retrocompatible con todos los juegos de Switch, sino que además ofrece un **parche gratuito** para Pokémon Escarlata y Púrpura que transforma la experiencia:\n\n**Principales mejoras en Switch 2:**\n• Resolución 4K reescalada desde 1440p y 60 FPS estables en modo Dock\n• Compatibilidad con HDR: colores más vivos y mejor contraste\n• Reducción drástica del popping y mayor distancia de dibujado\n• Hasta 36 Pokémon simultáneos en pantalla (frente a 16 en Switch 1)\n• Tiempos de carga mucho más rápidos (viajes rápidos casi instantáneos)\n• Texturas de mayor resolución y menos dientes de sierra\n\n**¿Cómo funciona la retrocompatibilidad?**\n- Solo necesitas tu cartucho o versión digital de Switch 1\n- Descarga la actualización gratuita en Switch 2\n- Conserva tus partidas y progreso\n\n**¿Vale la pena?**\nLa diferencia visual y de fluidez es enorme: Switch 2 ofrece la mejor forma de jugar a Pokémon Escarlata y Púrpura, con una experiencia comparable a un remaster.\n\n**Lanzamiento:** Parche disponible desde junio 2025.`,
    imagen: 'https://img.asmedia.epimg.net/resizer/v2/TVIKF5CNYFFZBBKEXFY2457CYU.jpg?auth=2ac59930932e04c45094b3d938bcf76f71872d8e5de963054e0e708e820c0cf2&width=1288',
    fecha: '2025-06-13',
    categoria: 'noticias',
    link: 'https://as.com/meristation/noticias/comparativa-de-pokemon-escarlata-y-purpura-en-nintendo-switch-1-y-2-asi-mejora-la-calidad-y-el-rendimiento-su-parche-gratis-v/'
  },
  {
    id: 'pokemon-sv-second-anniversary',
    titulo: 'Segundo aniversario de Pokémon Escarlata y Púrpura',
    resumen: 'Celebración del segundo aniversario con códigos especiales de objetos evolutivos.',
    contenido: `🎉 **Celebrando 2 años de aventuras en Paldea**

    Para conmemorar el segundo aniversario de Pokémon Escarlata y Púrpura (noviembre 2024), se lanzaron códigos especiales con objetos evolutivos:

    **Códigos conmemorativos (válidos hasta enero 2026):**
    - **ELEMENTST0NES**: Piedras básicas (Fuego, Trueno, Agua, Hoja, Hielo)
    - **C0SM1CST0NES**: Piedras especiales (Solar, Lunar, Brillante, Noche, Alba)  
    - **V1TAM1NS**: Vitaminas para entrenamiento

    Estos códigos fueron distribuidos a través de boletines de Nintendo América y celebran los logros alcanzados durante estos dos años de exploración en la región de Paldea.

    **Datos del aniversario:**
    • Más de 25 millones de copias vendidas
    • Cientos de eventos y distribuciones especiales
    • Actualizaciones constantes con nuevo contenido

    ¡Una excelente oportunidad para hacer evolucionar a tus Pokémon favoritos!`,
    imagen: 'https://assets.nintendo.com/image/upload/q_auto/f_auto/c_fill,w_1200/ncom/en_US/articles/2022/new-details-revealed-for-pokemon-scarlet-and-pokemon-violet-including-tera-raid-battles/1920x1080_pspv_080322_wn',
    fecha: '2024-11-19',
    categoria: 'noticias'
  },
  {
    id: 'regulation-g-2025',
    titulo: '¡Regulation G llega a Pokémon Escarlata y Púrpura!',
    resumen: 'La nueva Regulation G redefine el competitivo VGC 2025: descubre los Pokémon permitidos, fechas clave y cambios importantes.',
    contenido: `⚔️ **¡Comienza Regulation G en el competitivo de Pokémon Escarlata y Púrpura!**\n\nLa nueva Regulation G ya está activa en el formato VGC 2025, trayendo consigo importantes novedades para los torneos oficiales:\n\n**¿Qué cambia con Regulation G?**\n• Se permite el uso de Pokémon de la Pokédex Nacional, incluyendo legendarios restringidos\n• Nuevas reglas para equipos y objetos\n• Cambios en la lista de Pokémon permitidos y baneados\n• Ajustes en la dinámica de combates y estrategias\n\n**Fechas clave:**\n- Regulation G entra en vigor el 1 de julio de 2025\n- Será el formato oficial para los torneos y clasificatorios del Campeonato Mundial 2025\n\n¡Prepárate para una nueva temporada de batallas con más variedad y desafíos en el competitivo de Pokémon!`,
    imagen: 'https://scarletviolet.pokemon.com/_images/events/regulation-g/regulation_g_es-2x.jpg',
    fecha: '2025-06-13',
    categoria: 'eventos',
    link: 'https://scarletviolet.pokemon.com/es-es/events/regulation-g-2025/'
  }
];
