import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playSoundEffect } from '@/lib/soundEffects';
import { useUser } from '../../context/UserContext';
import LoginRequired from './LoginRequired';
import './minigames-animations.css';

// Definir los juegos con descripciones
const games = [
  {
    id: 'pokemoncatch',
    title: '¡Atrapa un Pokémon!',
    description: 'Captura Pokémon salvajes',
    route: '/pokemoncatch'
  },
  {
    id: 'whosthat',
    title: '¿Quién es ese Pokémon?',
    description: 'Adivina por la silueta',
    route: '/whosthat'
  },
  {
    id: 'memorice',
    title: 'Memorice',
    description: 'Encuentra los pares',
    route: '/memorice'
  },
  {
    id: 'coinmachine',
    title: 'Atrapamonedas',
    description: 'Máquina de premios',
    route: '/coinmachine'
  },
  {
    id: 'incubators',
    title: 'Incubadoras',
    description: 'Eclosiona huevos',
    route: '/incubators'
  },
  {
    id: 'ligapokemon',
    title: 'Liga Pokémon',
    description: 'Desafía a los líderes',
    route: '/ligapokemon'
  }
];

export default function MiniGames() {
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useUser();
  
  // Si el usuario no está logueado, mostrar componente de login requerido
  if (!user) {
    return (
      <LoginRequired 
        feature="los MiniJuegos"
        onLogin={loginWithGoogle}
      />
    );
  }
  
  const handleGameClick = (route: string) => {
    playSoundEffect('notification', 0.1);
    navigate(route, { state: { from: '/minigames' } });
  };
  
  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* Título */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center">
        MiniGames
      </h1>
      
      {/* Descripción */}
      <p className="mt-4 max-w-xl text-sm md:text-base text-slate-600 font-medium text-center mx-auto mb-8">
        ¡Bienvenido a la sección de MiniGames! Aquí encontrarás pequeños juegos interactivos donde puedes ganar premios y Pokémon exclusivos. ¡Participa y pon a prueba tu suerte y habilidad!
      </p>
      
      {/* Grid de juegos - 2 por fila en mobile, 3 en desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
        {games.map((game, index) => {
          return (
            <div
              key={game.id}
              className="star-border"
              style={{
                animation: 'float 4s ease-in-out infinite',
                animationDelay: `${index * 0.3}s`
              }}
            >
              {/* Luz que se mueve por el borde superior */}
              <div
                className="absolute w-12 h-3 top-[-1px] left-0 z-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, #fbbf24, #facc15, #fbbf24, transparent)',
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
                  animation: 'star-movement-top 4s linear infinite',
                }}
              />
              
              {/* Luz que se mueve por el borde inferior */}
              <div
                className="absolute w-12 h-3 bottom-[-1px] right-0 z-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, #ec4899, #f472b6, #ec4899, transparent)',
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 8px rgba(236, 72, 153, 0.6)',
                  animation: 'star-movement-bottom 4s linear infinite',
                  animationDelay: '2s'
                }}
              />
              
              {/* Luz que se mueve por el borde izquierdo */}
              <div
                className="absolute w-3 h-12 left-[-1px] top-0 z-0"
                style={{
                  background: 'linear-gradient(180deg, transparent, #3b82f6, #60a5fa, #3b82f6, transparent)',
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
                  animation: 'star-movement-left 4s linear infinite',
                  animationDelay: '1s'
                }}
              />
              
              {/* Luz que se mueve por el borde derecho */}
              <div
                className="absolute w-3 h-12 right-[-1px] bottom-0 z-0"
                style={{
                  background: 'linear-gradient(180deg, transparent, #8b5cf6, #a78bfa, #8b5cf6, transparent)',
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
                  animation: 'star-movement-right 4s linear infinite',
                  animationDelay: '3s'
                }}
              />

              <button
                onClick={() => handleGameClick(game.route)}
                className="
                  star-border-content group relative overflow-hidden subtle-shine-effect
                  p-5 rounded-xl shadow-lg hover:shadow-2xl
                  transform transition-all duration-500 ease-out
                  hover:scale-110 hover:-translate-y-3
                  focus:outline-none focus:ring-4 focus:ring-blue-400/40
                  w-full h-32 flex flex-col items-center justify-center
                  border border-slate-200/60 hover:border-slate-300/80
                  bg-white/70 hover:bg-white/85
                  backdrop-blur-md
                "
              >
                {/* Contenido centrado con elementos más juntos */}
                <div className="relative z-20 flex flex-col items-center justify-center h-full gap-2">
                  {/* Sección superior: título y pokéball */}
                  <div className="flex flex-col items-center gap-2">
                    <h3 className="text-xs font-bold text-center leading-tight text-slate-800 group-hover:text-white transition-all duration-300 drop-shadow-sm max-w-full px-1">
                      {game.title}
                    </h3>
                    
                    <div className="opacity-30 group-hover:opacity-80 transition-all duration-500 group-hover:animate-spin group-hover:scale-125">
                      <img src="/pokeball.png" alt="Pokeball" className="w-10 h-10 drop-shadow-md group-hover:filter group-hover:brightness-0 group-hover:invert" />
                    </div>
                  </div>
                  
                  {/* Descripción abajo, cerca de la pokéball */}
                  <p className="text-xs text-center leading-tight font-medium text-slate-700 group-hover:text-white/95 transition-all duration-300 drop-shadow-sm max-w-full px-1">
                    {game.description}
                  </p>
                </div>
              
              {/* Partículas de brillo más sutiles pero visibles */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-ping shadow-lg" />
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-white rounded-full animate-ping shadow-lg" style={{ animationDelay: '0.3s' }} />
                <div className="absolute top-1/2 left-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-md" style={{ animationDelay: '0.6s' }} />
                <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white rounded-full animate-ping shadow-md" style={{ animationDelay: '0.9s' }} />
              </div>
              
              {/* Efecto de onda en click más sutil */}
              <div className="absolute inset-0 rounded-xl border-4 border-white/60 opacity-0 group-active:opacity-40 z-10 transition-opacity duration-200" />
            </button>
          </div>
        );
        })}
      </div>
      
      {/* Mensaje motivacional */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600 font-semibold">
          🎮 ¡Completa los juegos para ganar Pokéballs y premios exclusivos!
        </p>
      </div>
    </div>
  );
}
