import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { User, LogOut, Settings } from 'lucide-react';
import Login from './Login';
import UserPanel from './UserPanel';

const UserMenu: React.FC = () => {
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
    return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className="relative group flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <User size={16} />
          <span>Iniciar Sesión</span>
          {/* Efecto de brillo */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
        </button>

        <Login 
          isOpen={showLogin} 
          onClose={() => setShowLogin(false)} 
        />
      </>
    );
  }

  return (
    <>
      {/* OPCIÓN 1: Un solo botón de Perfil (ACTUAL) */}
      <button
        onClick={handleUserIconClick}
        className="relative group flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        title="Ver perfil y configuración"
      >
        <User size={16} />
        <span>Perfil</span>
        {/* Efecto de brillo */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
        {/* Indicador de usuario activo */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
      </button>

      {/* OPCIÓN 2: Dos botones con texto visible en mobile (COMENTADA)
      <div className="flex items-center gap-2">
        <button
          onClick={handleUserIconClick}
          className="relative group flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          title="Ver perfil"
        >
          <User size={16} />
          <span>Perfil</span>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
        </button>
        
        <button
          onClick={logout}
          className="relative group flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
          <span>Salir</span>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
        </button>
      </div>
      */}
      
      <UserPanel 
        isOpen={showUserPanel} 
        onClose={handleCloseUserPanel} 
      />
    </>
  );
};

export default UserMenu;