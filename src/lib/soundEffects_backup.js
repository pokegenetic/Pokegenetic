// src/lib/soundEffects.ts
// Sistema de gestión de audio para móviles
let audioInitialized = false;
let pendingAudios = [];

/**
 * Inicializa el contexto de audio para dispositivos móviles
 * Debe ser llamado después de una interacción del usuario
 */
export function initializeAudioForMobile() {
    if (audioInitialized) return true;
    
    try {
        // Crear un audio de prueba silencioso para inicializar el contexto
        const testAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuO1/LFdSUCMIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuO1/LFdSUCMIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuO1/LFdSUC');
        testAudio.volume = 0;
        testAudio.play().then(() => {
            audioInitialized = true;
            console.log('✅ Audio inicializado correctamente para móvil');
            
            // Reproducir audios pendientes
            pendingAudios.forEach(({ key, volume, loop }) => {
                playSoundEffect(key, volume, loop);
            });
            pendingAudios = [];
        }).catch(error => {
            console.warn('❌ Error inicializando audio:', error);
        });
        
        return true;
    } catch (error) {
        console.warn('❌ Error creando audio de prueba:', error);
        return false;
    }
}

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

// Sistema de inicialización de audio para dispositivos móviles
let audioContext = null;
let audioInitialized = false;
let pendingAudios = [];
let firstInteractionDone = false;

// Detectar si es un dispositivo móvil
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
};

// Función para inicializar el audio tras la primera interacción del usuario
const initializeAudioOnFirstInteraction = () => {
    if (audioInitialized || firstInteractionDone) return Promise.resolve();
    
    return new Promise((resolve) => {
        console.log('🎵 Inicializando sistema de audio tras primera interacción...');
        
        try {
            // Crear AudioContext si no existe
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Reanudar AudioContext si está suspendido (muy común en móviles)
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('✅ AudioContext reanudado');
                });
            }
            
            // Crear y reproducir un audio silencioso para "despertar" el sistema
            const silentAudio = new Audio();
            silentAudio.volume = 0.01;
            silentAudio.preload = 'auto';
            
            // Usar una URL real pero muy pequeña de Dropbox para probar la conectividad
            silentAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAzF+yO/akjgMGl+52+OeWA4PWKzj77BdGgU2jdXxy3ktBSN8x/DckUELFGS36+6qWBUIQ5zd8bllHgU8ltrzxHYpBSqAzvLZiTYIF2q+8OCfVg0PU6zl8bVlGgY6ktfzzXkugSdwyO7ajTcJH2689+WlUQ8NVajk561uFgU2jdXxy3ktBSJ7yPDdkUELEGG36+6qWRcJRZvb8a5iGAU4ltrzxHUpBSl/zvLZiDUHGGq88N6eWgwNUarm7alQFQxOounxtGQSAZrg4O5W';
            
            const playPromise = silentAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('✅ Sistema de audio inicializado correctamente');
                    audioInitialized = true;
                    firstInteractionDone = true;
                    
                    // Ejecutar todos los audios pendientes
                    console.log(`🔊 Reproduciendo ${pendingAudios.length} audios pendientes...`);
                    pendingAudios.forEach(audioConfig => {
                        try {
                            audioConfig.callback();
                        } catch (error) {
                            console.warn('Error ejecutando audio pendiente:', error);
                        }
                    });
                    pendingAudios = [];
                    
                    resolve();
                }).catch((error) => {
                    console.warn('⚠️ Error inicializando audio:', error);
                    // Marcar como inicializado de todas formas para evitar bucles
                    audioInitialized = true;
                    firstInteractionDone = true;
                    resolve();
                });
            } else {
                audioInitialized = true;
                firstInteractionDone = true;
                resolve();
            }
        } catch (error) {
            console.warn('⚠️ Error configurando sistema de audio:', error);
            audioInitialized = true;
            firstInteractionDone = true;
            resolve();
        }
    });
};

// Agregar listeners para detectar la primera interacción del usuario
const setupFirstInteractionListeners = () => {
    if (firstInteractionDone) return;
    
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    
    const handleFirstInteraction = (event) => {
        if (firstInteractionDone) return;
        
        console.log('🎯 Primera interacción detectada:', event.type);
        
        // Remover todos los listeners
        events.forEach(eventType => {
            document.removeEventListener(eventType, handleFirstInteraction, true);
        });
        
        // Inicializar audio
        initializeAudioOnFirstInteraction();
    };
    
    // Agregar listeners para capturar la primera interacción
    events.forEach(eventType => {
        document.addEventListener(eventType, handleFirstInteraction, { capture: true, once: true });
    });
};

// Configurar listeners al cargar el módulo
if (typeof window !== 'undefined') {
    setupFirstInteractionListeners();
}

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
  wintrainer: 'https://www.dropbox.com/scl/fi/knul5jzv7ymcerkk1lc47/wintrainer.mp3?rlkey=z7qlv2415yke4ox1y546fod76&st=4zul5uwe&dl=1',
  
  // 6. gymbattle (música de batalla contra líder de gimnasio)
  gymbattle: 'https://www.dropbox.com/scl/fi/qmr61ipkl3pqhxb88ojul/gymbattle.mp3?rlkey=z64xxr230pdwyc6hw04g0g476&st=su3gd1e5&dl=1',
  
  // 7. trainerbattle (música de batalla contra entrenador)
  trainerbattle: 'https://www.dropbox.com/scl/fi/xy9ghyc0mcrpbn2aft4z7/trainerbattle.mp3?rlkey=pfqy1b99mzvl3rk7oespt8hp6&st=dzde7u7s&dl=1',
  
  // 8. wingym (música de victoria en gimnasio)
  wingym: 'https://www.dropbox.com/scl/fi/w5r8r2vsp0pt51g67gn3b/wingym.mp3?rlkey=kd5ffs8rvplqg7i4anq2y8wmd&st=v5uzpegp&dl=1',
  
  // 9. obtainbadge (sonido de obtener medalla)
  obtainbadge: 'https://www.dropbox.com/scl/fi/7cq8v51e967tbe54jvrei/obtainbadge.mp3?rlkey=grkimuyje3f5omglu4uzveto3&st=to1x4gtx&dl=1',
  
  // 10. casino (música de fondo para tragamonedas)
  casino: 'https://drive.google.com/uc?export=download&id=1f332jqpnji2h28El80PgEkVD-rfGcuVa',
  
  // Otros audios que puedas necesitar
  catchmusicgo: '/sounds/catchmusicgo.mp3',
};

// Rutas originales de efectos de sonido (mantener compatibilidad)
const soundEffectUrls = {
    notification: 'https://play.pokemonshowdown.com/audio/notification.wav',
    error: 'https://play.pokemonshowdown.com/audio/errorwaiting.wav', // Sonido de error
    
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
    
    // Sonidos adicionales que ya estaban configurados localmente
    pokeballopen: '/sounds/sfx/pokeballopen.mp3', // Direct path as requested
    levelup: '/sounds/sfx/levelup.mp3', // Sonido de subida de nivel
    shiny: '/sounds/sfx/shiny.mp3', // Sonido de Pokémon shiny
    slot: '/sounds/sfx/slot.wav', // Sonido para tragamonedas
    nothing: '/sounds/sfx/nothing.mp3', // Sonido para tragamonedas - nada
    win: '/sounds/sfx/win.mp3', // Sonido para tragamonedas - victoria
    victory: '/sounds/sfx/victory.mp3', // Sonido para tragamonedas - victoria grande
    whosthat: '/sounds/sfx/whosthat.mp3', // Sonido para juego "Who's that Pokemon"
    
    // Otros efectos de sonido pequeños
    misterygift: '/sounds/sfx/misterygift.mp3',
    pokeballthrowmasterball: '/sounds/sfx/pokeballthrowmasterball.mp3',
    pokeballwaiting: '/sounds/sfx/pokeballwaiting.mp3',
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
    // Función interna para reproducir el audio
    const playAudio = () => {
        // Primero intentar con URLs externas
        let url = externalAudioUrls[key];
        
        // Si no existe en URLs externas, intentar con rutas locales
        if (!url) {
            url = soundEffectUrls[key];
        }
        
        if (!url) {
            console.warn(`❌ No se encontró el sonido: ${key}`);
            return null;
        }
        
        try {
            const audio = new window.Audio();
            audio.volume = volume;
            audio.loop = loop;
            audio.preload = 'auto';
            
            // Rastrear audios de victoria globalmente para poder detenerlos después
            if (key === 'wintrainer' || key === 'wingym') {
                window.currentVictoryAudio = audio;
            }
            
            // Configurar CORS solo para URLs externas que lo requieran
            if (url.includes('dropbox.com') || url.includes('drive.google.com')) {
                audio.crossOrigin = 'anonymous';
            }
            
            // Manejadores de eventos mejorados
            audio.onloadstart = () => {
                console.log(`🔄 Cargando audio: ${key}`);
            };
            
            audio.oncanplay = () => {
                console.log(`✅ Audio listo para reproducir: ${key}`);
            };
            
            audio.onerror = (e) => {
                console.error(`❌ Error cargando audio ${key} desde ${url}:`, e);
                console.error('Detalles del error:', {
                    code: e.target?.error?.code,
                    message: e.target?.error?.message,
                    url: url
                });
            };
            
            // Configurar la fuente después de los event listeners
            audio.src = url;
            
            // Reproducir el audio con manejo de errores mejorado
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`🔊 Reproduciendo audio: ${key}`);
                }).catch(error => {
                    console.error(`❌ Error reproduciendo sonido ${key}:`, error.name, error.message);
                    
                    // Estrategias de fallback para errores comunes
                    if (error.name === 'NotAllowedError') {
                        console.log(`🚫 Audio bloqueado para ${key} - requiere interacción del usuario`);
                    } else if (error.name === 'NotSupportedError') {
                        console.log(`🔄 Intentando reproducir ${key} sin CORS...`);
                        try {
                            const fallbackAudio = new window.Audio(url);
                            fallbackAudio.volume = volume;
                            fallbackAudio.loop = loop;
                            // No configurar crossOrigin para el fallback
                            fallbackAudio.play().catch(fallbackError => {
                                console.error(`❌ Error en fallback para ${key}:`, fallbackError);
                            });
                        } catch (fallbackError) {
                            console.error(`❌ Error creando audio de fallback para ${key}:`, fallbackError);
                        }
                    } else if (error.name === 'AbortError') {
                        console.log(`⏹️ Reproducción de ${key} interrumpida`);
                    }
                });
            }
            
            return audio;
        } catch (error) {
            console.warn(`❌ Error creando elemento de audio para ${key}:`, error);
            return null;
        }
    };
    
    // Si el audio no está inicializado, agregar a la cola de pendientes
    if (!audioInitialized && !firstInteractionDone) {
        console.log(`⏳ Audio no inicializado, agregando ${key} a la cola de pendientes...`);
        pendingAudios.push({
            key: key,
            callback: playAudio,
            timestamp: Date.now()
        });
        
        return null;
    }
    
    // Si está inicializado o es desktop, reproducir directamente
    return playAudio();
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
        
        // Configurar CORS para URLs externas
        if (url.includes('dropbox.com') || url.includes('pokemonshowdown.com')) {
            audio.crossOrigin = 'anonymous';
        }
        
        // Agregar manejador de errores
        audio.onerror = (e) => {
            console.error(`Error cargando música ${key} desde ${url}:`, e);
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
        
        // Configurar CORS para URLs externas
        if (url.includes('dropbox.com') || url.includes('pokemonshowdown.com')) {
            audio.crossOrigin = 'anonymous';
        }
        
        // Agregar manejadores de eventos para depuración
        audio.onerror = (e) => {
            console.error(`Error cargando audio ${key} desde ${url}:`, e);
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

/**
 * Función para verificar si el sistema de audio está listo
 * @returns {boolean} - True si el audio está inicializado y listo
 */
export function isAudioReady() {
    return audioInitialized && firstInteractionDone;
}

/**
 * Función para obtener el número de audios pendientes
 * @returns {number} - Número de audios en la cola de pendientes
 */
export function getPendingAudioCount() {
    return pendingAudios.length;
}

/**
 * Función para forzar la inicialización del audio (útil para botones de "Activar Audio")
 * @returns {Promise<boolean>} - Promise que resuelve true si se inicializó correctamente
 */
export function forceAudioInitialization() {
    if (audioInitialized && firstInteractionDone) {
        return Promise.resolve(true);
    }
    
    return initializeAudioOnFirstInteraction().then(() => {
        return audioInitialized && firstInteractionDone;
    });
}
