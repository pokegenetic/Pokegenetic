import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import sv from '@/img/scarlet-violet.png'
import swsh from '@/img/sword-shield.png'
import arceus from '@/img/legends-arceus.png'
import bdsp from '@/img/diamond-pearl.png'
import letsgo from '@/img/lets-go.png'
import { useGame } from '@/context/GameContext'
import RecomendacionesHero from './recomendaciones';
import NoticiasCarousel from './NoticiasCarousel';
import { playSoundEffect } from '@/lib/soundEffects';

export default function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedGame } = useGame()
  const navigate = useNavigate();
  const location = useLocation();
  const toggleDropdown = () => setIsOpen(!isOpen);

  const games = [
    { id: 'scarlet-violet', img: sv, name: 'Pokémon Scarlet/Violet', region: 'Paldea', generation: '9' },
    { id: 'sword-shield', img: swsh, name: 'Pokémon Sword/Shield', region: 'Galar', generation: '8' },
    { id: 'legends-arceus', img: arceus, name: 'Pokémon Legends Arceus', region: 'Hisui', generation: '8' },
    { id: 'diamond-pearl', img: bdsp, name: 'Pokémon Diamond/Pearl', region: 'Sinnoh', generation: '4' },
    { id: 'lets-go', img: letsgo, name: "Pokémon Let's Go Pikachu & Eevee", region: 'Kanto', generation: '1' },
  ]

  return (
    <section className="w-full bg-center bg-cover text-white flex flex-col items-center px-4 sm:px-6 md:px-10 lg:px-20 pt-0 pb-12 text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl animate-hero-pop text-center">
        Bienvenido a Pokegenetic
      </h1>

      <p className="mt-4 max-w-xl text-xs sm:text-sm md:text-base text-gray-600">
        Crea Pokémon personalizados, importa equipos desde Showdown y disfruta de packs por juego. <br/> ¡Haz tu estrategia única!
      </p>

      <p className="mt-6 font-semibold text-sm sm:text-base md:text-lg text-gray-400">
        Para comenzar, selecciona un juego
      </p>

      {/* Separador */}
      <hr className="w-full max-w-2xl border-t-2 border-yellow-300/40 my-8" />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {games.map((game, index) => {
          const isEnabled = game.id === 'scarlet-violet';
          return (
            <div
              key={index}
              onClick={() => {
                if (!isEnabled) return;
                setSelectedGame({
                  id: game.id,
                  name: game.name,
                  region: game.region,
                  generation: game.generation
                });
                playSoundEffect('notification', 0.1); // Sonido al seleccionar juego, volumen 10%
                navigate('/crear');
              }}
              className={
                `flex items-center gap-4 bg-white/70 border border-gray-200/70 backdrop-blur-lg transition rounded-xl p-4 shadow-lg relative ` +
                (isEnabled
                  ? 'hover:bg-white/90 cursor-pointer'
                  : 'opacity-60 grayscale pointer-events-none select-none')
              }
              aria-disabled={!isEnabled}
              tabIndex={isEnabled ? 0 : -1}
            >
              <img src={game.img} alt={game.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
              <div className="text-left">
                <span className="block font-bold text-gray-800 text-sm sm:text-base leading-tight">{game.name}</span>
                <p className="text-xs sm:text-sm text-gray-500">Gen {game.generation} - Región {game.region}</p>
                {/* Ribbon badge for Próximamente */}
                {game.id !== 'scarlet-violet' && (
                  <span
                    className="absolute top-2 right-[-10px] w-16 h-4 flex items-center justify-center bg-yellow-300 text-yellow-900 border border-yellow-400 shadow font-bold text-[8px] uppercase tracking-wide rotate-45 z-10 select-none pointer-events-none"
                    style={{
                      fontSize: '8px',
                      letterSpacing: '0.05em',
                      padding: 0,
                      minWidth: '50px',
                      maxWidth: '64px',
                    }}
                  >
                    Próximamente
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Separador */}
      <hr className="w-full max-w-2xl border-t-2 border-pink-400/40 my-10" />

      {/* Noticias Carousel */}
      <NoticiasCarousel />

      {/* Separador */}
      <hr className="w-full max-w-2xl border-t-2 border-green-400/40 my-10" />

      {/* Título antes del botón de minijuegos */}
      <h2 className="mt-10 mb-2 text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
        ¡Juega a los minijuegos!
      </h2>
      <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base text-gray-500 mb-2">
        Participa en divertidos minijuegos para ganar Pokémon exclusivos, premios especiales y recompensas únicas para tu equipo. ¡Demuestra tu habilidad y haz crecer tu colección mientras te diviertes!
      </p>

      {/* Botón para acceder a la página de minijuegos */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          className="px-7 py-3 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 text-white font-bold shadow-lg text-lg hover:scale-105 transition-transform"
          onClick={() => navigate('/minigames', { state: { from: location.pathname } })}
        >
          MiniGames
        </button>
        
        {/* Botones de Test de Audio */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            className="px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold shadow-lg text-sm hover:scale-105 transition-transform"
            onClick={() => navigate('/test-simple', { state: { from: location.pathname } })}
          >
            🔊 Test Audio
          </button>
          <button
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold shadow-lg text-sm hover:scale-105 transition-transform"
            onClick={() => navigate('/audio-refactor-test', { state: { from: location.pathname } })}
          >
            🎮 Test Pokémon Catch
          </button>
        </div>
      </div>

      {/* Separador */}
      <hr className="w-full max-w-2xl border-t-2 border-blue-400/40 my-10" />

      {/* Título de recomendaciones con degradado Pokémon */}
      <h2 className="mt-10 mb-2 text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
        Mira nuestras recomendaciones
      </h2>
      <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base text-gray-500 mb-4">
        Explora las recomendaciones que otros entrenadores han compartido sobre Pokegenetic. Gracias a la comunidad por aportar sus experiencias para que todos podamos disfrutar y mejorar juntos.
      </p>
      <RecomendacionesHero />
      <p className="max-w-xl mx-auto text-xs sm:text-xs md:text-base text-gray-500 mt-0.3">
        Testimonios reales de <a href="https://www.instagram.com/p/Cq9EOrsvpVV/" target="_blank" rel="noopener noreferrer" className="text-[#E4405F] underline hover:text-[#C13584] transition-colors">Instagram</a>
      </p>
    </section>
  )
}