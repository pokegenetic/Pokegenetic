// Test directo de audio en el navegador
console.log('🔊 Iniciando test de audio...');

// Test 1: Verificar que el archivo existe
console.log('📁 Verificando archivos...');
const testFiles = [
    '/catchmusicgo.mp3',
    '/pokemongym.mp3', 
    '/sfx/catchedgo.mp3'
];

testFiles.forEach(file => {
    const audio = new Audio(file);
    audio.addEventListener('canplaythrough', () => {
        console.log(`✅ ${file} - OK`);
    });
    audio.addEventListener('error', (e) => {
        console.log(`❌ ${file} - ERROR:`, e);
    });
});

// Test 2: Reproducir directamente
console.log('🎵 Test de reproducción directa...');
setTimeout(() => {
    console.log('Reproduciendo catchmusicgo...');
    const catchMusic = new Audio('/catchmusicgo.mp3');
    catchMusic.volume = 0.1;
    catchMusic.play().catch(e => console.error('Error catchmusicgo:', e));
    
    setTimeout(() => {
        catchMusic.pause();
        console.log('Catchmusicgo pausado');
        
        console.log('Reproduciendo pokemongym...');
        const gymMusic = new Audio('/pokemongym.mp3');
        gymMusic.volume = 0.1;
        gymMusic.play().catch(e => console.error('Error pokemongym:', e));
        
        setTimeout(() => {
            gymMusic.pause();
            console.log('Pokemongym pausado');
            
            console.log('Reproduciendo catchedgo...');
            const catchedSound = new Audio('/sfx/catchedgo.mp3');
            catchedSound.volume = 0.8;
            catchedSound.play().catch(e => console.error('Error catchedgo:', e));
        }, 2000);
    }, 3000);
}, 1000);

console.log('✅ Test script cargado. Revisa la consola en los próximos segundos...');
