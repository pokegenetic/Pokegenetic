import React from 'react';

const SimpleAudioPage: React.FC = () => {
    const testAudio = (soundPath: string): void => {
        console.log('🎵 Probando sonido:', soundPath);
        
        try {
            const audio = new Audio(soundPath);
            audio.volume = 0.5;
            
            audio.onloadstart = () => console.log('📥 Cargando:', soundPath);
            audio.oncanplay = () => console.log('✅ Listo para reproducir:', soundPath);
            audio.onerror = () => {
                console.error('❌ Error cargando:', soundPath);
                alert(`Error: ${soundPath} - No se pudo cargar el archivo`);
            };
            
            audio.play()
                .then(() => console.log('🔊 Reproduciendo:', soundPath))
                .catch(error => {
                    console.error('❌ Error reproduciendo:', soundPath, error);
                    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
                    alert(`Error reproduciendo: ${soundPath} - ${errorMsg}`);
                });
                
        } catch (error) {
            console.error('❌ Error creando audio:', error);
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
            alert(`Error creando audio: ${errorMsg}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    🔊 Probador de Audio Completo - Liga Pokémon
                </h1>
                
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">📋 Instrucciones - 32 Sonidos</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Abre la consola del navegador (F12) para ver logs detallados</li>
                        <li>Haz clic en cada botón para probar el sonido</li>
                        <li><strong>En móviles:</strong> Toca la pantalla primero para habilitar audio</li>
                        <li>Reporta qué sonidos funcionan y cuáles no por dispositivo</li>
                        <li>Los colores agrupan por categoría: UI, Pokéball, Música, Juegos</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    
                    {/* Efectos de UI */}
                    <button 
                        onClick={() => testAudio('/notification.mp3')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🔔 Notification
                    </button>

                    <button 
                        onClick={() => testAudio('/whosthat.mp3')}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        ❓ Who's That
                    </button>

                    <button 
                        onClick={() => testAudio('/victory.mp3')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🏆 Victory
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/pc.mp3')}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        💻 PC Sound
                    </button>

                    {/* Efectos de Pokéball */}
                    <button 
                        onClick={() => testAudio('/sfx/pokeballcatch.mp3')}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        ⚾ Pokeball Catch
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/pokeballthrow.mp3')}
                        className="bg-red-400 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🎯 Pokeball Throw
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/pokeballexplode.mp3')}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        💥 Pokeball Explode
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/pokeballwait.mp3')}
                        className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        ⏳ Pokeball Wait
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/pokeballreturn.mp3')}
                        className="bg-red-300 hover:bg-red-400 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🔄 Pokeball Return
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/pokeballopen.mp3')}
                        className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        📂 Pokeball Open
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/pokeballwaiting.mp3')}
                        className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        ⌛ Pokeball Waiting
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/pokeballthrowmasterball.mp3')}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🟣 Masterball Throw
                    </button>

                    {/* Efectos de captura */}
                    <button 
                        onClick={() => testAudio('/sfx/catchmusic.mp3')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🎵 Catch Music
                    </button>

                    <button 
                        onClick={() => testAudio('/catchmusicgo.mp3')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🎶 Catch Music Go
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/catchedgo.mp3')}
                        className="bg-green-400 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        ✅ Catched Go
                    </button>

                    {/* Efectos especiales */}
                    <button 
                        onClick={() => testAudio('/sfx/levelup.mp3')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        ⬆️ Level Up
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/heal.mp3')}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        💚 Heal
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/shiny.mp3')}
                        className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        ✨ Shiny
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/superpower.wav')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        ⚡ Super Power
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/win.mp3')}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🏆 Win
                    </button>

                    {/* Música de fondo */}
                    <button 
                        onClick={() => testAudio('/pokechillmusic.mp3')}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🎵 Chill Music
                    </button>

                    <button 
                        onClick={() => testAudio('/pokemongym.mp3')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🏟️ Pokemon Gym
                    </button>

                    <button 
                        onClick={() => testAudio('/wintrainer.mp3')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🎯 Win Trainer
                    </button>

                    <button 
                        onClick={() => testAudio('/gymbattle.mp3')}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        ⚔️ Gym Battle
                    </button>

                    <button 
                        onClick={() => testAudio('/trainerbattle.mp3')}
                        className="bg-red-700 hover:bg-red-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🥊 Trainer Battle
                    </button>

                    <button 
                        onClick={() => testAudio('/wingym.mp3')}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🏆 Win Gym
                    </button>

                    <button 
                        onClick={() => testAudio('/obtainbadge.mp3')}
                        className="bg-yellow-700 hover:bg-yellow-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🏅 Obtain Badge
                    </button>

                    <button 
                        onClick={() => testAudio('/casino.mp3')}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🎰 Casino
                    </button>

                    {/* Juegos específicos */}
                    <button 
                        onClick={() => testAudio('/memorice.mp3')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🧠 Memorice
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/winrewards.mp3')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🎁 Win Rewards
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/misterygift.mp3')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🎀 Mystery Gift
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/slot.wav')}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🎰 Slot
                    </button>

                    <button 
                        onClick={() => testAudio('/sfx/nothing.mp3')}
                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                        🔇 Nothing
                    </button>

                </div>

                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        🔍 ¿Qué reportar?
                    </h3>
                    <div className="text-yellow-700 space-y-1">
                        <p><strong>✅ Funciona:</strong> Se reproduce correctamente</p>
                        <p><strong>❌ Error:</strong> Aparece mensaje de error</p>
                        <p><strong>🔇 Silencio:</strong> No hay error pero tampoco sonido</p>
                        <p><strong>📱 Móvil:</strong> Menciona si es móvil o desktop</p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    >
                        🔄 Recargar Página
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimpleAudioPage;
