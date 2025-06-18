import React, { useState } from 'react';

interface TestResults {
    [key: string]: string;
}

interface PlayingState {
    [key: string]: boolean;
}

interface Sound {
    id: string;
    name: string;
    category: string;
}

interface GroupedSounds {
    [category: string]: Sound[];
}

const AudioDebugPage: React.FC = () => {
    const [testResults, setTestResults] = useState<TestResults>({});
    const [isPlaying, setIsPlaying] = useState<PlayingState>({});

    // Lista completa de todos los sonidos de la app
    const allSounds: Sound[] = [
        // Efectos de PC
        { id: 'pc', name: 'PC Sound', category: 'PC' },
        
        // Efectos de Pokéball
        { id: 'pokeballcatch', name: 'Pokeball Catch', category: 'Pokeball' },
        { id: 'pokeballthrow', name: 'Pokeball Throw', category: 'Pokeball' },
        { id: 'pokeballexplode', name: 'Pokeball Explode', category: 'Pokeball' },
        { id: 'pokeballwait', name: 'Pokeball Wait', category: 'Pokeball' },
        { id: 'pokeballreturn', name: 'Pokeball Return', category: 'Pokeball' },
        { id: 'pokeballopen', name: 'Pokeball Open', category: 'Pokeball' },
        { id: 'pokeballwaiting', name: 'Pokeball Waiting', category: 'Pokeball' },
        { id: 'pokeballthrowmasterball', name: 'Masterball Throw', category: 'Pokeball' },
        
        // Música de captura
        { id: 'catchmusic', name: 'Catch Music', category: 'Capture' },
        { id: 'catchmusicgo', name: 'Catch Music Go', category: 'Capture' },
        { id: 'catchedgo', name: 'Catched Go', category: 'Capture' },
        
        // Efectos especiales
        { id: 'superpower', name: 'Super Power', category: 'Special' },
        { id: 'heal', name: 'Heal', category: 'Special' },
        { id: 'levelup', name: 'Level Up', category: 'Special' },
        { id: 'shiny', name: 'Shiny', category: 'Special' },
        { id: 'victory', name: 'Victory', category: 'Special' },
        { id: 'win', name: 'Win', category: 'Special' },
        
        // Efectos de notificación
        { id: 'notification', name: 'Notification', category: 'UI' },
        { id: 'pop', name: 'Pop', category: 'UI' },
        
        // Música de fondo
        { id: 'pokechillmusic', name: 'Poke Chill Music', category: 'Background' },
        { id: 'pokemongym', name: 'Pokemon Gym', category: 'Background' },
        { id: 'wintrainer', name: 'Win Trainer', category: 'Background' },
        { id: 'gymbattle', name: 'Gym Battle', category: 'Background' },
        { id: 'trainerbattle', name: 'Trainer Battle', category: 'Background' },
        { id: 'wingym', name: 'Win Gym', category: 'Background' },
        { id: 'obtainbadge', name: 'Obtain Badge', category: 'Background' },
        { id: 'casino', name: 'Casino', category: 'Background' },
        
        // Juegos específicos
        { id: 'memorice', name: 'Memorice', category: 'Games' },
        { id: 'whosthat', name: 'Whos That Pokemon', category: 'Games' },
        { id: 'winrewards', name: 'Win Rewards', category: 'Games' },
        { id: 'misterygift', name: 'Mystery Gift', category: 'Games' },
        { id: 'slot', name: 'Slot', category: 'Games' },
        { id: 'nothing', name: 'Nothing', category: 'Games' },
        
        // Error
        { id: 'error', name: 'Error Sound', category: 'UI' }
    ];

    // URLs de prueba directa
    const testUrls = {
        github: (soundId: string): string => {
            const sfxSounds = ['pc', 'pokeballcatch', 'pokeballthrow', 'pokeballexplode', 'pokeballwait', 'pokeballreturn', 'pokeballopen', 'pokeballwaiting', 'pokeballthrowmasterball', 'catchmusic', 'catchedgo', 'superpower', 'heal', 'levelup', 'shiny', 'victory', 'win', 'memorice', 'whosthat', 'winrewards', 'misterygift', 'slot', 'nothing'];
            const path = sfxSounds.includes(soundId) ? 'sfx/' : '';
            const ext = soundId === 'superpower' || soundId === 'slot' ? 'wav' : 'mp3';
            return `https://pokegenetic.github.io/pokegenetic-audio/audio/${path}${soundId}.${ext}`;
        },
        pokemonShowdown: (soundId: string): string | null => {
            if (soundId === 'notification') return 'https://play.pokemonshowdown.com/audio/notification.wav';
            return null;
        },
        local: (soundId: string): string => {
            const sfxSounds = ['pc', 'pokeballcatch', 'pokeballthrow', 'pokeballexplode', 'pokeballwait', 'pokeballreturn', 'pokeballopen', 'pokeballwaiting', 'pokeballthrowmasterball', 'catchmusic', 'catchedgo', 'superpower', 'heal', 'levelup', 'shiny', 'victory', 'win', 'memorice', 'whosthat', 'winrewards', 'misterygift', 'slot', 'nothing'];
            const path = sfxSounds.includes(soundId) ? 'sfx/' : '';
            const ext = soundId === 'superpower' || soundId === 'slot' ? 'wav' : 'mp3';
            return `/${path}${soundId}.${ext}`;
        }
    };

    const testSound = async (soundId: string, method: string, url: string | null = null): Promise<void> => {
        const key = `${soundId}-${method}`;
        setIsPlaying(prev => ({ ...prev, [key]: true }));
        
        try {
            let audioUrl: string | null = null;
            
            if (method === 'system') {
                // Usar nuestro sistema
                const { playSoundEffect } = await import('../../lib/soundEffects');
                const result = playSoundEffect(soundId, 0.5, false);
                setTestResults(prev => ({ 
                    ...prev, 
                    [key]: result ? '✅ Éxito (Sistema)' : '❌ Falló (Sistema retornó null)' 
                }));
                setTimeout(() => setIsPlaying(prev => ({ ...prev, [key]: false })), 1000);
                return;
            } else if (method === 'direct' && url) {
                audioUrl = url;
            } else {
                const urlGenerator = testUrls[method as keyof typeof testUrls];
                if (urlGenerator) {
                    audioUrl = urlGenerator(soundId);
                }
            }
            
            if (!audioUrl) {
                setTestResults(prev => ({ ...prev, [key]: '❌ URL no disponible' }));
                setIsPlaying(prev => ({ ...prev, [key]: false }));
                return;
            }
            
            console.log(`🧪 Testing ${soundId} with ${method}: ${audioUrl}`);
            
            const audio = new Audio(audioUrl);
            audio.volume = 0.3;
            
            audio.addEventListener('loadstart', () => {
                console.log(`📥 ${soundId}-${method}: Comenzó a cargar`);
            });
            
            audio.addEventListener('canplay', () => {
                console.log(`✅ ${soundId}-${method}: Puede reproducirse`);
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`❌ ${soundId}-${method}: Error de carga`, e);
                const errorMessage = (e.target as HTMLAudioElement)?.error?.message || 'Unknown error';
                setTestResults(prev => ({ ...prev, [key]: `❌ Error: ${errorMessage}` }));
                setIsPlaying(prev => ({ ...prev, [key]: false }));
            });
            
            audio.addEventListener('ended', () => {
                setIsPlaying(prev => ({ ...prev, [key]: false }));
            });
            
            await audio.play();
            setTestResults(prev => ({ ...prev, [key]: '✅ Éxito' }));
            
            // Auto-stop después de 2 segundos para sonidos largos
            setTimeout(() => {
                audio.pause();
                setIsPlaying(prev => ({ ...prev, [key]: false }));
            }, 2000);
            
        } catch (error) {
            console.error(`❌ ${soundId}-${method}: Error`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setTestResults(prev => ({ 
                ...prev, 
                [key]: `❌ Error: ${errorMessage}` 
            }));
            setIsPlaying(prev => ({ ...prev, [key]: false }));
        }
    };

    const groupedSounds: GroupedSounds = allSounds.reduce((acc: GroupedSounds, sound: Sound) => {
        if (!acc[sound.category]) acc[sound.category] = [];
        acc[sound.category].push(sound);
        return acc;
    }, {});

    const getButtonColor = (result: string | undefined): string => {
        if (!result) return 'bg-gray-300';
        if (result.includes('✅')) return 'bg-green-500';
        if (result.includes('❌')) return 'bg-red-500';
        return 'bg-gray-300';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-6">🔊 Probador de Audio - Liga Pokémon</h1>
                
                <div className="bg-white rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">📋 Instrucciones</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-blue-600">Métodos de Prueba:</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Sistema:</strong> Usa nuestro sistema de soundEffects</li>
                                <li><strong>GitHub:</strong> Directo desde nuestro CDN</li>
                                <li><strong>PS:</strong> Desde Pokémon Showdown (solo algunos)</li>
                                <li><strong>Local:</strong> Desde archivos locales</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-600">Estados:</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li><span className="text-green-600">✅ Éxito:</span> Se reprodujo correctamente</li>
                                <li><span className="text-red-600">❌ Error:</span> Falló al reproducir</li>
                                <li><span className="text-gray-600">Sin probar:</span> No se ha probado aún</li>
                            </ul>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                        <strong>Nota:</strong> Abre las DevTools (F12) para ver logs detallados de cada prueba.
                    </p>
                </div>

                {Object.entries(groupedSounds).map(([category, sounds]) => (
                    <div key={category} className="bg-white rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            {category} ({sounds.length} sonidos)
                        </h2>
                        
                        <div className="space-y-4">
                            {sounds.map((sound: Sound) => (
                                <div key={sound.id} className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-3">{sound.name} ({sound.id})</h3>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {/* Botón Sistema */}
                                        <button
                                            onClick={() => testSound(sound.id, 'system')}
                                            disabled={isPlaying[`${sound.id}-system`]}
                                            className={`px-3 py-2 rounded text-white text-sm font-medium transition-colors ${
                                                isPlaying[`${sound.id}-system`] 
                                                    ? 'bg-yellow-500' 
                                                    : getButtonColor(testResults[`${sound.id}-system`])
                                            }`}
                                        >
                                            {isPlaying[`${sound.id}-system`] ? '⏳' : '🔧'} Sistema
                                        </button>

                                        {/* Botón GitHub CDN */}
                                        <button
                                            onClick={() => testSound(sound.id, 'github')}
                                            disabled={isPlaying[`${sound.id}-github`]}
                                            className={`px-3 py-2 rounded text-white text-sm font-medium transition-colors ${
                                                isPlaying[`${sound.id}-github`] 
                                                    ? 'bg-yellow-500' 
                                                    : getButtonColor(testResults[`${sound.id}-github`])
                                            }`}
                                        >
                                            {isPlaying[`${sound.id}-github`] ? '⏳' : '🌐'} GitHub
                                        </button>

                                        {/* Botón Pokémon Showdown */}
                                        <button
                                            onClick={() => testSound(sound.id, 'pokemonShowdown')}
                                            disabled={isPlaying[`${sound.id}-pokemonShowdown`] || !testUrls.pokemonShowdown(sound.id)}
                                            className={`px-3 py-2 rounded text-white text-sm font-medium transition-colors ${
                                                !testUrls.pokemonShowdown(sound.id)
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : isPlaying[`${sound.id}-pokemonShowdown`] 
                                                        ? 'bg-yellow-500' 
                                                        : getButtonColor(testResults[`${sound.id}-pokemonShowdown`])
                                            }`}
                                        >
                                            {isPlaying[`${sound.id}-pokemonShowdown`] ? '⏳' : '⚡'} PS
                                        </button>

                                        {/* Botón Local */}
                                        <button
                                            onClick={() => testSound(sound.id, 'local')}
                                            disabled={isPlaying[`${sound.id}-local`]}
                                            className={`px-3 py-2 rounded text-white text-sm font-medium transition-colors ${
                                                isPlaying[`${sound.id}-local`] 
                                                    ? 'bg-yellow-500' 
                                                    : getButtonColor(testResults[`${sound.id}-local`])
                                            }`}
                                        >
                                            {isPlaying[`${sound.id}-local`] ? '⏳' : '📁'} Local
                                        </button>
                                    </div>

                                    {/* Resultados */}
                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                        <div className="text-center">
                                            {testResults[`${sound.id}-system`] || '🔘 Sin probar'}
                                        </div>
                                        <div className="text-center">
                                            {testResults[`${sound.id}-github`] || '🔘 Sin probar'}
                                        </div>
                                        <div className="text-center">
                                            {testResults[`${sound.id}-pokemonShowdown`] || (!testUrls.pokemonShowdown(sound.id) ? '🚫 No disponible' : '🔘 Sin probar')}
                                        </div>
                                        <div className="text-center">
                                            {testResults[`${sound.id}-local`] || '🔘 Sin probar'}
                                        </div>
                                    </div>

                                    {/* URLs para referencia */}
                                    <details className="mt-2">
                                        <summary className="text-xs text-gray-500 cursor-pointer">Ver URLs</summary>
                                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                                            <div><strong>GitHub:</strong> {testUrls.github(sound.id)}</div>
                                            <div><strong>PS:</strong> {testUrls.pokemonShowdown(sound.id) || 'No disponible'}</div>
                                            <div><strong>Local:</strong> {testUrls.local(sound.id)}</div>
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Resumen de resultados */}
                <div className="bg-white rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">📊 Resumen de Resultados</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {['system', 'github', 'pokemonShowdown', 'local'].map(method => {
                            const results = Object.entries(testResults).filter(([key]) => key.includes(`-${method}`));
                            const success = results.filter(([, result]) => result.includes('✅')).length;
                            const failed = results.filter(([, result]) => result.includes('❌')).length;
                            const total = results.length;
                            
                            return (
                                <div key={method} className="bg-gray-50 p-3 rounded">
                                    <h3 className="font-semibold capitalize">{method}</h3>
                                    <div className="text-sm">
                                        <div className="text-green-600">✅ {success}</div>
                                        <div className="text-red-600">❌ {failed}</div>
                                        <div className="text-gray-500">Total: {total}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioDebugPage;
