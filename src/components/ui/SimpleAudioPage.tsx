import React, { useState, useRef } from 'react';

const BasicAudioTest: React.FC = () => {
    const [playingAudios, setPlayingAudios] = useState<{[key: string]: HTMLAudioElement}>({});
    const [isPlaying, setIsPlaying] = useState<{[key: string]: boolean}>({});

    const toggleSound = (soundPath: string, displayName: string) => {
        console.log(`🎵 Toggle sonido: ${displayName} (${soundPath})`);
        
        // Si ya está reproduciéndose, lo detenemos
        if (playingAudios[soundPath]) {
            console.log(`⏹️ Deteniendo: ${displayName}`);
            playingAudios[soundPath].pause();
            playingAudios[soundPath].currentTime = 0;
            
            setPlayingAudios(prev => {
                const newState = { ...prev };
                delete newState[soundPath];
                return newState;
            });
            
            setIsPlaying(prev => ({ ...prev, [soundPath]: false }));
            return;
        }

        // Si no está reproduciéndose, lo iniciamos
        try {
            console.log(`▶️ Iniciando: ${displayName}`);
            const audio = new Audio(soundPath);
            audio.volume = 0.5;
            
            audio.onloadstart = () => console.log(`📥 Cargando: ${displayName}`);
            audio.oncanplay = () => console.log(`✅ Listo: ${displayName}`);
            audio.onerror = () => {
                console.error(`❌ Error cargando: ${displayName}`);
                setIsPlaying(prev => ({ ...prev, [soundPath]: false }));
                alert(`Error: ${displayName} - No se pudo cargar`);
            };
            
            audio.onended = () => {
                console.log(`🏁 Terminó: ${displayName}`);
                setPlayingAudios(prev => {
                    const newState = { ...prev };
                    delete newState[soundPath];
                    return newState;
                });
                setIsPlaying(prev => ({ ...prev, [soundPath]: false }));
            };
            
            audio.play()
                .then(() => {
                    console.log(`🔊 Reproduciendo: ${displayName}`);
                    setPlayingAudios(prev => ({ ...prev, [soundPath]: audio }));
                    setIsPlaying(prev => ({ ...prev, [soundPath]: true }));
                })
                .catch(error => {
                    console.error(`❌ Error reproduciendo: ${displayName}`, error);
                    setIsPlaying(prev => ({ ...prev, [soundPath]: false }));
                    alert(`Error reproduciendo: ${displayName} - ${error.message}`);
                });
                
        } catch (error) {
            console.error(`❌ Error creando audio: ${displayName}`, error);
            alert(`Error creando audio: ${displayName}`);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#333', textAlign: 'center' }}>🔊 Probador de Audio con Play/Stop</h1>
            
            <div style={{ 
                backgroundColor: '#f3f4f6', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
            }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>📋 Instrucciones:</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                    <li><strong>Primer clic:</strong> ▶️ Reproduce el sonido</li>
                    <li><strong>Segundo clic:</strong> ⏹️ Detiene el sonido</li>
                    <li><strong>Color azul/verde:</strong> Listo para reproducir</li>
                    <li><strong>Color rojo:</strong> Se está reproduciendo</li>
                    <li>Abre la consola (F12) para logs detallados</li>
                </ul>
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '10px',
                marginTop: '20px'
            }}>
                <button 
                    onClick={() => toggleSound('/notification.mp3', 'Notification')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/notification.mp3'] ? '#ef4444' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/notification.mp3'] ? '⏹️' : '🔔'} Notification
                </button>

                <button 
                    onClick={() => toggleSound('/sfx/levelup.mp3', 'Level Up')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/sfx/levelup.mp3'] ? '#ef4444' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/sfx/levelup.mp3'] ? '⏹️' : '⬆️'} Level Up
                </button>

                <button 
                    onClick={() => toggleSound('/sfx/whosthat.mp3', 'Who\'s That')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/sfx/whosthat.mp3'] ? '#ef4444' : '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/sfx/whosthat.mp3'] ? '⏹️' : '❓'} Who's That
                </button>

                <button 
                    onClick={() => toggleSound('/sfx/victory.mp3', 'Victory')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/sfx/victory.mp3'] ? '#ef4444' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/sfx/victory.mp3'] ? '⏹️' : '🏆'} Victory
                </button>

                <button 
                    onClick={() => toggleSound('/sfx/pokeballcatch.mp3', 'Pokeball Catch')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/sfx/pokeballcatch.mp3'] ? '#ef4444' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/sfx/pokeballcatch.mp3'] ? '⏹️' : '⚾'} Pokeball Catch
                </button>

                <button 
                    onClick={() => toggleSound('/sfx/heal.mp3', 'Heal')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/sfx/heal.mp3'] ? '#ef4444' : '#06b6d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/sfx/heal.mp3'] ? '⏹️' : '💚'} Heal
                </button>

                <button 
                    onClick={() => toggleSound('/sfx/memorice.mp3', 'Memorice')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/sfx/memorice.mp3'] ? '#ef4444' : '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/sfx/memorice.mp3'] ? '⏹️' : '🎯'} Memorice
                </button>

                <button 
                    onClick={() => toggleSound('/pokechillmusic.mp3', 'Chill Music')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/pokechillmusic.mp3'] ? '#ef4444' : '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/pokechillmusic.mp3'] ? '⏹️' : '🎵'} Chill Music
                </button>

                <button 
                    onClick={() => toggleSound('/casino.mp3', 'Casino')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/casino.mp3'] ? '#ef4444' : '#f97316',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/casino.mp3'] ? '⏹️' : '🎰'} Casino
                </button>

                <button 
                    onClick={() => toggleSound('/sfx/shiny.mp3', 'Shiny')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/sfx/shiny.mp3'] ? '#ef4444' : '#ec4899',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/sfx/shiny.mp3'] ? '⏹️' : '✨'} Shiny
                </button>

                <button 
                    onClick={() => toggleSound('/sfx/winrewards.mp3', 'Win Rewards')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: isPlaying['/sfx/winrewards.mp3'] ? '#ef4444' : '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying['/sfx/winrewards.mp3'] ? '⏹️' : '🎁'} Win Rewards
                </button>

            </div>

            {/* Botón para detener todos */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button 
                    onClick={() => {
                        console.log('🛑 Deteniendo todos los sonidos...');
                        Object.values(playingAudios).forEach(audio => {
                            audio.pause();
                            audio.currentTime = 0;
                        });
                        setPlayingAudios({});
                        setIsPlaying({});
                    }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    🛑 Detener Todos los Sonidos
                </button>
            </div>

            <div style={{ 
                marginTop: '30px', 
                padding: '15px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '5px' 
            }}>
                <h3>📋 Instrucciones:</h3>
                <ul>
                    <li>Haz clic en cada botón para probar el sonido</li>
                    <li>Abre la consola del navegador (F12) para ver logs detallados</li>
                    <li>Si aparece un error, revisa la consola para más detalles</li>
                    <li><strong>En móviles:</strong> Toca la pantalla primero para habilitar audio</li>
                </ul>
            </div>

            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#fef3c7', 
                borderRadius: '5px' 
            }}>
                <h3>🔍 Reporta los resultados:</h3>
                <p>Para cada botón, dime si:</p>
                <ul>
                    <li>✅ Se reproduce correctamente</li>
                    <li>❌ No se reproduce (revisa error en consola)</li>
                    <li>🔇 Silencio (se ejecuta pero no se oye)</li>
                </ul>
            </div>
        </div>
    );
};

export default BasicAudioTest;
