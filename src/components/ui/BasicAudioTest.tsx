import React from 'react';

const BasicAudioTest: React.FC = () => {
    const playSound = (soundName: string) => {
        console.log(`Intentando reproducir: ${soundName}`);
        try {
            const audio = new Audio(`/${soundName}.mp3`);
            audio.volume = 0.5;
            audio.play().catch(error => {
                console.error(`Error reproduciendo ${soundName}:`, error);
                alert(`Error: ${error.message}`);
            });
        } catch (error) {
            console.error(`Error creando audio ${soundName}:`, error);
            alert(`Error creando audio: ${error}`);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#333', textAlign: 'center' }}>🔊 Probador de Audio Básico</h1>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '10px',
                marginTop: '20px'
            }}>
                <button 
                    onClick={() => playSound('notification')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    🔔 Notification
                </button>

                <button 
                    onClick={() => playSound('levelup')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    ⬆️ Level Up
                </button>

                <button 
                    onClick={() => playSound('whosthat')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    ❓ Who's That
                </button>

                <button 
                    onClick={() => playSound('victory')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    🏆 Victory
                </button>

                <button 
                    onClick={() => playSound('sfx/pokeballcatch')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    ⚾ Pokeball Catch
                </button>

                <button 
                    onClick={() => playSound('sfx/heal')}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#06b6d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    💚 Heal
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
