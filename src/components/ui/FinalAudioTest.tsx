import React, { useState, useRef } from 'react';
import { 
    playPokemonCatchMusic, 
    playPokemonCatchSuccess, 
    stopPokemonCatchMusic,
    playLigaPokemonMusic,
    stopLigaPokemonMusic,
    playSoundEffect 
} from '@/lib/soundEffects';

const FinalAudioTest: React.FC = () => {
    const [catchMusicRef, setCatchMusicRef] = useState<HTMLAudioElement | null>(null);
    const [ligaMusicRef, setLigaMusicRef] = useState<HTMLAudioElement | null>(null);
    const [log, setLog] = useState<string[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    };

    const testPokemonCatchFlow = () => {
        addLog('🎯 Iniciando flujo completo Pokémon Catch...');
        
        // 1. Iniciar música de captura (catchmusicgo)
        const music = playPokemonCatchMusic(0.1);
        if (music) {
            setCatchMusicRef(music);
            addLog('✅ Música de captura iniciada (catchmusicgo)');
        } else {
            addLog('❌ Error al iniciar música de captura');
        }

        // 2. Simular captura exitosa después de 3 seconds
        setTimeout(() => {
            // Detener música de fondo
            if (music) {
                stopPokemonCatchMusic(music);
                setCatchMusicRef(null);
                addLog('⏹️ Música de captura detenida');
            }

            // Reproducir sonido de captura exitosa
            playPokemonCatchSuccess(0.8);
            addLog('🎉 Sonido de captura exitosa (catchedgo)');
        }, 3000);
    };

    const testLigaPokemonFlow = () => {
        addLog('🏟️ Iniciando flujo Liga Pokémon...');
        
        const music = playLigaPokemonMusic(0.1);
        if (music) {
            setLigaMusicRef(music);
            addLog('✅ Música de Liga Pokémon iniciada (pokemongym)');
        } else {
            addLog('❌ Error al iniciar música de Liga Pokémon');
        }
    };

    const stopAllMusic = () => {
        if (catchMusicRef) {
            stopPokemonCatchMusic(catchMusicRef);
            setCatchMusicRef(null);
            addLog('⏹️ Música de captura detenida');
        }
        if (ligaMusicRef) {
            stopLigaPokemonMusic(ligaMusicRef);
            setLigaMusicRef(null);
            addLog('⏹️ Música de Liga Pokémon detenida');
        }
        addLog('🛑 Toda la música detenida');
    };

    const testIndividualSounds = [
        { name: 'catchmusicgo', label: '🎵 Música Captura (catchmusicgo)' },
        { name: 'catchedgo', label: '🎉 Captura Exitosa (catchedgo)' },
        { name: 'pokemongym', label: '🏟️ Música Gimnasio (pokemongym)' },
        { name: 'gymbattle', label: '⚔️ Batalla Gimnasio (gymbattle)' },
        { name: 'trainerbattle', label: '👤 Batalla Entrenador (trainerbattle)' },
        { name: 'wingym', label: '🏆 Victoria Gimnasio (wingym)' },
        { name: 'wintrainer', label: '🎖️ Victoria Entrenador (wintrainer)' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        🎵 Test Final del Sistema de Audio
                    </h1>
                    <p className="text-gray-300">
                        Prueba los flujos completos de audio para Pokémon Catch y Liga Pokémon
                    </p>
                </div>

                {/* Flujos completos */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            🎯 Pokémon Catch Flow
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={testPokemonCatchFlow}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                            >
                                Iniciar Flujo Captura Completo
                            </button>
                            <p className="text-sm text-gray-300">
                                Reproduce catchmusicgo → Simula captura → Reproduce catchedgo
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            🏟️ Liga Pokémon Flow
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={testLigaPokemonFlow}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                            >
                                Iniciar Música Liga Pokémon
                            </button>
                            <p className="text-sm text-gray-300">
                                Reproduce pokemongym (música de fondo del gimnasio)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Control global */}
                <div className="text-center mb-8">
                    <button
                        onClick={stopAllMusic}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                    >
                        🛑 Detener Toda la Música
                    </button>
                </div>

                {/* Sonidos individuales */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        🎮 Sonidos Individuales
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {testIndividualSounds.map((sound) => (
                            <button
                                key={sound.name}
                                onClick={() => {
                                    playSoundEffect(sound.name, 0.5);
                                    addLog(`🔊 Reproduciendo: ${sound.name}`);
                                }}
                                className="bg-purple-600/50 hover:bg-purple-600/70 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                            >
                                {sound.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Log de actividad */}
                <div className="bg-black/50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                        📋 Log de Actividad
                    </h3>
                    <div className="bg-gray-900 rounded p-4 max-h-60 overflow-y-auto">
                        {log.length === 0 ? (
                            <p className="text-gray-400">No hay actividad aún...</p>
                        ) : (
                            log.map((entry, index) => (
                                <div key={index} className="text-green-400 text-sm font-mono mb-1">
                                    {entry}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Estado actual */}
                <div className="mt-6 text-center">
                    <div className="inline-flex gap-4 text-sm">
                        <span className={`px-3 py-1 rounded ${catchMusicRef ? 'bg-green-600' : 'bg-gray-600'} text-white`}>
                            Música Captura: {catchMusicRef ? 'ON' : 'OFF'}
                        </span>
                        <span className={`px-3 py-1 rounded ${ligaMusicRef ? 'bg-blue-600' : 'bg-gray-600'} text-white`}>
                            Música Liga: {ligaMusicRef ? 'ON' : 'OFF'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalAudioTest;
