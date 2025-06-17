import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { User } from 'lucide-react';
import Login from './Login';
import UserPanel from './UserPanel';
const UserMenu = () => {
    const { user, logout } = useUser();
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const handleUserIconClick = () => {
        setShowUserPanel(true);
    };
    const handleCloseUserPanel = () => {
        setShowUserPanel(false);
    };
    // Si no hay usuario, mostrar botón de login con estética mejorada
    if (!user) {
        return (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setShowLogin(true), className: "relative group flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105", children: [_jsx(User, { size: 16 }), _jsx("span", { children: "Iniciar Sesi\u00F3n" }), _jsx("div", { className: "absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200" })] }), _jsx(Login, { isOpen: showLogin, onClose: () => setShowLogin(false) })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: handleUserIconClick, className: "relative group flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105", title: "Ver perfil y configuraci\u00F3n", children: [_jsx(User, { size: 16 }), _jsx("span", { children: "Perfil" }), _jsx("div", { className: "absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200" }), _jsx("div", { className: "absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" })] }), _jsx(UserPanel, { isOpen: showUserPanel, onClose: handleCloseUserPanel })] }));
};
export default UserMenu;
