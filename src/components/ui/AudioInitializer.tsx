import React, { useState, useEffect } from 'react';
import { isAudioReady, forceAudioInitialization, getPendingAudioCount } from '../../lib/soundEffects';

interface AudioInitializerProps {
  className?: string;
  showWhenReady?: boolean; // Si debe mostrarse cuando el audio ya está listo
  autoHide?: boolean; // Si debe ocultarse automáticamente tras inicializar
  style?: React.CSSProperties;
}

const AudioInitializer: React.FC<AudioInitializerProps> = ({ 
  className = '', 
  showWhenReady = false,
  autoHide = true,
  style = {}
}) => {
  const [audioReady, setAudioReady] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Verificar estado inicial
    const checkAudioStatus = () => {
      const ready = isAudioReady();
      const pending = getPendingAudioCount();
      
      setAudioReady(ready);
      setPendingCount(pending);
      
      // Auto-ocultar si el audio está listo y autoHide está activado
      if (ready && autoHide) {
        setTimeout(() => setIsVisible(false), 2000);
      }
    };

    // Verificar inmediatamente
    checkAudioStatus();

    // Verificar periódicamente
    const interval = setInterval(checkAudioStatus, 1000);

    return () => clearInterval(interval);
  }, [autoHide]);

  const handleActivateAudio = async () => {
    setIsInitializing(true);
    
    try {
      const success = await forceAudioInitialization();
      
      if (success) {
        setAudioReady(true);
        setPendingCount(0);
        
        // Auto-ocultar después de éxito
        if (autoHide) {
          setTimeout(() => setIsVisible(false), 2000);
        }
      }
    } catch (error) {
      console.error('Error inicializando audio:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // No mostrar si el audio está listo y showWhenReady es false
  if (audioReady && !showWhenReady && autoHide) {
    return null;
  }

  // No mostrar si se configuró para ocultarse
  if (!isVisible) {
    return null;
  }

  const baseStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    backgroundColor: audioReady ? '#22c55e' : '#f59e0b',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: audioReady ? 'default' : 'pointer',
    transition: 'all 0.3s ease',
    maxWidth: '280px',
    ...style
  };

  const spinnerStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <>
      {/* CSS para la animación */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div 
        className={`audio-initializer ${className}`}
        style={baseStyles}
        onClick={!audioReady ? handleActivateAudio : undefined}
      >
        {/* Icono de audio */}
        <div style={{ fontSize: '16px' }}>
          {audioReady ? '🔊' : '🔇'}
        </div>
        
        {/* Contenido del mensaje */}
        <div style={{ flex: 1 }}>
          {audioReady ? (
            <div>
              <div>✅ Audio activado</div>
              {showWhenReady && (
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  Sistema de sonido funcionando correctamente
                </div>
              )}
            </div>
          ) : (
            <div>
              <div>
                {isInitializing ? '🔄 Activando audio...' : '🎵 Activar sonidos'}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                {pendingCount > 0 
                  ? `${pendingCount} sonidos pendientes` 
                  : 'Toca para habilitar audio'
                }
              </div>
            </div>
          )}
        </div>
        
        {/* Indicador de carga */}
        {isInitializing && <div style={spinnerStyles} />}
      </div>
    </>
  );
};

export default AudioInitializer;
