import React from 'react';
import { playDirectAudio, playBackgroundMusic } from '@/lib/soundEffects';

const AudioTester = () => {
  const testSounds = [
    'pc',
    'pokeballcatch', 
    'pokeballthrow',
    'pokeballexplode',
    'notification',
    'superpower',
    'heal'
  ];

  // Test directo con GitHub Pages CDN
  const testDirectCDN = (soundName: string) => {
    const audio = new Audio(`https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/${soundName}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.error(`Error reproduciendo ${soundName} desde CDN:`, error);
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔊 Probador de Audio - GitHub Pages CDN</h2>
      
      <div className="mb-4 p-3 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800">✅ Nuevo CDN Activo</h3>
        <p className="text-sm text-green-700">
          URL Base: <code className="bg-green-100 px-1 rounded">https://pokegenetic.github.io/pokegenetic-audio/audio/</code>
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {testSounds.map(sound => (
          <button
            key={sound}
            onClick={() => playDirectAudio(sound, 0.5)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {sound}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <button
          onClick={() => playBackgroundMusic('pokemongym', 0.1)}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          🎵 Música de Fondo: Pokémon Gym
        </button>
        
        <button
          onClick={() => playBackgroundMusic('gymbattle', 0.1)}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          🎵 Música de Fondo: Gym Battle
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">🧪 Tests Directos CDN</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => testDirectCDN('pc')}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
          >
            Test PC (CDN)
          </button>
          <button
            onClick={() => testDirectCDN('heal')}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
          >
            Test Heal (CDN)
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mt-4">
        🚀 Sistema actualizado con GitHub Pages CDN - Sin restricciones CORS
      </p>
    </div>
  );
};

export default AudioTester;
