import React from 'react';

const AudioTest = () => {
    const testDirectCDN = () => {
        console.log('🧪 Testing direct CDN access...');
        const audio = new Audio('https://pokegenetic.github.io/pokegenetic-audio/audio/sfx/pc.mp3');
        audio.volume = 0.5;
        audio.play()
            .then(() => {
                console.log('✅ Direct CDN test successful');
            })
            .catch(error => {
                console.error('❌ Direct CDN test failed:', error);
            });
    };

    const testLocalImport = () => {
        console.log('🧪 Testing local import...');
        // Test the same pattern as whosthat
        import('../../sounds/sfx/pc.mp3').then(audioModule => {
            const audio = new Audio(audioModule.default);
            audio.volume = 0.5;
            audio.play()
                .then(() => {
                    console.log('✅ Local import test successful');
                })
                .catch(error => {
                    console.error('❌ Local import test failed:', error);
                });
        }).catch(error => {
            console.error('❌ Local import module failed:', error);
        });
    };

    const testSystemFunction = async () => {
        console.log('🧪 Testing system function...');
        try {
            const { playDirectAudio } = await import('../../lib/soundEffects');
            const result = playDirectAudio('pc', 0.5, false);
            if (result) {
                console.log('✅ System function test successful');
            } else {
                console.log('❌ System function returned null');
            }
        } catch (error) {
            console.error('❌ System function test failed:', error);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
            <h3>🔊 Audio Debug Test</h3>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button onClick={testDirectCDN} style={{ padding: '10px', backgroundColor: '#blue', color: 'white' }}>
                    Test Direct CDN
                </button>
                <button onClick={testLocalImport} style={{ padding: '10px', backgroundColor: '#green', color: 'white' }}>
                    Test Local Import
                </button>
                <button onClick={testSystemFunction} style={{ padding: '10px', backgroundColor: '#orange', color: 'white' }}>
                    Test System Function
                </button>
            </div>
            <p style={{ fontSize: '12px', marginTop: '10px' }}>
                Abre las Developer Tools (F12) para ver los logs de cada test
            </p>
        </div>
    );
};

export default AudioTest;
