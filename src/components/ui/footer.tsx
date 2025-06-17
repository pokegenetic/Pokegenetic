import logo from '@/img/logopokegenetic.png'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#1f1f1f] text-gray-300 px-5 py-4 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:items-start">
        {/* Logo + marca */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Pokegenetic" className="w-16 h-16 object-contain" />
          <div className="flex flex-col">
            <span className="text-base font-semibold">Pokegenetic Web App</span>
            <span className="text-xs text-gray-400">v0.4 beta 2 - Mayo 2025</span>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <p className="text-xs mb-3 text-white font-medium">¡Síguenos y conversemos!</p>
          <div className="flex justify-center sm:justify-start gap-4">
            <a href="https://www.instagram.com/pokegenetic/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition" title="Instagram">
              <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg" alt="Instagram" className="w-6 h-6 invert" />
            </a>
            <a href="https://www.threads.net/@pokegenetic" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition" title="Threads">
              <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/threads.svg" alt="Threads" className="w-6 h-6 invert" />
            </a>
            <a href="https://www.tiktok.com/@pokegenetic" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition" title="TikTok">
              <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg" alt="TikTok" className="w-6 h-6 invert" />
            </a>
            <a href="https://wa.me/message/PFFHBTLKH3UTM1" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition" title="WhatsApp">
              <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg" alt="WhatsApp" className="w-6 h-6 invert" />
            </a>
          </div>
        </div>

        {/* Navegación rápida */}
        <nav className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-white transition">Inicio</Link>
          <Link to="/crear" className="hover:text-white transition">Creación</Link>
          <Link to="/paquetes" className="hover:text-white transition">Packs</Link>
          <Link to="/equipo" className="hover:text-white transition">Equipo</Link>
          <Link to="/faq" className="hover:text-white transition">FAQ</Link>
        </nav>
      </div>

      {/* Enlaces adicionales */}
      <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 text-xs text-gray-400">
            <a href="https://wa.me/message/PFFHBTLKH3UTM1" className="hover:text-white transition">Contacto</a>
            <span className="text-gray-600">|</span>
            <Link to="/about" className="hover:text-white transition">About</Link>
            <span className="text-gray-600">|</span>
            <Link to="/terminos-uso" className="hover:text-white transition">Términos de Uso</Link>
          </div>
          <div className="text-xs text-gray-500">
            Última actualización: Mayo 2025
          </div>
        </div>
      </div>

      {/* Derechos */}
      <div className="text-center text-xs text-gray-500 mt-4">
        © {new Date().getFullYear()} Pokegenetic. Todos los derechos reservados.
      </div>
      
      {/* Disclaimer legal */}
      <div className="text-[10px] text-gray-500 text-center mt-2 px-4 max-w-4xl mx-auto">
        <p>
          Pokémon™ es propiedad de Nintendo®, Game Freak® y Creatures Inc. Este sitio y sus servicios no están afiliados ni respaldados oficialmente por The Pokémon Company, Nintendo® o cualquier otra entidad relacionada. Todos los nombres, imágenes y marcas registradas son propiedad de sus respectivos dueños.
        </p>
        <p className="text-[8px] text-gray-600 mt-2">
          Esta es una Fan App creada por Javier I. Herrera
        </p>
      </div>
    </footer>
  )
}
