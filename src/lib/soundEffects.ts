// src/lib/soundEffects.ts
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

// URLs para archivos pequeños (< 1MB) cargados localmente
const soundEffectUrls: Record<string, string> = {
  notification: 'https://play.pokemonshowdown.com/audio/notification.wav',
  error: 'https://play.pokemonshowdown.com/audio/errorwaiting.wav', // Sonido de error
  pokeballopen: '/src/sounds/sfx/pokeballopen.mp3', // Direct path as requested
  pokeballthrow: '/src/sounds/sfx/pokeballthrow.mp3',
  pokeballwait: '/src/sounds/sfx/pokeballwait.mp3',
  pokeballcatch: '/src/sounds/sfx/pokeballcatch.mp3', // Sonido de captura exitosa
  pokeballexplode: '/src/sounds/sfx/pokeballexplode.mp3', // Sonido de explosión cuando la captura falla
  catchmusic: '/src/sounds/sfx/catchmusic.mp3', // Sonido de música de captura exitosa
  heal: '/src/sounds/sfx/heal.mp3', // Sonido de curación para laboratorio
  superpower: '/src/sounds/sfx/superpower.mp3', // Sonido de Ataque Cargado
  pokeballreturn: '/src/sounds/sfx/pokeballreturn.mp3', // Sonido cuando un Pokémon es derrotado
  pop: 'https://play.pokemonshowdown.com/audio/notification.wav', // Sonido para navegación
  // Archivos pequeños que están en el proyecto
};

// URLs para archivos grandes (> 1MB) que no están en el repo
// Por ahora usamos rutas locales, pero estas serán reemplazadas con URLs de Firebase Storage
const externalAudioUrls: Record<string, string> = {
  pokemongym: '/src/sounds/pokemongym.mp3', // Música de gimnasio Pokémon
  wintrainer: '/src/sounds/wintrainer.mp3', // Música de victoria contra entrenador
  gymbattle: '/src/sounds/gymbattle.mp3', // Música de batalla contra líder de gimnasio
  trainerbattle: '/src/sounds/trainerbattle.mp3', // Música de batalla contra entrenador
  wingym: '/src/sounds/wingym.mp3', // Música de victoria en gimnasio
  obtainbadge: '/src/sounds/obtainbadge.mp3', // Sonido de obtener medalla
  casino: '/src/sounds/casino.mp3', // Música de fondo para tragamonedas
  pokechillmusic: '/src/sounds/pokechillmusic.mp3', // Música de fondo principal
};

// Cache para URLs de Firebase Storage ya resueltas
const urlCache: Record<string, string> = {};

/**
 * Reproduce un efecto de sonido
 * @param key - Clave del sonido a reproducir
 * @param volume - Volumen (0.0 a 1.0)
 * @returns - Elemento de audio o null si falló
 */
export async function playSoundEffect(key: string, volume: number = 1): Promise<HTMLAudioElement | null> {
  try {
    // Primero intentamos obtener de URLs externas, luego de URLs locales
    let url = externalAudioUrls[key];
    const isExternal = !!url;
    
    // Si no está en external, buscamos en local
    if (!url) {
      url = soundEffectUrls[key];
      if (!url) return null;
    }
    
    // Crear elemento de audio
    const audio = new window.Audio(url);
    audio.volume = volume;
    
    // Rastrear audios de victoria globalmente para poder detenerlos después
    if (key === 'wintrainer' || key === 'wingym') {
      (window as any).currentVictoryAudio = audio;
    }
    
    await audio.play();
    return audio;
  } catch (error) {
    console.error(`Error reproduciendo sonido ${key}:`, error);
    return null;
  }
}

/**
 * Obtiene la URL para un sonido (para precargar o usar directamente)
 * @param key - Clave del sonido
 * @returns - URL del sonido o null si no existe
 */
export function getSoundUrl(key: string): string | null {
  return externalAudioUrls[key] || soundEffectUrls[key] || null;
}

/**
 * Precarga un conjunto de sonidos para reproducción instantánea
 * @param keys - Claves de los sonidos a precargar
 * @returns - True si todos se precargaron con éxito
 */
export async function preloadSounds(keys: string[]): Promise<boolean> {
  try {
    const promises = keys.map(key => {
      const url = getSoundUrl(key);
      if (!url) return Promise.resolve();
      
      return new Promise<boolean>((resolve) => {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', () => resolve(true), { once: true });
        audio.addEventListener('error', () => resolve(false), { once: true });
        audio.src = url;
        audio.load();
      });
    });
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error al precargar sonidos:', error);
    return false;
  }
}

// Función para actualizar URLs de Firebase Storage
export async function updateAudioUrlsFromFirebase(): Promise<boolean> {
  try {
    const audioKeys = Object.keys(externalAudioUrls);
    for (const key of audioKeys) {
      try {
        // Verificar si ya tenemos esta URL en caché
        if (urlCache[key]) {
          externalAudioUrls[key] = urlCache[key];
          continue;
        }
        
        // Obtener URL de Firebase Storage
        const storageRef = ref(storage, `audios/${key}.mp3`);
        const url = await getDownloadURL(storageRef);
        
        // Guardar en caché y actualizar URL
        urlCache[key] = url;
        externalAudioUrls[key] = url;
        console.log(`Audio URL actualizada para ${key}`);
      } catch (err) {
        console.warn(`No se pudo cargar ${key} desde Firebase, usando URL local`, err);
        // Mantener la URL local si falla
      }
    }
    return true;
  } catch (error) {
    console.error('Error actualizando URLs de audio:', error);
    return false;
  }
}
