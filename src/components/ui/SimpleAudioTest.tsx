import React, { useState } from 'react';

const SimpleAudioTest: React.FC = () => {
    const [result, setResult] = useState<string>('');

    const testSound = async () => {
        console.log('🧪 Probando sonido...');
        setResult('🧪 Probando...');
        
        try {
            // Probar un sonido simple
            const audio = new Audio('https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/whosthat.mp3');
            audio.volume = 0.3;
            
            audio.addEventListener('canplay', () => {
                console.log('✅ Audio cargado correctamente');
                setResult('✅ Audio cargado - presiona play');
            });
            
            audio.addEventListener('error', (e) => {
                console.error('❌ Error cargando audio:', e);
                setResult('❌ Error cargando el audio');
            });
            
            await audio.play();
            setResult('✅ ¡Sonido reproducido exitosamente!');
            
            // Parar después de 2 segundos
            setTimeout(() => {
                audio.pause();
                setResult('✅ Reproducción completada');
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error:', error);
            setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    🔊 Probador de Audio Simple
                </h1>
                
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <p className="text-lg text-gray-600 mb-6">
                        Haz clic en el botón para probar si el audio funciona:
                    </p>
                    
                    <button 
                        onClick={testSound}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
                    >
                        🎵 Probar Sonido
                    </button>
                    
                    {result && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-lg font-medium">{result}</p>
                        </div>
                    )}
                    
                    <div className="mt-8 text-sm text-gray-500">
                        <p>
                            <strong>Consejo:</strong> Abre las DevTools (F12) para ver logs detallados
                        </p>
                        <p className="mt-2">
                            Si no funciona en móvil, asegúrate de haber interactuado con la página primero.
                        </p>
                    </div>
                </div>

                <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">🧪 Tests Adicionales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            onClick={() => {
                                const audio = new Audio('https://pokegenetic.github.io/pokegenetic-audio/audio/notification.mp3');
                                audio.volume = 0.3;
                                audio.play().catch(e => console.error('Error notification:', e));
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
                        >
                            🔔 Notification
                        </button>
                        
                        <button 
                            onClick={() => {
                                const audio = new Audio('https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pokeballcatch.mp3');
                                audio.volume = 0.3;
                                audio.play().catch(e => console.error('Error pokeball:', e));
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
                        >
                            ⚾ Pokeball Catch
                        </button>
                        
                        <button 
                            onClick={() => {
                                const audio = new Audio('/sfx/levelup.mp3');
                                audio.volume = 0.3;
                                audio.play().catch(e => console.error('Error local:', e));
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg"
                        >
                            ⬆️ Level Up (Local)
                        </button>
                        
                        <button 
                            onClick={async () => {
                                try {
                                    const { playSoundEffect } = await import('../../lib/soundEffects');
                                    playSoundEffect('whosthat', 0.5, false);
                                } catch (e) {
                                    console.error('Error sistema:', e);
                                }
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg"
                        >
                            🎯 Sistema (Who's That)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleAudioTest;
