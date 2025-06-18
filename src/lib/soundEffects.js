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

// URLs de efectos de sonido (Dropbox con descarga directa)
const soundEffects = {
    // Efectos de PC
    pc: 'https://www.dropbox.com/scl/fi/hhgzpvfbvjpwfxjqzjh9z/pc.mp3?rlkey=xjpqmwjdtmj3h2bvqhkqxrj6b&dl=1',
    
    // Efectos de Pokéball
    pokeballcatch: 'https://www.dropbox.com/scl/fi/2y5v4xfkcj2u1qrb7b0m9/pokeballcatch.mp3?rlkey=mrhxqnc4n1o7rqgfblxk0nqo8&dl=1',
    pokeballthrow: 'https://www.dropbox.com/scl/fi/1aqrb4lhvqnvhgqfxfzje/pokeballthrow.mp3?rlkey=uj4l7bwtyb5ztxjuuqsj8wqp0&dl=1',
    pokeballexplode: 'https://www.dropbox.com/scl/fi/iqy7y8jzmlgfqo1p3h0hx/pokeballexplode.mp3?rlkey=vqr4q9uh1e8b6cxcmqpjdafk9&dl=1',
    pokeballwait: 'https://www.dropbox.com/scl/fi/qj0yrdmxwejxjdl5cxsxh/pokeballwait.mp3?rlkey=ej2mfbr2y4j7f6ynzxm8mqmf4&dl=1',
    pokeballreturn: 'https://www.dropbox.com/scl/fi/0ks8uqnxcvqcalqfh8hpn/pokeballreturn.mp3?rlkey=uw1a9mh3c7p4m6gxg8s2hkvy2&dl=1',
    
    // Música de captura
    catchmusic: 'https://www.dropbox.com/scl/fi/dkfqe9pfbdyh9oqxbqhb9/catchmusic.mp3?rlkey=3cg0x8mt7xmjgfnl4vkmfqhgq&dl=1',
    
    // Efectos especiales
    superpower: 'https://www.dropbox.com/scl/fi/8bqhfs3hxfmf5jqhcqx6j/superpower.mp3?rlkey=3oqxdxzt6hv8vwg4tkwxwxjh4&dl=1',
    heal: 'https://www.dropbox.com/scl/fi/2ot6qgvjfz7fkxywsb5dg/heal.mp3?rlkey=9y3xcmgkxh2xmhfvkgq3vq3w8&dl=1',
    
    // Efectos de notificación
    notification: 'https://www.dropbox.com/scl/fi/0qxcxkj8y7qgkxp8qt6tx/notification.mp3?rlkey=1yj9y9mxjpg7vk6qhvqg4fkx2&dl=1',
    pop: 'https://www.dropbox.com/scl/fi/0qxcxkj8y7qgkxp8qt6tx/notification.mp3?rlkey=1yj9y9mxjpg7vk6qhvqg4fkx2&dl=1',
    
    // Música de fondo y efectos largos
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
    catchmusicgo: '/sounds/catchmusicgo.mp3'
};

// Función para inicializar el audio tras la primera interacción del usuario
export const initializeAudioForMobile = () => {
    if (audioInitialized || firstInteractionDone) return Promise.resolve();
    
    return new Promise((resolve) => {
        console.log('🎵 Inicializando sistema de audio tras primera interacción...');
        
        try {
            // Crear AudioContext si no existe
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Reanudar AudioContext si está suspendido (común en móviles)
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log('✅ AudioContext reanudado');
                });
            }
            
            // Crear y reproducir un audio silencioso para "despertar" el sistema
            const silentAudio = new Audio();
            silentAudio.volume = 0;
            silentAudio.preload = 'auto';
            silentAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuO1/LFdSUCMIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuO1/LFdSUC';
            
            const playPromise = silentAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('✅ Sistema de audio inicializado correctamente');
                    audioInitialized = true;
                    firstInteractionDone = true;
                    
                    // Ejecutar todos los audios pendientes
                    console.log(`🔊 Reproduciendo ${pendingAudioQueue.length} audios pendientes...`);
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

// Función interna para reproducir audio directamente
const playAudioDirectly = (soundType, volume = 1.0, loop = false) => {
    // Verificar si el tipo de sonido es válido
    if (!soundEffects[soundType]) {
        console.warn(`Tipo de sonido "${soundType}" no encontrado`);
        return null;
    }

    try {
        // Crear un nuevo objeto Audio
        const audio = new Audio(soundEffects[soundType]);
        
        // Configurar el volumen
        audio.volume = Math.max(0, Math.min(1, volume));
        
        // Configurar el loop
        audio.loop = loop;
        
        // Configurar crossOrigin para evitar problemas de CORS
        audio.crossOrigin = 'anonymous';
        
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
export const getSoundUrl = (soundType) => soundEffects[soundType] || null;
export const getPendingAudioCount = () => pendingAudioQueue.length;
