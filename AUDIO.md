# Pokegenetic - Sistema de Audio

## Descripción

Pokegenetic usa una combinación de archivos de audio locales (para archivos pequeños) y URLs externas (para archivos grandes) para reducir el tamaño del repositorio y mejorar el rendimiento.

## Cómo funciona

El sistema de audio está implementado en `src/lib/soundEffects.js` y proporciona las siguientes funciones:

- `playSoundEffect(key, volume, loop)`: Reproduce un efecto de sonido identificado por su clave
- `getAudioUrl(key)`: Obtiene la URL de un archivo de audio
- `createAudio(key, options)`: Crea un elemento de audio que puede ser controlado manualmente
- `preloadAudios(keys)`: Precarga un conjunto de archivos de audio para mejorar el rendimiento

## Archivos de audio

Los archivos de audio se dividen en dos categorías:

1. **Archivos pequeños** (< 1MB): Se almacenan localmente en la carpeta `/sounds/` y se referencian en `soundEffectUrls`
2. **Archivos grandes** (> 1MB): Se almacenan externamente en Google Drive y se referencian en `externalAudioUrls`

## Archivos de audio grandes alojados en Google Drive

Actualmente, los siguientes archivos grandes están alojados en Google Drive:

1. pokechillmusic.mp3 - Música de fondo principal
2. memorice.mp3 - Para el minijuego de memoria
3. winrewards.mp3 - Sonidos de recompensas
4. pokemongym.mp3 - Música de gimnasio Pokémon
5. wintrainer.mp3 - Música de victoria contra entrenador
6. gymbattle.mp3 - Música de batalla contra líder de gimnasio
7. trainerbattle.mp3 - Música de batalla contra entrenador
8. wingym.mp3 - Música de victoria en gimnasio
9. obtainbadge.mp3 - Sonido de obtener medalla
10. casino.mp3 - Música de fondo para tragamonedas

## Cómo agregar nuevos archivos de audio

### Para archivos pequeños:

1. Coloca el archivo en la carpeta `/sounds/` o `/sounds/sfx/`
2. Agrega una entrada en `soundEffectUrls` con la ruta relativa al archivo

```javascript
// En src/lib/soundEffects.js
const soundEffectUrls = {
  // ...
  miSonido: '/sounds/sfx/mi-sonido.mp3',
  // ...
};
```

### Para archivos grandes en Google Drive:

1. Sube el archivo a Google Drive
2. Comparte el archivo para que sea accesible públicamente (cualquier persona con el enlace puede ver)
3. Obtén el ID del archivo de la URL de compartir (la parte después de `/d/` y antes de `/view`)
4. Agrega una entrada en `externalAudioUrls` con el formato adecuado:

```javascript
// En src/lib/soundEffects.js
const externalAudioUrls = {
  // ...
  miMusica: 'https://drive.google.com/uc?export=download&id=TU_ID_DE_ARCHIVO_AQUÍ',
  // ...
};
```

## Cómo usar los sonidos en el código

```javascript
import { playSoundEffect, getAudioUrl, createAudio, preloadAudios } from '@/lib/soundEffects';

// Precargar audios importantes al inicio
useEffect(() => {
  // Precargar los archivos de audio más importantes
  preloadAudios(['pokechillmusic', 'notification']);
}, []);

// Reproducir un sonido simple
playSoundEffect('notification', 0.5); // key, volumen (0-1)

// Reproducir un sonido en bucle
playSoundEffect('pokechillmusic', 0.3, true); // key, volumen, loop

// Obtener la URL de un sonido
const url = getAudioUrl('miSonido');

// Crear un elemento de audio controlable
const audio = createAudio('miMusica', { 
  volume: 0.4,
  loop: true,
  autoplay: false
});

// Controlar el audio manualmente
audio.play();
audio.pause();
```

## Solución de problemas

Si tienes problemas con la reproducción de audio desde Google Drive:

1. Asegúrate de que el archivo sea accesible públicamente
2. Verifica que el ID del archivo en la URL sea correcto
3. En caso de problemas CORS, considera mover los archivos a un servicio como Firebase Storage, AWS S3 o similar
