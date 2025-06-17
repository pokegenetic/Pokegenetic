// src/lib/soundEffects.ts
const soundEffectUrls = {
    notification: 'https://play.pokemonshowdown.com/audio/notification.wav',
    error: 'https://play.pokemonshowdown.com/audio/errorwaiting.wav', // Sonido de error
    pokeballopen: '/src/sounds/sfx/pokeballopen.mp3', // Direct path as requested
    pokeballthrow: '/src/sounds/sfx/pokeballthrow.mp3',
    pokeballwait: '/src/sounds/sfx/pokeballwait.mp3',
    pokeballcatch: '/src/sounds/sfx/pokeballcatch.mp3', // Sonido de captura exitosa
    pokeballexplode: '/src/sounds/sfx/pokeballexplode.mp3', // Sonido de explosión cuando la captura falla
    catchmusic: '/src/sounds/sfx/catchmusic.mp3', // Sonido de música de captura exitosa
    heal: '/src/sounds/sfx/heal.mp3', // Sonido de curación para laboratorio
    superpower: '/src/sounds/sfx/superpower.mp3', // Sonido de Ataque Cargado
    pokemongym: '/src/sounds/pokemongym.mp3', // Música de gimnasio Pokémon
    wintrainer: '/src/sounds/wintrainer.mp3', // Música de victoria contra entrenador
    gymbattle: '/src/sounds/gymbattle.mp3', // Música de batalla contra líder de gimnasio
    trainerbattle: '/src/sounds/trainerbattle.mp3', // Música de batalla contra entrenador
    wingym: '/src/sounds/wingym.mp3', // Música de victoria en gimnasio
    obtainbadge: '/src/sounds/obtainbadge.mp3', // Sonido de obtener medalla
    pokeballreturn: '/src/sounds/sfx/pokeballreturn.mp3', // Sonido cuando un Pokémon es derrotado
    pop: 'https://play.pokemonshowdown.com/audio/notification.wav', // Sonido para navegación
    // Puedes agregar más sonidos aquí, por ejemplo:
    // success: 'url',
};
export function playSoundEffect(key, volume = 1) {
    const url = soundEffectUrls[key];
    if (!url)
        return;
    const audio = new window.Audio(url);
    audio.volume = volume; // Use provided volume
    // Rastrear audios de victoria globalmente para poder detenerlos después
    if (key === 'wintrainer' || key === 'wingym') {
        window.currentVictoryAudio = audio;
    }
    audio.play();
}
