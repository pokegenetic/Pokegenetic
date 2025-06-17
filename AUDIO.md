# Gestión de Audio en PokeGenetic

Este documento explica cómo se manejan los archivos de audio en la aplicación PokéGenetic.

## Estructura del Sistema de Audio

El sistema de audio está dividido en dos categorías:

1. **Archivos pequeños** (< 1MB): Se almacenan directamente en el repositorio en la carpeta `src/sounds/sfx/` y son referenciados en `soundEffectUrls`.
2. **Archivos grandes** (> 1MB): Se almacenan externamente en Dropbox y son referenciados en `dropboxAudioUrls`.

## Archivos de audio alojados externamente

Actualmente, los archivos de audio están alojados en Dropbox, lo que permite:
- Mantener el repositorio liviano
- Cargar rápidamente los archivos
- Evitar problemas de CORS
- Servicio confiable y gratuito

## Cómo usar el sistema de audio

Para reproducir un efecto de sonido:

```javascript
import { playSoundEffect } from '@/lib/soundEffects';

// Reproducir con volumen predeterminado (1.0)
playSoundEffect('notification');

// Reproducir con volumen personalizado (0.0 a 1.0)
playSoundEffect('pokechillmusic', 0.3);
```

Para precargar sonidos (recomendado para archivos grandes):

```javascript
import { preloadSounds } from '@/lib/soundEffects';

// Precargar varios sonidos
preloadSounds(['pokechillmusic', 'gymbattle', 'trainerbattle']);
```

## Cómo añadir nuevos archivos de audio

### Para archivos pequeños (< 1MB):

1. Guarda el archivo en `src/sounds/sfx/` 
2. Agrega una entrada en `soundEffectUrls` en `src/lib/soundEffects.js`:

```javascript
const soundEffectUrls = {
  // ...existentes
  miEfecto: '/src/sounds/sfx/miEfecto.mp3',
};
```

### Para archivos grandes usando Dropbox:

1. Sube el archivo a Dropbox
2. Comparte el archivo y obtén el enlace de compartir
3. Modifica el enlace para que funcione como enlace directo:
   - Reemplaza `https://www.dropbox.com/scl/fi/XXXXX/archivo.mp3?...` 
   - Por `https://dl.dropboxusercontent.com/scl/fi/XXXXX/archivo.mp3`
4. Añade la entrada en `dropboxAudioUrls`:

```javascript
const dropboxAudioUrls = {
  // ...existentes
  miMusica: 'https://dl.dropboxusercontent.com/scl/fi/XXXXX/miMusica.mp3',
};
```

5. Inicializa el sistema de audio en el componente principal de tu aplicación:

```javascript
import { initAudioSystem } from '@/lib/soundEffects';

// En el useEffect inicial
useEffect(() => {
  initAudioSystem();
}, []);
```

## Solución de problemas

Si tienes problemas con la reproducción de audio:

1. **Problema de autoplay**: Muchos navegadores bloquean la reproducción automática de audio. Asegúrate de reproducir el audio como respuesta a una acción del usuario (hacer clic en un botón).

2. **CORS**: Si ves errores CORS en la consola, verifica que la URL de Dropbox esté en el formato correcto (empezando con `https://dl.dropboxusercontent.com/`).

3. **Formatos de archivo**: Asegúrate de que tus archivos estén en formato MP3 o WAV, que son compatibles con todos los navegadores modernos.

4. **Respaldo local**: El sistema intentará usar la versión local del archivo si la versión de Dropbox falla, lo que proporciona una capa adicional de confiabilidad.
