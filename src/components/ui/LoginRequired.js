import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { User, Lock } from 'lucide-react';
const LoginRequired = ({ feature, onLogin }) => {
    return (_jsxs("div", { style: {
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
        }, children: [_jsx("div", { style: {
                    backgroundColor: '#fef3c7',
                    borderRadius: '50%',
                    padding: '20px',
                    marginBottom: '24px'
                }, children: _jsx(Lock, { size: 40, style: { color: '#d97706' } }) }), _jsx("h2", { style: {
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '12px'
                }, children: "Inicia Sesi\u00F3n Requerido" }), _jsxs("p", { style: {
                    fontSize: '16px',
                    color: '#6b7280',
                    marginBottom: '8px',
                    maxWidth: '400px'
                }, children: ["Para usar ", _jsx("strong", { children: feature }), ", necesitas iniciar sesi\u00F3n para que podamos guardar tu progreso y datos de forma segura."] }), _jsx("p", { style: {
                    fontSize: '14px',
                    color: '#9ca3af',
                    marginBottom: '32px',
                    maxWidth: '400px'
                }, children: "Todos tus pok\u00E9mon capturados, pok\u00E9balls, y progreso se sincronizar\u00E1n autom\u00E1ticamente con la nube." }), _jsxs("button", { onClick: onLogin, style: {
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
                }, onMouseEnter: (e) => e.currentTarget.style.transform = 'scale(1.05)', onMouseLeave: (e) => e.currentTarget.style.transform = 'scale(1)', children: [_jsx(User, { size: 20 }), "Iniciar Sesi\u00F3n"] })] }));
};
export default LoginRequired;
