// src/lib/soundEffects.js
// Sistema de gestión de audio optimizado para móviles

// Variables globales para gestión de audio
let audioInitialized = false;
let pendingAudios = [];
let firstInteractionDone = false;

// URLs de sonidos externos (CDN o almacenamiento)
const externalAudioUrls = {
  // Archivos de audio grandes con URLs de Google Drive
  pokechillmusic: 'https://drive.google.com/uc?export=download&id=1aOrgCcsHiFmOVRDYw6tccofd6zhk2gwB',
  memorice: 'https://drive.google.com/uc?export=download&id=1gblwRk0CVTrvz6ohr1EhCqXAfeRKCFEO',
  winrewards: 'https://drive.google.com/uc?export=download&id=1LcOm1fMFPtP-soBT4XfIkVLP7djPdYM3',
  pokemongym: 'https://www.dropbox.com/scl/fi/qqo6mosag3s7rwukfnla9/pokemongym.mp3?rlkey=rp0zp5oaddnh0np06qtez9gbx&st=pmao4i07&dl=1',
  wintrainer: 'https://www.dropbox.com/scl/fi/knul5jzv7ymcerkk1lc47/wintrainer.mp3?rlkey=z7qlv2415yke4ox1y546fod76&st=4zul5uwe&dl=1',
  gymbattle: 'https://www.dropbox.com/scl/fi/qmr61ipkl3pqhxb88ojul/gymbattle.mp3?rlkey=z64xxr230pdwyc6hw04g0g476&st=su3gd1e5&dl=1',
  trainerbattle: 'https://www.dropbox.com/scl/fi/xy9ghyc0mcrpbn2aft4z7/trainerbattle.mp3?rlkey=pfqy1b99mzvl3rk7oespt8hp6&st=dzde7u7s&dl=1',
  wingym: 'https://www.dropbox.com/scl/fi/w5r8r2vsp0pt51g67gn3b/wingym.mp3?rlkey=kd5ffs8rvplqg7i4anq2y8wmd&st=v5uzpegp&dl=1',
  obtainbadge: 'https://www.dropbox.com/scl/fi/7cq8v51e967tbe54jvrei/obtainbadge.mp3?rlkey=grkimuyje3f5omglu4uzveto3&st=to1x4gtx&dl=1',
  casino: 'https://drive.google.com/uc?export=download&id=1f332jqpnji2h28El80PgEkVD-rfGcuVa',
  catchmusicgo: '/sounds/catchmusicgo.mp3',
};

// Rutas de efectos de sonido
const soundEffectUrls = {
    notification: 'https://play.pokemonshowdown.com/audio/notification.wav',
    error: 'https://play.pokemonshowdown.com/audio/errorwaiting.wav',
    
    // Sonidos de Pokéball desde Dropbox
    pc: 'https://www.dropbox.com/scl/fi/1mckierjvgwjv7l8uslw0/pc.mp3?rlkey=acjk8hri7yakxop1izlcknh6r&st=a6lhfx48&dl=1',
    pokeballcatch: 'https://www.dropbox.com/scl/fi/jtkdfelt160gted4lol9u/pokeballcatch.mp3?rlkey=3704j7ajyy39qjtegmwwyxev6&st=xp7hn9hz&dl=1',
    pokeballthrow: 'https://www.dropbox.com/scl/fi/ojvypu5200ja4k43yzoav/pokeballthrow.mp3?rlkey=b5cjw8fr2bl40quauu07170na&st=4zapubcb&dl=1',
    pokeballexplode: 'https://www.dropbox.com/scl/fi/zfpe4xa9vbt8wiomtztae/pokeballexplode.mp3?rlkey=81f51bbdainiwd5kkiswhml8s&st=mygdk7cj&dl=1',
    pokeballwait: 'https://www.dropbox.com/scl/fi/uwemzdkabhoducgn5d8qq/pokeballwait.mp3?rlkey=bspli4ihepe8n9rnfk9k9xxhm&st=oun68cpr&dl=1',
    pokeballreturn: 'https://www.dropbox.com/scl/fi/cdvy0a0nmblgqx8awvx7x/pokeballreturn.mp3?rlkey=fw4rxk3bwd2o5afu0m25cuzyo&st=dg3s2izc&dl=1',
    catchmusic: 'https://www.dropbox.com/scl/fi/p6hl0rgxw1grsenl8nqpx/catchmusic.mp3?rlkey=6cqu58vjpkx5k7ddjsn3749pq&st=h0v0uwid&dl=1',
    superpower: 'https://www.dropbox.com/scl/fi/647lmyvmwld8k6yqet96x/superpower.mp3?rlkey=kl2m8dhzva57fh1qs9ly7tvek&st=z65llvre&dl=1',
    heal: 'https://www.dropbox.com/scl/fi/pq3m5zs407n8lilmtq0n9/heal.mp3?rlkey=tj9u24fb0pgywcdz0phzh7b4g&st=74513ari&dl=1',
    
    // Pop se usa notification para navegación
    pop: 'https://play.pokemonshowdown.com/audio/notification.wav',
    
    // Sonidos adicionales locales
    pokeballopen: '/sounds/sfx/pokeballopen.mp3',
    levelup: '/sounds/sfx/levelup.mp3',
    shiny: '/sounds/sfx/shiny.mp3',
    slot: '/sounds/sfx/slot.wav',
    nothing: '/sounds/sfx/nothing.mp3',
    win: '/sounds/sfx/win.mp3',
    victory: '/sounds/sfx/victory.mp3',
    whosthat: '/sounds/sfx/whosthat.mp3',
    misterygift: '/sounds/sfx/misterygift.mp3',
    pokeballthrowmasterball: '/sounds/sfx/pokeballthrowmasterball.mp3',
    pokeballwaiting: '/sounds/sfx/pokeballwaiting.mp3',
    catchedgo: '/sounds/sfx/catchedgo.mp3'
};

/**
 * Detecta si estamos en un dispositivo móvil
 */
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0);
}

/**
 * Verifica si el audio está inicializado
 */
export function isAudioInitialized() {
    return audioInitialized;
}

/**
 * Inicializa el contexto de audio para dispositivos móviles
 * Debe ser llamado después de una interacción del usuario
 */
export function initializeAudioForMobile() {
    if (audioInitialized || firstInteractionDone) return Promise.resolve(true);
    
    return new Promise((resolve) => {
        try {
            console.log('🎵 Inicializando sistema de audio para móvil...');
            
            // Crear un audio de prueba silencioso para inicializar el contexto
            const testAudio = new Audio();
            testAudio.volume = 0.01; // Volumen muy bajo pero no 0
            testAudio.preload = 'auto';
            
            // Usar una URL de audio muy pequeña y simple
            testAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuO1/LFdSUCMIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuO1/LFdSUC';
            
            const playPromise = testAudio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    audioInitialized = true;
                    firstInteractionDone = true;
                    console.log('✅ Audio inicializado correctamente para móvil');
                    
                    // Reproducir audios pendientes
                    pendingAudios.forEach(({ key, volume, loop }) => {
                        playSoundEffect(key, volume, loop);
                    });
                    pendingAudios = [];
                    
                    resolve(true);
                }).catch(error => {
                    console.warn('❌ Error en playPromise:', error);
                    // Marcar como inicializado de todas formas para no bloquear
                    audioInitialized = true;
                    firstInteractionDone = true;
                    resolve(false);
                });
            } else {
                // Navegador muy antiguo, marcar como inicializado
                audioInitialized = true;
                firstInteractionDone = true;
                resolve(true);
            }
        } catch (error) {
            console.warn('❌ Error inicializando audio:', error);
            // Marcar como inicializado para no bloquear la app
            audioInitialized = true;
            firstInteractionDone = true;
            resolve(false);
        }
    });
}

/**
 * Reproduce un efecto de sonido - OPTIMIZADO PARA MÓVILES
 */
export function playSoundEffect(key, volume = 1, loop = false) {
    // En móviles, si el audio no está inicializado, agregar a la cola
    if (isMobileDevice() && !audioInitialized) {
        console.log(`📱 Audio no inicializado, agregando ${key} a la cola`);
        pendingAudios.push({ key, volume, loop });
        return null;
    }
    
    // Buscar URL del sonido
    let url = externalAudioUrls[key] || soundEffectUrls[key];
    
    if (!url) {
        console.warn(`No se encontró el sonido: ${key}`);
        return null;
    }
    
    try {
        const audio = new Audio(url);
        audio.volume = volume;
        audio.loop = loop;
        
        // Configurar CORS para URLs externas
        if (url.includes('dropbox.com') || url.includes('pokemonshowdown.com')) {
            audio.crossOrigin = 'anonymous';
        }
        
        // Rastrear audios de victoria globalmente
        if (key === 'wintrainer' || key === 'wingym') {
            window.currentVictoryAudio = audio;
        }
        
        // Manejo de errores mejorado
        audio.onerror = (e) => {
            console.error(`Error cargando audio ${key} desde ${url}:`, e);
        };
        
        // Reproducir con manejo de errores
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error(`Error reproduciendo sonido ${key}:`, error.name, error.message);
                
                // Intentar fallback sin CORS
                if (error.name === 'NotSupportedError' || error.name === 'AbortError') {
                    console.log(`Intentando fallback para ${key}...`);
                    try {
                        const fallbackAudio = new Audio(url);
                        fallbackAudio.volume = volume;
                        fallbackAudio.loop = loop;
                        fallbackAudio.play().catch(fallbackError => {
                            console.error(`Error en fallback para ${key}:`, fallbackError);
                        });
                    } catch (fallbackError) {
                        console.error(`Error creando fallback para ${key}:`, fallbackError);
                    }
                }
            });
        }
        
        return audio;
    } catch (error) {
        console.error(`Error creando elemento de audio para ${key}:`, error);
        return null;
    }
}

/**
 * Función especializada para música de fondo con loop
 */
export function playLoopingMusic(key, volume = 0.1) {
    // En móviles, inicializar primero si es necesario
    if (isMobileDevice() && !audioInitialized) {
        console.log(`📱 Música ${key} pendiente hasta inicialización`);
        return null;
    }
    
    let url = externalAudioUrls[key] || soundEffectUrls[key];
    
    if (!url) {
        console.warn(`No se encontró la música: ${key}`);
        return null;
    }
    
    try {
        const audio = new Audio(url);
        audio.volume = volume;
        audio.loop = true;
        
        // Configurar CORS para URLs externas
        if (url.includes('dropbox.com') || url.includes('pokemonshowdown.com')) {
            audio.crossOrigin = 'anonymous';
        }
        
        audio.onerror = (e) => {
            console.error(`Error cargando música ${key} desde ${url}:`, e);
        };
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error(`Error reproduciendo música ${key}:`, error);
            });
        }
        
        return audio;
    } catch (error) {
        console.error(`Error creando elemento de música para ${key}:`, error);
        return null;
    }
}

/**
 * Obtiene la URL de un archivo de audio
 */
export function getAudioUrl(key) {
    return externalAudioUrls[key] || soundEffectUrls[key] || null;
}

/**
 * Crea un elemento de audio que puede ser controlado manualmente
 */
export function createAudio(key, options = {}) {
    const { volume = 1, loop = false, autoplay = false } = options;
    const url = getAudioUrl(key);
    
    if (!url) {
        console.warn(`No se encontró el sonido: ${key}`);
        return null;
    }
    
    try {
        const audio = new Audio(url);
        audio.volume = volume;
        audio.loop = loop;
        
        // Configurar CORS para URLs externas
        if (url.includes('dropbox.com') || url.includes('pokemonshowdown.com')) {
            audio.crossOrigin = 'anonymous';
        }
        
        audio.onerror = (e) => {
            console.error(`Error cargando audio ${key} desde ${url}:`, e);
        };
        
        audio.oncanplaythrough = () => {
            console.log(`Audio ${key} cargado correctamente`);
        };
        
        if (autoplay) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error(`Error reproduciendo sonido ${key}:`, error);
                });
            }
        }
        
        return audio;
    } catch (error) {
        console.error(`Error creando elemento de audio para ${key}:`, error);
        return null;
    }
}

/**
 * Precarga un conjunto de archivos de audio
 */
export function preloadAudios(keys) {
    const audioPromises = keys.map(key => {
        return new Promise((resolve) => {
            const url = getAudioUrl(key);
            if (!url) {
                console.warn(`No se encontró el sonido: ${key} para precargar`);
                resolve();
                return;
            }
            
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                console.log(`Audio ${key} precargado correctamente`);
                resolve();
            };
            
            audio.onerror = (e) => {
                console.warn(`Error precargando audio ${key}:`, e);
                resolve();
            };
            
            audio.src = url;
            audio.load();
        });
    });
    
    return Promise.all(audioPromises);
}
