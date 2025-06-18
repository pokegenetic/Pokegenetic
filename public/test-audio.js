// Script de prueba directo para el sistema de audio
console.log('🧪 Iniciando pruebas de audio...');

// Test 1: CDN directo de GitHub Pages
console.log('Test 1: CDN directo');
const testCDN = () => {
    const audio = new Audio('https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pc.mp3');
    audio.volume = 0.5;
    audio.play()
        .then(() => console.log('✅ CDN directo funciona'))
        .catch(error => console.error('❌ CDN directo falló:', error));
};

// Test 2: Archivo local
console.log('Test 2: Archivo local');
const testLocal = () => {
    const audio = new Audio('/sfx/pc.mp3');
    audio.volume = 0.5;
    audio.play()
        .then(() => console.log('✅ Archivo local funciona'))
        .catch(error => console.error('❌ Archivo local falló:', error));
};

// Test 3: Usando nuestro sistema
console.log('Test 3: Sistema personalizado');
const testSystem = async () => {
    try {
        const { playDirectAudio } = await import('/src/lib/soundEffects.ts');
        const result = playDirectAudio('pc', 0.5, false);
        if (result) {
            console.log('✅ Sistema personalizado funciona');
        } else {
            console.error('❌ Sistema personalizado falló - retornó null');
        }
    } catch (error) {
        console.error('❌ Error cargando sistema:', error);
    }
};

// Ejecutar tests después de una interacción del usuario
document.addEventListener('click', () => {
    console.log('👆 Click detectado, ejecutando tests...');
    testCDN();
    setTimeout(testLocal, 1000);
    setTimeout(testSystem, 2000);
}, { once: true });

console.log('📋 Tests preparados. Haz click en cualquier parte para ejecutar.');
