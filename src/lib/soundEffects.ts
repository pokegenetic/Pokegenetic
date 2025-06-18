// Sistema de gestión de audio optimizado para móviles y desktop
let audioContext: AudioContext | null = null;
let audioInitialized = false;
let pendingAudioQueue: Array<{soundType: string, volume: number, loop: boolean}> = [];
let firstInteractionDone = false;

// Detectar si es un dispositivo móvil
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
};

// Archivos de audio locales (PRIMARIO - más confiable)
const localSounds = {
    // Efectos de PC
    pc: '/sfx/pc.mp3',
    
    // Efectos de Pokéball
    pokeballcatch: '/sfx/pokeballcatch.mp3',
    pokeballthrow: '/sfx/pokeballthrow.mp3',
    pokeballexplode: '/sfx/pokeballexplode.mp3',
    pokeballwait: '/sfx/pokeballwait.mp3',
    pokeballreturn: '/sfx/pokeballreturn.mp3',
    pokeballopen: '/sfx/pokeballopen.mp3',
    pokeballwaiting: '/sfx/pokeballwaiting.mp3',
    pokeballthrowmasterball: '/sfx/pokeballthrowmasterball.mp3',
    
    // Música de captura - CONFIGURACIÓN ESPECIAL según especificaciones
    catchmusic: '/sfx/catchmusic.mp3',
    pokemoncatch: '/catchmusicgo.mp3', // pokemoncatch usa catchmusicgo
    catchmusicgo: '/catchmusicgo.mp3',
    catchedgo: '/sfx/catchedgo.mp3', // para captura exitosa
    
    // Efectos especiales
    superpower: '/sfx/superpower.wav',
    heal: '/sfx/heal.mp3',
    levelup: '/sfx/levelup.mp3',
    shiny: '/sfx/shiny.mp3',
    victory: '/sfx/victory.mp3',
    win: '/sfx/win.mp3',
    
    // Efectos de notificación
    notification: '/notification.mp3',
    pop: '/notification.mp3',
    
    // Música de fondo
    pokechillmusic: '/pokechillmusic.mp3',
    pokemongym: '/pokemongym.mp3',
    wintrainer: '/wintrainer.mp3',
    gymbattle: '/gymbattle.mp3',
    trainerbattle: '/trainerbattle.mp3',
    wingym: '/wingym.mp3',
    obtainbadge: '/obtainbadge.mp3',
    casino: '/casino.mp3',
    
    // Juegos específicos
    memorice: '/sfx/memorice.mp3',
    whosthat: '/sfx/whosthat.mp3',
    winrewards: '/sfx/winrewards.mp3',
    misterygift: '/sfx/misterygift.mp3',
    slot: '/sfx/slot.wav',
    nothing: '/sfx/nothing.mp3',
    
    // Efecto de error
    error: '/notification.mp3'
};

// URLs de efectos de sonido desde GitHub Pages CDN (FALLBACK)
const githubCDNSounds = {
    // Efectos de PC
    pc: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pc.mp3',
    
    // Efectos de Pokéball
    pokeballcatch: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pokeballcatch.mp3',
    pokeballthrow: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pokeballthrow.mp3',
    pokeballexplode: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pokeballexplode.mp3',
    pokeballwait: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pokeballwait.mp3',
    pokeballreturn: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pokeballreturn.mp3',
    pokeballopen: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pokeballopen.mp3',
    pokeballwaiting: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pokeballwaiting.mp3',
    pokeballthrowmasterball: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pokeballthrowmasterball.mp3',
    
    // Música de captura - CONFIGURACIÓN ESPECIAL según especificaciones
    catchmusic: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/catchmusic.mp3',
    pokemoncatch: 'https://pokegenetic.github.io/pokegenetic-audio/audio/catchmusicgo.mp3', // pokemoncatch usa catchmusicgo
    catchmusicgo: 'https://pokegenetic.github.io/pokegenetic-audio/audio/catchmusicgo.mp3',
    catchedgo: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/catchedgo.mp3', // para captura exitosa
    
    // Efectos especiales
    superpower: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/superpower.wav',
    heal: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/heal.mp3',
    levelup: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/levelup.mp3',
    shiny: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/shiny.mp3',
    victory: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/victory.mp3',
    win: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/win.mp3',
    
    // Efectos de notificación
    notification: 'https://pokegenetic.github.io/pokegenetic-audio/audio/notification.mp3',
    pop: 'https://pokegenetic.github.io/pokegenetic-audio/audio/notification.mp3',
    
    // Música de fondo
    pokechillmusic: 'https://pokegenetic.github.io/pokegenetic-audio/audio/pokechillmusic.mp3',
    pokemongym: 'https://pokegenetic.github.io/pokegenetic-audio/audio/pokemongym.mp3',
    wintrainer: 'https://pokegenetic.github.io/pokegenetic-audio/audio/wintrainer.mp3',
    gymbattle: 'https://pokegenetic.github.io/pokegenetic-audio/audio/gymbattle.mp3',
    trainerbattle: 'https://pokegenetic.github.io/pokegenetic-audio/audio/trainerbattle.mp3',
    wingym: 'https://pokegenetic.github.io/pokegenetic-audio/audio/wingym.mp3',
    obtainbadge: 'https://pokegenetic.github.io/pokegenetic-audio/audio/obtainbadge.mp3',
    casino: 'https://pokegenetic.github.io/pokegenetic-audio/audio/casino.mp3',
    
    // Juegos específicos
    memorice: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/memorice.mp3',
    whosthat: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/whosthat.mp3',
    winrewards: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/winrewards.mp3',
    misterygift: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/misterygift.mp3',
    slot: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/slot.wav',
    nothing: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/nothing.mp3',
    
    // Efecto de error
    error: 'https://pokegenetic.github.io/pokegenetic-audio/audio/notification.mp3'
};

// URLs de Pokémon Showdown como fallback adicional (sabemos que funcionan)
const pokemonShowdownSounds = {
    // Solo los que sabemos que existen y funcionan
    notification: 'https://play.pokemonshowdown.com/audio/notification.wav',
    // Música de fondo que sabemos que funciona (patrón pokemoncatch)
    backgroundmusic: 'https://play.pokemonshowdown.com/audio/xy-rival.ogg',
};



// Función para obtener la URL del sonido con sistema de fallback múltiple
const getSoundUrl = (soundType: string, fallbackLevel: number = 0): string | null => {
    switch (fallbackLevel) {
        case 0:
            // Primer intento: archivos locales (MÁS CONFIABLE)
            return localSounds[soundType as keyof typeof localSounds] || null;
        case 1:
            // Segundo intento: CDN de GitHub Pages (fallback)
            return githubCDNSounds[soundType as keyof typeof githubCDNSounds] || null;
        case 2:
            // Tercer intento: Pokémon Showdown (último recurso)
            return pokemonShowdownSounds[soundType as keyof typeof pokemonShowdownSounds] || null;
        default:
            return null;
    }
};

// Función mejorada para reproducir audio con sistema de fallback múltiple
const playAudioWithFallback = async (soundType: string, volume: number = 1.0, loop: boolean = false): Promise<HTMLAudioElement | null> => {
    // Intentar con todos los niveles de fallback
    for (let fallbackLevel = 0; fallbackLevel <= 2; fallbackLevel++) {
        const soundUrl = getSoundUrl(soundType, fallbackLevel);
        
        if (!soundUrl) {
            continue; // Pasar al siguiente nivel de fallback
        }

        try {
            const fallbackNames = ['Local', 'CDN GitHub', 'Pokémon Showdown'];
            console.log(`🔊 Intentando reproducir "${soundType}" desde ${fallbackNames[fallbackLevel]}: ${soundUrl}`);
            
            const audio = new Audio(soundUrl);
            audio.volume = Math.max(0, Math.min(1, volume));
            audio.loop = loop;
            
            // Configurar timeout para la carga
            const playPromise = audio.play();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout')), 2000);
            });
            
            await Promise.race([playPromise, timeoutPromise]);
            console.log(`✅ Sonido "${soundType}" reproducido desde ${fallbackNames[fallbackLevel]}`);
            return audio;
            
        } catch (error) {
            console.warn(`⚠️ Error con fallback nivel ${fallbackLevel} para "${soundType}":`, error);
            continue; // Intentar el siguiente fallback
        }
    }
    
    console.error(`❌ Todos los fallbacks fallaron para "${soundType}"`);
    return null;
};

// Función de inicialización simplificada para móviles
const initializeAudioForMobile = (): Promise<void> => {
    return new Promise((resolve) => {
        try {
            // Crear contexto de audio con la interacción del usuario
            if (!audioContext && 'AudioContext' in window) {
                // @ts-ignore - webkitAudioContext para Safari
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioContext.resume().then(() => {
                    if (audioContext?.state === 'running') {
                        audioInitialized = true;
                        firstInteractionDone = true;
                        console.log('🔊 Sistema de audio inicializado correctamente');
                        
                        // Procesar cola de sonidos pendientes
                        if (pendingAudioQueue.length > 0) {
                            console.log(`📋 Procesando ${pendingAudioQueue.length} sonidos en cola`);
                            pendingAudioQueue.forEach(({ soundType, volume, loop }) => {
                                playAudioWithFallback(soundType, volume, loop);
                            });
                            pendingAudioQueue = [];
                        }
                    }
                    resolve();
                }).catch(error => {
                    console.warn('⚠️ Error al reanudar contexto de audio:', error);
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

// Función que replica el patrón de pokemoncatch (usando rutas locales primero)
export const playDirectAudio = (soundType: string, volume: number = 1.0, loop: boolean = false): HTMLAudioElement | null => {
    const soundUrl = getSoundUrl(soundType, 0); // Nivel 0: Local (más confiable)
    
    if (!soundUrl) {
        console.warn(`Sonido "${soundType}" no encontrado en archivos locales`);
        return null;
    }
    
    try {
        // Mismo patrón que pokemoncatch pero con archivos locales
        const audio = new Audio(soundUrl);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.loop = loop;
        audio.play().catch(() => {
            console.warn(`Error reproduciendo sonido "${soundType}" desde archivos locales`);
        });
        
        return audio;
    } catch (error) {
        console.error(`Error creando audio para "${soundType}":`, error);
        return null;
    }
};

// Función principal para reproducir efectos de sonido (SIMPLIFICADA - rutas locales primero)
export const playSoundEffect = (soundType: string, volume: number = 1.0, loop: boolean = false): HTMLAudioElement | null => {
    console.log(`🔊 playSoundEffect llamado para "${soundType}"`);
    
    // Usar el mismo patrón exacto que playDirectAudio pero con archivos locales primero
    const soundUrl = getSoundUrl(soundType, 0); // Nivel 0: Local (más confiable)
    
    if (!soundUrl) {
        console.warn(`Sonido "${soundType}" no encontrado en archivos locales`);
        
        // Intentar fallback de CDN GitHub
        const githubUrl = getSoundUrl(soundType, 1); // Nivel 1: CDN GitHub
        if (githubUrl) {
            try {
                console.log(`🔄 Usando CDN GitHub para "${soundType}": ${githubUrl}`);
                const audio = new Audio(githubUrl);
                audio.volume = Math.max(0, Math.min(1, volume));
                audio.loop = loop;
                audio.play().catch(() => {
                    console.warn(`Error reproduciendo sonido "${soundType}" desde CDN GitHub`);
                });
                return audio;
            } catch (error) {
                console.error(`Error creando audio CDN GitHub para "${soundType}":`, error);
            }
        }
        
        // Intentar fallback de Pokémon Showdown
        const pokemonShowdownUrl = getSoundUrl(soundType, 2); // Nivel 2: Pokémon Showdown
        if (!pokemonShowdownUrl) {
            console.error(`Tampoco hay fallback de Pokémon Showdown para "${soundType}"`);
            return null;
        }
        
        try {
            console.log(`🔄 Usando fallback Pokémon Showdown para "${soundType}": ${pokemonShowdownUrl}`);
            const audio = new Audio(pokemonShowdownUrl);
            audio.volume = Math.max(0, Math.min(1, volume));
            audio.loop = loop;
            audio.play().catch(() => {
                console.warn(`Error reproduciendo sonido "${soundType}" desde Pokémon Showdown`);
            });
            return audio;
        } catch (error) {
            console.error(`Error creando audio Pokémon Showdown para "${soundType}":`, error);
            return null;
        }
    }
    
    try {
        // Mismo patrón exacto que pokemoncatch y playDirectAudio
        console.log(`🔊 Reproduciendo "${soundType}" desde archivos locales: ${soundUrl}`);
        const audio = new Audio(soundUrl);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.loop = loop;
        audio.play().catch(() => {
            console.warn(`Error reproduciendo sonido "${soundType}" desde archivos locales`);
        });
        
        return audio;
    } catch (error) {
        console.error(`Error creando audio para "${soundType}":`, error);
        return null;
    }
};

// Función para verificar si el audio está inicializado
export const isAudioInitialized = () => {
    return audioInitialized;
};

// Configurar listeners para detectar la primera interacción del usuario
const setupFirstInteractionListeners = () => {
    if (firstInteractionDone || typeof window === 'undefined') return;
    
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    
    const handleFirstInteraction = () => {
        if (!firstInteractionDone) {
            console.log('👆 Primera interacción detectada, inicializando sistema de audio...');
            firstInteractionDone = true;
            
            // Remover listeners
            events.forEach(event => {
                document.removeEventListener(event, handleFirstInteraction, true);
            });
            
            // Inicializar sistema de audio
            initializeAudioForMobile();
        }
    };
    
    // Agregar listeners para detectar la primera interacción
    events.forEach(event => {
        document.addEventListener(event, handleFirstInteraction, true);
    });
};

// Función para inicializar el sistema de audio (llamada manualmente)
export const initializeAudio = (): Promise<void> => {
    if (isMobileDevice() && !audioInitialized) {
        return initializeAudioForMobile();
    }
    return Promise.resolve();
};

// Función para crear música de fondo (patrón pokemoncatch)
export const playBackgroundMusic = (soundType: string, volume: number = 0.03): HTMLAudioElement | null => {
    return playDirectAudio(soundType, volume, true); // loop = true para música de fondo
};

// Función para obtener todos los sonidos disponibles
export const getAvailableSounds = () => Object.keys(localSounds);

// FUNCIONES HELPER ESPECÍFICAS PARA POKEMONCATCH

// Para cuando se inicia el proceso de captura (usa catchmusicgo)
export const playPokemonCatchMusic = (volume: number = 1.0): HTMLAudioElement | null => {
    console.log('🎵 Iniciando música de captura Pokémon (catchmusicgo)...');
    return playSoundEffect('catchmusicgo', volume, true); // loop = true para música de fondo
};

// Para cuando se captura exitosamente un Pokémon  
export const playPokemonCatchSuccess = (volume: number = 1.0): HTMLAudioElement | null => {
    console.log('✅ Pokémon capturado exitosamente!');
    return playSoundEffect('catchedgo', volume, false); // loop = false para efecto de sonido
};

// Para detener la música de captura cuando termine el proceso
export const stopPokemonCatchMusic = (audioElement: HTMLAudioElement | null): void => {
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        console.log('⏹️ Música de captura detenida');
    }
};

// FUNCIONES HELPER ESPECÍFICAS PARA LIGA POKÉMON

// Para cuando se entra a Liga Pokémon (música de gimnasio)
export const playLigaPokemonMusic = (volume: number = 0.1): HTMLAudioElement | null => {
    console.log('🏟️ Iniciando música de Liga Pokémon (pokemongym)...');
    return playSoundEffect('pokemongym', volume, true); // loop = true para música de fondo
};

// Para detener la música de Liga Pokémon
export const stopLigaPokemonMusic = (audioElement: HTMLAudioElement | null): void => {
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        console.log('⏹️ Música de Liga Pokémon detenida');
    }
};

// Auto-inicializar listeners cuando se carga el módulo
if (typeof window !== 'undefined') {
    setupFirstInteractionListeners();
}
