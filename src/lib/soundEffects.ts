// src/lib/soundEffects.ts

const soundEffectUrls: Record<string, string> = {
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
  pokemongym: 'https://www.dropbox.com/scl/fi/qqo6mosag3s7rwukfnla9/pokemongym.mp3?rlkey=rp0zp5oaddnh0np06qtez9gbx&st=pmao4i07&dl=1', // Música de gimnasio Pokémon desde Dropbox
  wintrainer: '/src/sounds/wintrainer.mp3', // Música de victoria contra entrenador
  gymbattle: '/src/sounds/gymbattle.mp3', // Música de batalla contra líder de gimnasio
  trainerbattle: '/src/sounds/trainerbattle.mp3', // Música de batalla contra entrenador
  wingym: '/src/sounds/wingym.mp3', // Música de victoria en gimnasio
  obtainbadge: '/src/sounds/obtainbadge.mp3', // Sonido de obtener medalla
  pokeballreturn: '/src/sounds/sfx/pokeballreturn.mp3', // Sonido cuando un Pokémon es derrotado
  pop: 'https://play.pokemonshowdown.com/audio/notification.wav', // Sonido para navegación
  pokechillmusic: 'https://www.dropbox.com/scl/fi/rf5wcwn0dlq9qs6vvgjvu/pokechillmusic.mp3?rlkey=ex3zevbk8s21l3jntflpfcykn&st=r101jruf&dl=1', // Música de fondo principal desde Dropbox
  // Puedes agregar más sonidos aquí, por ejemplo:
  // success: 'url',
};

export function playSoundEffect(key: string, volume: number = 1) {
  const url = soundEffectUrls[key];
  if (!url) return;
  const audio = new window.Audio(url);
  audio.volume = volume; // Use provided volume
  
  // Rastrear audios de victoria globalmente para poder detenerlos después
  if (key === 'wintrainer' || key === 'wingym') {
    (window as any).currentVictoryAudio = audio;
  }
  
  audio.play();
}
