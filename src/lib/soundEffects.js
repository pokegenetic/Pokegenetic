// src/lib/soundEffects.js
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

// URLs para archivos pequeños (< 1MB) cargados localmente
const soundEffectUrls = {
    notification: 'https://play.pokemonshowdown.com/audio/notification.wav',
    error: 'https://play.pokemonshowdown.com/audio/errorwaiting.wav', // Sonido de error
    pop: 'https://play.pokemonshowdown.com/audio/notification.wav', // Sonido para navegación
    // Mantener algunas referencias locales como fallback
    pokeballopen: '/src/sounds/sfx/pokeballopen.mp3',
    pokeballthrow: '/src/sounds/sfx/pokeballthrow.mp3',
    pokeballwait: '/src/sounds/sfx/pokeballwait.mp3',
    pokeballcatch: '/src/sounds/sfx/pokeballcatch.mp3',
    pokeballexplode: '/src/sounds/sfx/pokeballexplode.mp3',
    catchmusic: '/src/sounds/sfx/catchmusic.mp3',
    heal: '/src/sounds/sfx/heal.mp3',
    superpower: '/src/sounds/sfx/superpower.mp3',
    pokeballreturn: '/src/sounds/sfx/pokeballreturn.mp3',
};

// URLs de Dropbox para todos los archivos de audio
// Las URLs se han convertido de formato compartido a formato de descarga directa
const dropboxAudioUrls = {
    // Archivos grandes
    casino: 'https://dl.dropboxusercontent.com/scl/fi/1qg0ov2ai2qduh04xfaps/casino.mp3',
    catchmusicgo: 'https://dl.dropboxusercontent.com/scl/fi/s52ziinog25ukzlyq99jj/catchmusicgo.mp3',
    gymbattle: 'https://dl.dropboxusercontent.com/scl/fi/qmr61ipkl3pqhxb88ojul/gymbattle.mp3',
    obtainbadge: 'https://dl.dropboxusercontent.com/scl/fi/7cq8v51e967tbe54jvrei/obtainbadge.mp3',
    pokechillmusic: 'https://dl.dropboxusercontent.com/scl/fi/rf5wcwn0dlq9qs6vvgjvu/pokechillmusic.mp3',
    pokemongym: 'https://dl.dropboxusercontent.com/scl/fi/qqo6mosag3s7rwukfnla9/pokemongym.mp3',
    trainerbattle: 'https://dl.dropboxusercontent.com/scl/fi/xy9ghyc0mcrpbn2aft4z7/trainerbattle.mp3',
    wingym: 'https://dl.dropboxusercontent.com/scl/fi/w5r8r2vsp0pt51g67gn3b/wingym.mp3',
    wintrainer: 'https://dl.dropboxusercontent.com/scl/fi/knul5jzv7ymcerkk1lc47/wintrainer.mp3',
    
    // Archivos pequeños
    catchedgo: 'https://dl.dropboxusercontent.com/scl/fi/jvj4dstzjq2sm2emhtwnq/catchedgo.mp3',
    catchmusic: 'https://dl.dropboxusercontent.com/scl/fi/p6hl0rgxw1grsenl8nqpx/catchmusic.mp3',
    heal: 'https://dl.dropboxusercontent.com/scl/fi/pq3m5zs407n8lilmtq0n9/heal.mp3',
    levelup: 'https://dl.dropboxusercontent.com/scl/fi/uxjc4orzs29ai9e21j51y/levelup.mp3',
    memorice: 'https://dl.dropboxusercontent.com/scl/fi/h6sb7j0l6oslanoc4kzdc/memorice.mp3',
    pc: 'https://dl.dropboxusercontent.com/scl/fi/1mckierjvgwjv7l8uslw0/pc.mp3',
    pokeballcatch: 'https://dl.dropboxusercontent.com/scl/fi/jtkdfelt160gted4lol9u/pokeballcatch.mp3',
    pokeballexplode: 'https://dl.dropboxusercontent.com/scl/fi/zfpe4xa9vbt8wiomtztae/pokeballexplode.mp3',
    pokeballopen: 'https://dl.dropboxusercontent.com/scl/fi/1rdwb0p8cv597eqy3jyte/pokeballopen.mp3',
    pokeballreturn: 'https://dl.dropboxusercontent.com/scl/fi/cdvy0a0nmblgqx8awvx7x/pokeballreturn.mp3',
    pokeballthrow: 'https://dl.dropboxusercontent.com/scl/fi/ojvypu5200ja4k43yzoav/pokeballthrow.mp3',
    pokeballwait: 'https://dl.dropboxusercontent.com/scl/fi/uwemzdkabhoducgn5d8qq/pokeballwait.mp3',
    slot: 'https://dl.dropboxusercontent.com/scl/fi/1hiydzn1i95v13b8b4tat/slot.wav',
    superpower: 'https://dl.dropboxusercontent.com/scl/fi/g4hu18hpkxfzg4ydmdq8y/superpower.wav',
    victory: 'https://dl.dropboxusercontent.com/scl/fi/u4x7s93ywi5l4p9bmloew/victory.mp3',
    whosthat: 'https://dl.dropboxusercontent.com/scl/fi/yva0y4ox4fuau1edxghhq/whosthat.mp3',
    win: 'https://dl.dropboxusercontent.com/scl/fi/00w8k2qcpz3mw4qqyl19q/win.mp3',
    winrewards: 'https://dl.dropboxusercontent.com/scl/fi/qo52d5srp77jpp33eggeh/winrewards.mp3',
};

// Cache para URLs ya resueltas
const urlCache = {};

/**
 * Reproduce un efecto de sonido
 * @param {string} key - Clave del sonido a reproducir
 * @param {number} volume - Volumen (0.0 a 1.0)
 * @returns {Promise<HTMLAudioElement|null>} - Elemento de audio o null si falló
 */
export async function playSoundEffect(key, volume = 1) {
    try {
        // Primero intentamos obtener de Dropbox
        let url = dropboxAudioUrls[key];
        
        // Si no está en Dropbox, buscamos en las URLs locales
        if (!url) {
            url = soundEffectUrls[key];
            if (!url) {
                console.warn(`No se encontró el sonido: ${key}`);
                return null;
            }
        }
        
        // Crear elemento de audio
        const audio = new window.Audio(url);
        audio.volume = volume;
        
        // Rastrear audios de victoria globalmente para poder detenerlos después
        if (key === 'wintrainer' || key === 'wingym') {
            window.currentVictoryAudio = audio;
        }
        
        // Intentar reproducir el audio
        try {
            await audio.play();
            return audio;
        } catch (error) {
            console.error(`Error reproduciendo audio ${key} desde URL ${url}:`, error);
            
            // Si el error es de CORS o formato no soportado y es una URL de Dropbox, 
            // intentar con la versión local como respaldo
            if (url.includes('dropbox') && (error.name === 'NotSupportedError' || error.name === 'AbortError')) {
                const fallbackUrl = soundEffectUrls[key];
                if (fallbackUrl) {
                    console.log(`Intentando reproducir ${key} desde URL local: ${fallbackUrl}`);
                    const fallbackAudio = new window.Audio(fallbackUrl);
                    fallbackAudio.volume = volume;
                    await fallbackAudio.play();
                    return fallbackAudio;
                }
            }
            
            return null;
        }
    } catch (error) {
        console.error(`Error general reproduciendo sonido ${key}:`, error);
        return null;
    }
}

/**
 * Obtiene la URL para un sonido (para precargar o usar directamente)
 * @param {string} key - Clave del sonido
 * @returns {string|null} - URL del sonido o null si no existe
 */
export function getSoundUrl(key) {
    return dropboxAudioUrls[key] || soundEffectUrls[key] || null;
}

/**
 * Precarga un conjunto de sonidos para reproducción instantánea
 * @param {string[]} keys - Claves de los sonidos a precargar
 * @returns {Promise<boolean>} - True si todos se precargaron con éxito
 */
export async function preloadSounds(keys) {
    try {
        const promises = keys.map(key => {
            const url = getSoundUrl(key);
            if (!url) return Promise.resolve();
            
            return new Promise((resolve) => {
                const audio = new Audio();
                audio.addEventListener('canplaythrough', () => {
                    console.log(`✅ Precargado: ${key}`);
                    resolve(true);
                }, { once: true });
                audio.addEventListener('error', (e) => {
                    console.warn(`❌ Error precargando: ${key}`, e);
                    resolve(false);
                }, { once: true });
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

/**
 * Inicializa el sistema de audio precargando sonidos comunes
 * @returns {Promise<boolean>}
 */
export async function initAudioSystem() {
    console.log('🎵 Inicializando sistema de audio...');
    
    // Lista de sonidos a precargar (los más utilizados)
    const soundsToPreload = [
        'notification', 
        'error', 
        'pokeballopen',
        'pokeballcatch',
        'pokechillmusic'
    ];
    
    try {
        // Precargar sonidos comunes
        const result = await preloadSounds(soundsToPreload);
        console.log(`🎵 Sistema de audio inicializado: ${result ? 'OK' : 'Con errores'}`);
        return result;
    } catch (error) {
        console.error('Error inicializando sistema de audio:', error);
        return false;
    }
}

// Función para actualizar URLs de Firebase Storage
export async function updateAudioUrlsFromFirebase() {
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

/**
 * Actualiza las URLs de audio usando Cloudinary
 * Esta función debe llamarse cuando la aplicación inicia
 * @returns {Promise<boolean>} - True si fue exitoso
 */
export function updateAudioUrlsFromCloudinary() {
    try {
        const audioKeys = Object.keys(externalAudioUrls);
        for (const key of audioKeys) {
            // Formato de URL de Cloudinary para archivos de audio
            const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${CLOUDINARY_FOLDER}/${key}.mp3`;
            
            // Guardar en caché y actualizar URL
            urlCache[key] = url;
            externalAudioUrls[key] = url;
        }
        console.log('URLs de Cloudinary actualizadas');
        return true;
    } catch (error) {
        console.error('Error actualizando URLs de Cloudinary:', error);
        return false;
    }
}
