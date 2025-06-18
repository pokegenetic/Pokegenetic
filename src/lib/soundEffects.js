// Sistema de gestión de audio optimizado para móviles y desktop
let audioContext = null;
let audioInitialized = false;
let pendingAudioQueue = [];
let firstInteractionDone = false;

// Detectar si es un dispositivo móvil
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
};

// URLs de efectos de sonido locales (todos servidos desde public/)
const soundEffects = {
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
    
    // Música de captura
    catchmusic: '/sfx/catchmusic.mp3',
    catchmusicgo: '/catchmusicgo.mp3',
    catchedgo: '/sfx/catchedgo.mp3',
    
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
    
    // Efecto de error (añadiendo para compatibilidad)
    error: '/notification.mp3'
};

// Función de inicialización simplificada para móviles
const initializeAudioForMobile = () => {
    return new Promise((resolve) => {
        try {
            if (typeof window !== 'undefined' && window.AudioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
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
const playAudioDirectly = (soundType, volume = 1.0, loop = false) => {
    // Verificar si el tipo de sonido es válido
    if (!soundEffects[soundType]) {
        console.warn(`Tipo de sonido "${soundType}" no encontrado`);
        return null;
    }

    try {
        // Obtener la URL del sonido
        const soundUrl = soundEffects[soundType];
        
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

// Función principal para reproducir efectos de sonido
export const playSoundEffect = (soundType, volume = 1.0, loop = false) => {
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
    
    const handleFirstInteraction = (event) => {
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