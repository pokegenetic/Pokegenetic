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

// URLs de efectos de sonido desde GitHub Pages CDN (sin problemas de CORS)
const soundEffects = {
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
    
    // Música de captura
    catchmusic: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/catchmusic.mp3',
    catchmusicgo: 'https://pokegenetic.github.io/pokegenetic-audio/audio/catchmusicgo.mp3',
    catchedgo: 'https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/catchedgo.mp3',
    
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
    
    // Efecto de error (añadiendo para compatibilidad)
    error: 'https://pokegenetic.github.io/pokegenetic-audio/audio/notification.mp3'
};

// Función de inicialización simplificada para móviles
const initializeAudioForMobile = (): Promise<void> => {
    return new Promise((resolve) => {
        try {
            if (typeof window !== 'undefined' && window.AudioContext) {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                
                audioContext.resume().then(() => {
                    console.log('🎵 AudioContext inicializado para móvil');
                    audioInitialized = true;
                    firstInteractionDone = true;
                    
                    // Reproducir sonidos pendientes
                    pendingAudioQueue.forEach(({ soundType, volume, loop }) => {
                        playAudioDirectly(soundType, volume, loop);
                    });
                    pendingAudioQueue = [];
                    
                    resolve();
                }).catch((error) => {
                    console.warn('⚠️ Error inicializando audio:', error);
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

// Función simplificada para reproducir audio directamente
const playAudioDirectly = (soundType: string, volume: number = 1.0, loop: boolean = false): HTMLAudioElement | null => {
    // Verificar si el tipo de sonido es válido
    if (!soundEffects[soundType as keyof typeof soundEffects]) {
        console.warn(`Tipo de sonido "${soundType}" no encontrado`);
        return null;
    }

    try {
        // Obtener la URL del sonido
        const soundUrl = soundEffects[soundType as keyof typeof soundEffects];
        
        if (!soundUrl) {
            console.warn(`URL no encontrada para el sonido "${soundType}"`);
            return null;
        }

        // Crear un nuevo objeto Audio
        const audio = new Audio(soundUrl);
        
        // Configurar el volumen
        audio.volume = Math.max(0, Math.min(1, volume));
        
        // Configurar el loop
        audio.loop = loop;
        
        // Reproducir el sonido
        const playPromise = audio.play();
        
        // Manejar la promesa de reproducción
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log(`🔊 Sonido "${soundType}" reproducido exitosamente`);
                })
                .catch(error => {
                    console.warn(`⚠️ Error al reproducir sonido "${soundType}":`, error);
                });
        }
        
        return audio;
    } catch (error) {
        console.error(`❌ Error al crear el objeto Audio para "${soundType}":`, error);
        return null;
    }
};

// Función que replica el patrón de pokemoncatch (que SÍ funciona)
export const playDirectAudio = (soundType: string, volume: number = 1.0, loop: boolean = false): HTMLAudioElement | null => {
    const soundUrl = soundEffects[soundType as keyof typeof soundEffects];
    
    if (!soundUrl) {
        console.warn(`Sonido "${soundType}" no encontrado en GitHub Pages CDN`);
        return null;
    }
    
    try {
        // Mismo patrón que pokemoncatch
        const audio = new Audio(soundUrl);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.loop = loop;
        audio.play().catch(() => {
            console.warn(`Error reproduciendo sonido "${soundType}" desde GitHub Pages CDN`);
        });
        
        return audio;
    } catch (error) {
        console.error(`Error creando audio para "${soundType}":`, error);
        return null;
    }
};

// Función principal para reproducir efectos de sonido
export const playSoundEffect = (soundType: string, volume: number = 1.0, loop: boolean = false): HTMLAudioElement | null => {
    // Si el audio no está inicializado y estamos en un dispositivo móvil, agregar a la cola
    if (!audioInitialized && isMobileDevice()) {
        pendingAudioQueue.push({ soundType, volume, loop });
        console.log(`📋 Sonido "${soundType}" agregado a la cola (esperando inicialización)`);
        return null;
    }
    
    // Reproducir el audio directamente
    return playAudioDirectly(soundType, volume, loop);
};

// Función para verificar si el audio está inicializado
export const isAudioInitialized = () => {
    return audioInitialized;
};

// Configurar listeners para detectar la primera interacción del usuario
const setupFirstInteractionListeners = () => {
    if (firstInteractionDone || typeof window === 'undefined') return;
    
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    
    const handleFirstInteraction = (event: Event) => {
        if (firstInteractionDone) return;
        
        console.log('🎯 Primera interacción detectada:', event.type);
        
        // Remover todos los listeners
        events.forEach(eventType => {
            document.removeEventListener(eventType, handleFirstInteraction, true);
        });
        
        // Inicializar audio si estamos en móvil
        if (isMobileDevice()) {
            initializeAudioForMobile();
        } else {
            // En desktop, marcar como inicializado directamente
            audioInitialized = true;
            firstInteractionDone = true;
        }
    };
    
    // Agregar listeners para capturar la primera interacción
    events.forEach(eventType => {
        document.addEventListener(eventType, handleFirstInteraction, { capture: true, once: true });
    });
    
    console.log('🎵 Listeners de audio configurados para primera interacción');
};

// Auto-inicializar los listeners cuando se carga el módulo
if (typeof window !== 'undefined') {
    // En desktop, inicializar directamente
    if (!isMobileDevice()) {
        audioInitialized = true;
        firstInteractionDone = true;
        console.log('🖥️ Desktop detectado: Audio habilitado directamente');
    } else {
        setupFirstInteractionListeners();
        console.log('📱 Móvil detectado: Esperando primera interacción para habilitar audio');
    }
}

// Exportar funciones utilitarias adicionales
export const getAvailableSounds = () => Object.keys(soundEffects);
export const getPendingAudioCount = () => pendingAudioQueue.length;

// Funciones para compatibilidad con código existente
export const isAudioReady = () => audioInitialized;
export const forceAudioInitialization = () => {
    if (isMobileDevice() && !audioInitialized) {
        return initializeAudioForMobile();
    }
    return Promise.resolve();
};

// Función para crear música de fondo (patrón pokemoncatch)
export const playBackgroundMusic = (soundType: string, volume: number = 0.03): HTMLAudioElement | null => {
    return playDirectAudio(soundType, volume, true); // loop = true para música de fondo
};