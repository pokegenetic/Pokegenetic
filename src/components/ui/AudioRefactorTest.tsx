import React from 'react';
import { 
    playSoundEffect, 
    playPokemonCatchMusic, 
    playPokemonCatchSuccess, 
    stopPokemonCatchMusic,
    getAvailableSounds 
} from '@/lib/soundEffects';

const AudioRefactorTest: React.FC = () => {
    const [catchMusicRef, setCatchMusicRef] = React.useState<HTMLAudioElement | null>(null);
    const availableSounds = getAvailableSounds();

    const testPokemonCatchFlow = () => {
        console.log('🎮 Testing Pokemon Catch Flow...');
        
        // 1. Iniciar música de captura
        const music = playPokemonCatchMusic(0.3);
        setCatchMusicRef(music);
        console.log('🎵 Música de captura iniciada');
        
        // 2. Simular captura exitosa después de 3 segundos
        setTimeout(() => {
            console.log('✅ Simulando captura exitosa...');
            playPokemonCatchSuccess(0.7);
            
            // 3. Detener música después del efecto
            setTimeout(() => {
                stopPokemonCatchMusic(music);
                setCatchMusicRef(null);
                console.log('⏹️ Música detenida');
            }, 1000);
            
        }, 3000);
    };

    const stopCurrentMusic = () => {
        if (catchMusicRef) {
            stopPokemonCatchMusic(catchMusicRef);
            setCatchMusicRef(null);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#333', textAlign: 'center' }}>🔊 Test Sistema de Audio Refactorizado</h1>
            
            <div style={{ 
                backgroundColor: '#f0f9ff', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '2px solid #0ea5e9'
            }}>
                <h3>🎮 Test Flujo Pokémon Catch</h3>
                <p>Este test simula el flujo completo de captura:</p>
                <ol>
                    <li>🎵 Inicia música de captura (catchmusicgo.mp3)</li>
                    <li>⏱️ Espera 3 segundos</li>
                    <li>✅ Reproduce efecto de captura exitosa (catchedgo.mp3)</li>
                    <li>⏹️ Detiene la música de fondo</li>
                </ol>
                
                <div style={{ marginTop: '15px' }}>
                    <button
                        onClick={testPokemonCatchFlow}
                        style={{
                            backgroundColor: '#0ea5e9',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '6px',
                            marginRight: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        🎮 Probar Flujo Pokémon Catch
                    </button>
                    
                    <button
                        onClick={stopCurrentMusic}
                        disabled={!catchMusicRef}
                        style={{
                            backgroundColor: catchMusicRef ? '#ef4444' : '#9ca3af',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: catchMusicRef ? 'pointer' : 'not-allowed'
                        }}
                    >
                        ⏹️ Detener Música
                    </button>
                </div>
            </div>

            <div style={{ 
                backgroundColor: '#f0fdf4', 
                padding: '20px', 
                borderRadius: '8px',
                border: '2px solid #22c55e'
            }}>
                <h3>✨ Funciones Helper Disponibles</h3>
                <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <button
                        onClick={() => playPokemonCatchMusic(0.3)}
                        style={{
                            backgroundColor: '#22c55e',
                            color: 'white',
                            padding: '10px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🎵 playPokemonCatchMusic()
                    </button>
                    
                    <button
                        onClick={() => playPokemonCatchSuccess(0.7)}
                        style={{
                            backgroundColor: '#eab308',
                            color: 'white',
                            padding: '10px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        ✅ playPokemonCatchSuccess()
                    </button>
                    
                    <button
                        onClick={() => playSoundEffect('notification', 0.5)}
                        style={{
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            padding: '10px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🔔 playSoundEffect('notification')
                    </button>
                </div>
            </div>

            <div style={{ 
                backgroundColor: '#fefce8', 
                padding: '15px', 
                borderRadius: '8px',
                marginTop: '20px'
            }}>
                <h4>📋 Sonidos Disponibles: {availableSounds.length}</h4>
                <p style={{ fontSize: '14px', color: '#65a30d' }}>
                    Todos usando rutas locales como fuente primaria con fallback automático a CDN.
                </p>
            </div>

            <div style={{ 
                backgroundColor: '#f3f4f6', 
                padding: '15px', 
                borderRadius: '8px',
                marginTop: '20px'
            }}>
                <h4>🔍 Instrucciones:</h4>
                <ul style={{ margin: 0, color: '#374151' }}>
                    <li>Abre la consola (F12) para ver logs detallados</li>
                    <li>El test usa archivos locales primero, CDN como fallback</li>
                    <li>Verifica que no hay errores CORS</li>
                    <li><strong>pokemoncatch</strong> ahora usa <code>catchmusicgo.mp3</code></li>
                    <li><strong>Captura exitosa</strong> usa <code>catchedgo.mp3</code></li>
                </ul>
            </div>
        </div>
    );
};

export default AudioRefactorTest;
