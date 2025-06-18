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

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔊 Probador de Audio Dropbox</h2>
      
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

      <div className="space-y-3">
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
      
      <p className="text-sm text-gray-600 mt-4">
        ⚠️ Este probador usa el patrón directo de pokemoncatch con URLs de Dropbox
      </p>
    </div>
  );
};

export default AudioTester;
