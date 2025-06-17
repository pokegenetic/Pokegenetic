import { useGame } from '@/context/GameContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function GameActions() {
  const { selectedGame } = useGame()
  const navigate = useNavigate()

  const goToCrear = () => navigate('/crear');
  const goToMisPokemon = () => navigate('/mis-pokemon');
  const goToPacks = () => navigate('/packs');

  useEffect(() => {
    if (!selectedGame) navigate('/')
  }, [selectedGame, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        ¿Qué quieres hacer en el laboratorio?
      </h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={goToCrear} className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition">
          Crear Pokémon/Equipo
        </button>
        <button onClick={goToMisPokemon} className="px-6 py-3 bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition">
          Mis Pokémon
        </button>
        <button onClick={goToPacks} className="px-6 py-3 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 transition">
          Packs Pokédex
        </button>
      </div>
    </div>
  )
}