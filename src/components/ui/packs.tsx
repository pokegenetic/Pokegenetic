import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import pokeballImg from '@/img/pokeball.png';

export default function Packs() {
  const { selectedGame, isLoading } = useGame();
  const navigate = useNavigate();

  const goToCrear = () => navigate('/crear');
  const goToMisPokemon = () => navigate('/mis-pokemon');
  const goToPacks = () => navigate('/paquetes');
  const goToEvents = () => navigate('/pokemonevents');

  useEffect(() => {
    if (!selectedGame && !isLoading) {
      console.warn('No game selected, but allowing access to /packs');
    }
  }, [selectedGame, isLoading]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 pt-8 text-center">
      <div className="flex flex-col items-center mb-8">
        <img
          src={pokeballImg}
          alt="Pokéball"
          className="w-10 h-10 animate-bounce mb-2 drop-shadow-md"
          style={{ filter: 'drop-shadow(0 2px 6px #eab308)' }}
        />
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center">
          Packs y Colecciones
        </h1>
        <p className="text-gray-600 max-w-md">
          ¡Explora paquetes completos de Pokémon para completar tu colección o tu Pokédex en el juego o en HOME! También descubre los Pokémon de eventos más buscados y raros.
        </p>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-md">
        <button
          onClick={goToPacks}
          className="flex items-center gap-3 w-full bg-gradient-to-r from-yellow-200 via-yellow-100 to-white hover:from-yellow-300 hover:to-yellow-100 border border-yellow-300/60 shadow-lg rounded-2xl px-6 py-5 text-left transition-all duration-200 group hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <span className="inline-block bg-yellow-100 text-yellow-700 rounded-full p-2 shadow-sm group-hover:rotate-6 transition-transform duration-200">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7h18M3 12h18M3 17h18' /></svg>
          </span>
          <span>
            <span className="font-semibold text-gray-800 text-lg block">Packs</span>
            <span className="text-gray-500 text-sm block">Paquetes completos de Pokémon para coleccionar o completar tu Pokédex</span>
          </span>
        </button>
        <button
          onClick={goToEvents}
          className="flex items-center gap-3 w-full bg-gradient-to-r from-pink-200 via-pink-100 to-white hover:from-pink-300 hover:to-pink-100 border border-pink-300/60 shadow-lg rounded-2xl px-6 py-5 text-left transition-all duration-200 group hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <span className="inline-block bg-pink-100 text-pink-700 rounded-full p-2 shadow-sm group-hover:-rotate-6 transition-transform duration-200">
            <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
          </span>
          <span>
            <span className="font-semibold text-gray-800 text-lg block">Los + Buscados</span>
            <span className="text-gray-500 text-sm block">Pokémon de eventos pasados, los más buscados y raros</span>
          </span>
        </button>
      </div>
    </div>
  );
}
