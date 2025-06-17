// src/lib/soundEffects.ts
// URLs de sonidos externos (CDN o almacenamiento)
const externalAudioUrls = {
  // Archivos de audio grandes con URLs de Google Drive
  // 1. pokechillmusic (música de fondo principal)
  pokechillmusic: 'https://drive.google.com/uc?export=download&id=1aOrgCcsHiFmOVRDYw6tccofd6zhk2gwB',
  
  // 2. memorice (para el minijuego de memoria)
  memorice: 'https://drive.google.com/uc?export=download&id=1gblwRk0CVTrvz6ohr1EhCqXAfeRKCFEO',
  
  // 3. winrewards (sonidos de recompensas)
  winrewards: 'https://drive.google.com/uc?export=download&id=1LcOm1fMFPtP-soBT4XfIkVLP7djPdYM3',
  
  // 4. pokemongym (música de gimnasio Pokémon)
  pokemongym: 'https://www.dropbox.com/scl/fi/qqo6mosag3s7rwukfnla9/pokemongym.mp3?rlkey=rp0zp5oaddnh0np06qtez9gbx&st=pmao4i07&dl=1',
  
  // 5. wintrainer (música de victoria contra entrenador)
  wintrainer: 'https://drive.google.com/uc?export=download&id=1XzlnYJetMXLoQwgcYY3SyS7YQ0ss4yqv',
  
  // 6. gymbattle (música de batalla contra líder de gimnasio)
  gymbattle: 'https://www.dropbox.com/scl/fi/qmr61ipkl3pqhxb88ojul/gymbattle.mp3?rlkey=z64xxr230pdwyc6hw04g0g476&st=su3gd1e5&dl=1',
  
  // 7. trainerbattle (música de batalla contra entrenador)
  trainerbattle: 'https://www.dropbox.com/scl/fi/xy9ghyc0mcrpbn2aft4z7/trainerbattle.mp3?rlkey=pfqy1b99mzvl3rk7oespt8hp6&st=dzde7u7s&dl=1',
  
  // 8. wingym (música de victoria en gimnasio)
  wingym: 'https://drive.google.com/uc?export=download&id=1QM0IQK3PypTuj7MQAgZbWQZ_t0R5gxF5',
  
  // 9. obtainbadge (sonido de obtener medalla)
  obtainbadge: 'https://drive.google.com/uc?export=download&id=19UsRhg6A_qnGzwSDOnNH1vXWoAJmBpOV',
  
  // 10. casino (música de fondo para tragamonedas)
  casino: 'https://drive.google.com/uc?export=download&id=1f332jqpnji2h28El80PgEkVD-rfGcuVa',
  
  // Otros audios que puedas necesitar
  catchmusicgo: '/sounds/catchmusicgo.mp3',
};

// Rutas originales de efectos de sonido (mantener compatibilidad)
const soundEffectUrls = {
    notification: 'https://play.pokemonshowdown.com/audio/notification.wav',
    error: 'https://play.pokemonshowdown.com/audio/errorwaiting.wav', // Sonido de error
    pokeballopen: '/sounds/sfx/pokeballopen.mp3', // Direct path as requested
    pokeballthrow: '/sounds/sfx/pokeballthrow.mp3',
    pokeballwait: '/sounds/sfx/pokeballwait.mp3',
    pokeballcatch: '/sounds/sfx/pokeballcatch.mp3', // Sonido de captura exitosa
    pokeballexplode: '/sounds/sfx/pokeballexplode.mp3', // Sonido de explosión cuando la captura falla
    catchmusic: '/sounds/sfx/catchmusic.mp3', // Sonido de música de captura exitosa
    heal: '/sounds/sfx/heal.mp3', // Sonido de curación para laboratorio
    superpower: '/sounds/sfx/superpower.wav', // Sonido de Ataque Cargado
    levelup: '/sounds/sfx/levelup.mp3', // Sonido de subida de nivel
    shiny: '/sounds/sfx/shiny.mp3', // Sonido de Pokémon shiny
    pc: '/sounds/sfx/pc.mp3', // Sonido de PC
    slot: '/sounds/sfx/slot.wav', // Sonido para tragamonedas
    nothing: '/sounds/sfx/nothing.mp3', // Sonido para tragamonedas - nada
    win: '/sounds/sfx/win.mp3', // Sonido para tragamonedas - victoria
    victory: '/sounds/sfx/victory.mp3', // Sonido para tragamonedas - victoria grande
    whosthat: '/sounds/sfx/whosthat.mp3', // Sonido para juego "Who's that Pokemon"
    pop: 'https://play.pokemonshowdown.com/audio/notification.wav', // Sonido para navegación
    // Otros efectos de sonido pequeños
    misterygift: '/sounds/sfx/misterygift.mp3',
    pokeballthrowmasterball: '/sounds/sfx/pokeballthrowmasterball.mp3',
    pokeballwaiting: '/sounds/sfx/pokeballwaiting.mp3',
    pokeballreturn: '/sounds/sfx/pokeballreturn.mp3',
    catchedgo: '/sounds/sfx/catchedgo.mp3'
};
/**
 * Reproduce un efecto de sonido desde una URL local o externa
 * @param {string} key - La clave del sonido a reproducir
 * @param {number} volume - Volumen del sonido (0-1)
 * @param {boolean} loop - Si el sonido debe reproducirse en bucle
 * @returns {HTMLAudioElement|null} - El elemento de audio o null si no se pudo reproducir
 */
export function playSoundEffect(key, volume = 1, loop = false) {
    // Primero intentar con URLs externas
    let url = externalAudioUrls[key];
    
    // Si no existe en URLs externas, intentar con rutas locales
    if (!url) {
        url = soundEffectUrls[key];
    }
    
    if (!url) {
        console.warn(`No se encontró el sonido: ${key}`);
        return null;
    }
    
    try {
        const audio = new window.Audio(url);
        audio.volume = volume;
        audio.loop = loop;
        
        // Removido crossOrigin para evitar problemas CORS con Dropbox/URLs externas
        
        // Rastrear audios de victoria globalmente para poder detenerlos después
        if (key === 'wintrainer' || key === 'wingym') {
            window.currentVictoryAudio = audio;
        }
        
        // Agregar un manejador de errores más detallado
        audio.onerror = (e) => {
            console.warn(`Error cargando audio ${key} desde ${url}:`, e);
        };
        
        // Reproducir el audio con manejo de errores
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn(`Error reproduciendo sonido ${key}:`, error);
                
                // Si hay un error con el formato de URL de Google Drive, intentar con URL alternativa
                if (url.includes('drive.google.com') && error.name === 'NotSupportedError') {
                    console.log(`Intentando URL alternativa para ${key}`);
                    // Implementar lógica de URL alternativa si es necesario
                }
            });
        }
        
        return audio;
    } catch (error) {
        console.warn(`Error creando elemento de audio para ${key}:`, error);
        return null;
    }
}

/**
 * Función especializada para música de fondo con loop
 * @param {string} key - La clave del sonido a reproducir
 * @param {number} volume - Volumen del sonido (0-1)
 * @returns {HTMLAudioElement|null} - El elemento de audio o null si no se pudo reproducir
 */
export function playLoopingMusic(key, volume = 0.1) {
    // Primero intentar con URLs externas
    let url = externalAudioUrls[key];
    
    // Si no existe en URLs externas, intentar con rutas locales
    if (!url) {
        url = soundEffectUrls[key];
    }
    
    if (!url) {
        console.warn(`No se encontró el sonido: ${key}`);
        return null;
    }
    
    try {
        const audio = new window.Audio(url);
        audio.volume = volume;
        audio.loop = true;
        // Removido crossOrigin para evitar problemas CORS con Dropbox
        
        // Agregar manejador de errores
        audio.onerror = (e) => {
            console.warn(`Error cargando música ${key} desde ${url}:`, e);
        };
        
        // Reproducir con manejo de errores
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn(`Error reproduciendo música ${key}:`, error);
            });
        }
        
        return audio;
    } catch (error) {
        console.warn(`Error creando elemento de audio para música ${key}:`, error);
        return null;
    }
}

/**
 * Obtiene la URL de un archivo de audio (local o externo)
 * @param {string} key - La clave del sonido
 * @returns {string|null} - La URL del sonido o null si no existe
 */
export function getAudioUrl(key) {
    return externalAudioUrls[key] || soundEffectUrls[key] || null;
}

/**
 * Crea un elemento de audio que puede ser controlado manualmente
 * @param {string} key - La clave del sonido
 * @param {object} options - Opciones de configuración
 * @returns {HTMLAudioElement|null} - El elemento de audio o null si no se pudo crear
 */
export function createAudio(key, options = {}) {
    const { volume = 1, loop = false, autoplay = false } = options;
    const url = getAudioUrl(key);
    
    if (!url) {
        console.warn(`No se encontró el sonido: ${key}`);
        return null;
    }
    
    try {
        const audio = new window.Audio(url);
        audio.volume = volume;
        audio.loop = loop;
        // Removido crossOrigin para evitar problemas CORS con Dropbox/URLs externas
        
        // Agregar manejadores de eventos para depuración
        audio.onerror = (e) => {
            console.warn(`Error cargando audio ${key} desde ${url}:`, e);
        };
        
        audio.oncanplaythrough = () => {
            console.log(`Audio ${key} cargado correctamente y listo para reproducirse`);
        };
        
        if (autoplay) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error reproduciendo sonido ${key}:`, error);
                    
                    // Si hay un error con la URL de Google Drive, podríamos intentar una alternativa
                    if (url.includes('drive.google.com') && error.name === 'NotSupportedError') {
                        console.log(`Intentando URL alternativa para ${key}`);
                        // Implementar lógica de fallback si es necesario
                    }
                });
            }
        }
        
        return audio;
    } catch (error) {
        console.warn(`Error creando elemento de audio para ${key}:`, error);
        return null;
    }
}

/**
 * Precarga un conjunto de archivos de audio para mejorar el rendimiento
 * @param {string[]} keys - Las claves de los sonidos a precargar
 * @returns {Promise<void>} - Una promesa que se resuelve cuando todos los audios están precargados
 */
export function preloadAudios(keys) {
    const audioPromises = keys.map(key => {
        return new Promise((resolve, reject) => {
            const url = getAudioUrl(key);
            if (!url) {
                console.warn(`No se encontró el sonido: ${key} para precargar`);
                resolve(); // Resolvemos de todas formas para no bloquear los demás
                return;
            }
            
            const audio = new window.Audio();
            
            audio.oncanplaythrough = () => {
                console.log(`Audio ${key} precargado correctamente`);
                resolve();
            };
            
            audio.onerror = (e) => {
                console.warn(`Error precargando audio ${key} desde ${url}:`, e);
                resolve(); // Resolvemos de todas formas para no bloquear los demás
            };
            
            audio.src = url;
            audio.load(); // Iniciamos la carga explícitamente
        });
    });
    
    return Promise.all(audioPromises);
}
