import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '../../context/UserContext';
import { X, Shield, Package, Gamepad2, Users } from 'lucide-react';
const Login = ({ isOpen, onClose }) => {
    const { loginWithGoogle, loginWithEmail } = useUser();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogle();
            onClose();
        }
        catch (error) {
            console.error('Error al iniciar sesión con Google:', error);
            if (error.code === 'auth/popup-blocked') {
                setError('El popup fue bloqueado. Por favor permite popups para este sitio.');
            }
            else if (error.code === 'auth/cancelled-popup-request') {
                setError('Inicio de sesión cancelado.');
            }
            else if (error.code === 'auth/network-request-failed') {
                setError('Error de red. Verifica tu conexión a internet.');
            }
            else {
                setError('Error al iniciar sesión. Intenta nuevamente.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handleEmailLogin = async () => {
        if (!email.trim()) {
            setError('Por favor ingresa tu email');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Por favor ingresa un email válido');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await loginWithEmail(email);
            alert('Se ha enviado un enlace de inicio de sesión a tu email. Revisa tu bandeja de entrada.');
            onClose();
        }
        catch (error) {
            console.error('Error al enviar email:', error);
            if (error.code === 'auth/invalid-email') {
                setError('Email inválido.');
            }
            else if (error.code === 'auth/user-not-found') {
                setError('Usuario no encontrado.');
            }
            else {
                setError('Error al enviar email. Verifica tu dirección e intenta nuevamente.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    if (!isOpen)
        return null;
    const modalContent = (_jsxs("div", { className: "fixed inset-0 z-[9999] flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: "relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-2xl border border-white/50 w-full max-w-md mx-auto overflow-hidden transform transition-all duration-300 scale-100", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-4 relative", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "\u00A1\u00DAnete a Pok\u00E9Genetic!" }), _jsx("button", { onClick: onClose, className: "text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20", children: _jsx(X, { size: 24 }) })] }), _jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" }), _jsx("div", { className: "absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl border border-blue-200/50", children: [_jsx("h3", { className: "font-bold text-gray-800 mb-3 text-center", children: "\uD83C\uDFAE \u00BFPor qu\u00E9 crear una cuenta?" }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm text-gray-700", children: [_jsxs("div", { className: "flex flex-col items-center space-y-1 text-center", children: [_jsx(Package, { className: "w-6 h-6 text-blue-600" }), _jsx("span", { className: "font-medium", children: "Pedidos" })] }), _jsxs("div", { className: "flex flex-col items-center space-y-1 text-center", children: [_jsx(Shield, { className: "w-6 h-6 text-green-600" }), _jsx("span", { className: "font-medium", children: "Guardar equipo" })] }), _jsxs("div", { className: "flex flex-col items-center space-y-1 text-center", children: [_jsx(Gamepad2, { className: "w-6 h-6 text-purple-600" }), _jsx("span", { className: "font-medium", children: "Minijuegos" })] }), _jsxs("div", { className: "flex flex-col items-center space-y-1 text-center", children: [_jsx(Users, { className: "w-6 h-6 text-orange-600" }), _jsx("span", { className: "font-medium", children: "Soporte" })] })] })] }), error && (_jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full flex-shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: handleGoogleLogin, disabled: loading, className: "w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-2xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]", children: [_jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "currentColor", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "currentColor", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "currentColor", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "currentColor", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), _jsx("span", { children: loading ? 'Iniciando sesión...' : 'Continuar con Google' })] }), _jsxs("div", { className: "flex items-center justify-center my-6", children: [_jsx("div", { className: "border-t border-gray-300 flex-grow" }), _jsx("span", { className: "px-4 text-gray-500 text-sm font-medium bg-white rounded-full border border-gray-200", children: "o" }), _jsx("div", { className: "border-t border-gray-300 flex-grow" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "relative", children: _jsx("input", { type: "email", placeholder: "tu@email.com", value: email, onChange: (e) => {
                                                        setEmail(e.target.value);
                                                        if (error)
                                                            setError('');
                                                    }, className: "w-full border-2 border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm", disabled: loading }) }), _jsx("button", { onClick: handleEmailLogin, disabled: loading || !email.trim(), className: "w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]", children: loading ? 'Enviando enlace...' : 'Enviar enlace por email' })] }), _jsx("p", { className: "text-xs text-gray-500 text-center mt-6 leading-relaxed", children: "Al iniciar sesi\u00F3n, aceptas nuestros t\u00E9rminos de servicio y pol\u00EDtica de privacidad." })] })] }), _jsx("div", { className: "h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" })] })] }));
    return createPortal(modalContent, document.body);
};
export default Login;
