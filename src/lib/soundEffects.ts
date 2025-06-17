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
  wintrainer: 'https://www.dropbox.com/scl/fi/knul5jzv7ymcerkk1lc47/wintrainer.mp3?rlkey=z7qlv2415yke4ox1y546fod76&st=4zul5uwe&dl=1', // Música de victoria contra entrenador desde Dropbox
  gymbattle: 'https://www.dropbox.com/scl/fi/qmr61ipkl3pqhxb88ojul/gymbattle.mp3?rlkey=z64xxr230pdwyc6hw04g0g476&st=su3gd1e5&dl=1', // Música de batalla contra líder de gimnasio desde Dropbox
  trainerbattle: 'https://www.dropbox.com/scl/fi/xy9ghyc0mcrpbn2aft4z7/trainerbattle.mp3?rlkey=pfqy1b99mzvl3rk7oespt8hp6&st=dzde7u7s&dl=1', // Música de batalla contra entrenador desde Dropbox
  wingym: 'https://www.dropbox.com/scl/fi/w5r8r2vsp0pt51g67gn3b/wingym.mp3?rlkey=kd5ffs8rvplqg7i4anq2y8wmd&st=v5uzpegp&dl=1', // Música de victoria en gimnasio desde Dropbox
  obtainbadge: 'https://www.dropbox.com/scl/fi/7cq8v51e967tbe54jvrei/obtainbadge.mp3?rlkey=grkimuyje3f5omglu4uzveto3&st=to1x4gtx&dl=1', // Sonido de obtener medalla desde Dropbox
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

// Función especializada para música de fondo con loop
export function playLoopingMusic(key: string, volume: number = 0.1): HTMLAudioElement | null {
  const url = soundEffectUrls[key];
  if (!url) return null;
  
  const audio = new window.Audio(url);
  audio.volume = volume;
  audio.loop = true;
  // Removido crossOrigin para evitar problemas CORS con Dropbox
  audio.play().catch(console.error);
  
  return audio;
}
