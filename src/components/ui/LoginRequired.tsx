import React from 'react';
import { User, Lock } from 'lucide-react';

interface LoginRequiredProps {
  feature: string;
  onLogin: () => void;
}

const LoginRequired: React.FC<LoginRequiredProps> = ({ feature, onLogin }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '40px 20px',
      textAlign: 'center',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        backgroundColor: '#fef3c7',
        borderRadius: '50%',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <Lock size={40} style={{ color: '#d97706' }} />
      </div>
      
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '12px'
      }}>
        Inicia Sesión Requerido
      </h2>
      
      <p style={{
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '8px',
        maxWidth: '400px'
      }}>
        Para usar <strong>{feature}</strong>, necesitas iniciar sesión para que podamos guardar tu progreso y datos de forma segura.
      </p>
      
      <p style={{
        fontSize: '14px',
        color: '#9ca3af',
        marginBottom: '32px',
        maxWidth: '400px'
      }}>
        Todos tus pokémon capturados, pokéballs, y progreso se sincronizarán automáticamente con la nube.
      </p>
      
      <button
        onClick={onLogin}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <User size={20} />
        Iniciar Sesión
      </button>
    </div>
  );
};

export default LoginRequired;
