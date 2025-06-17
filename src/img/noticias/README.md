# Imágenes de Noticias

Este directorio está configurado para almacenar imágenes de noticias locales, pero actualmente el sistema utiliza **URLs externas** para las imágenes de noticias.

## URLs Actuales en Uso

Las noticias actuales utilizan imágenes oficiales de Pokémon desde:

1. **TCG Pocket**: `https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/_tiles/tcg-pokemon-tcg-pocket-169.jpg`
2. **Pokémon HOME**: `https://assets.pokemon.com/assets/cms2/img/misc/gp/home/pokemon-home-artwork.jpg`
3. **Pokémon GO**: `https://assets.pokemon.com/assets/cms2/img/misc/virtual-backgrounds/pokemon-go.png`
4. **Worlds**: `https://assets.pokemon.com/assets/cms2/img/misc/worlds/2024/worlds-logo-2024.png`
5. **Pokémon Sleep**: `https://www.pokemon.com/static-assets/content-assets/cms2/img/video-games/video-games/pokemon_sleep/pokemon-sleep-hero-mobile.jpg`

## Ventajas de URLs Externas

- ✅ Imágenes oficiales de alta calidad
- ✅ Siempre actualizadas desde la fuente
- ✅ No consumen espacio del proyecto
- ✅ Carga optimizada desde CDNs de Pokémon

## Uso de Imágenes Locales (Opcional)

Si prefieres usar imágenes locales:

1. Descarga las imágenes oficiales
2. Guárdalas en este directorio con nombres descriptivos
3. Actualiza las URLs en `/src/data/noticias.ts`

### Formato recomendado:
```
/src/img/noticias/
├── tcg-pocket-genetic-apex.jpg
├── pokemon-home-switch2.jpg
├── pokemon-go-new-year.jpg
├── worlds-2025.jpg
└── pokemon-sleep-winter.jpg
```

## Fallback

El componente `NoticiasCarousel` incluye un sistema de fallback que muestra un placeholder si una imagen externa falla al cargar.
