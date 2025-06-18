import { useGame } from '@/context/GameContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { playSoundEffect } from '@/lib/soundEffects';

export default function Laboratorio() {
  const { selectedGame } = useGame()
  const navigate = useNavigate()

  const goToCrear = () => {
    playSoundEffect('notification', 0.2);
    navigate('/crear');
  };
  const goToMisPokemon = () => {
    playSoundEffect('notification', 0.2);
    navigate('/mis-pokemon');
  };
  const goToPacks = () => {
    playSoundEffect('notification', 0.2);
    navigate('/packs');
  };

  useEffect(() => {
    if (!selectedGame) navigate('/')
  }, [selectedGame, navigate])

  return (
    <div className="flex flex-col items-center px-4 pt-[1 px] text-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center">
        ¿Qué quieres hacer en el laboratorio?
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-md mt-2">
        <button onClick={goToCrear} className="flex items-center gap-3 w-full bg-white/80 hover:bg-white border border-gray-200/70 backdrop-blur-md shadow-md rounded-xl px-4 py-3 text-left transition group">
          <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2"><svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg></span>
          <span className="font-semibold text-gray-800">Crear Pokémon/Equipo</span>
        </button>
        <button onClick={goToMisPokemon} className="flex items-center gap-3 w-full bg-white/80 hover:bg-white border border-gray-200/70 backdrop-blur-md shadow-md rounded-xl px-4 py-3 text-left transition group">
          <span className="inline-block bg-green-100 text-green-600 rounded-full p-2"><svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg></span>
          <span className="font-semibold text-gray-800">Mis Pokémon</span>
        </button>
        <button onClick={goToPacks} className="flex items-center gap-3 w-full bg-white/80 hover:bg-white border border-gray-200/70 backdrop-blur-md shadow-md rounded-xl px-4 py-3 text-left transition group">
          <span className="inline-block bg-yellow-100 text-yellow-700 rounded-full p-2"><svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7h18M3 12h18M3 17h18' /></svg></span>
          <span className="font-semibold text-gray-800">Packs Pokédex</span>
        </button>
      </div>
    </div>
  )
}
