import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/ui/footer";
import Hero from "./components/ui/hero";
import { Routes, Route, useLocation } from 'react-router-dom'
import Laboratorio from './components/ui/laboratorio'
import Crear from './components/ui/crear'
import Edicion from "@/components/ui/edicion";
import Equipo from "@/components/ui/equipo"
import EdicionTarjeta from "@/components/ui/ediciontarjeta"
import Packs from './components/ui/packs';
import PokemonEvents from './components/ui/pokemonevents';
import About from './components/ui/About'; // Import the About component
import Faq from './components/ui/faq'; // Import the Faq component
import TerminosUso from './components/ui/terminos-uso'; // Import the Terms of Use component
import Paquetes from './components/ui/paquetes';
import PokemonCatch from './components/ui/pokemoncatch';
import MiniGames from './components/ui/minigames';
import CoinMachine from './components/ui/coinmachine';
import WhosThatPokemon from './components/ui/whosthat';
import Memorice from './components/ui/memorice';
import Incubators from './components/ui/incubators';
import LigaPokemon from './components/ui/ligapokemon';
import AudioTester from './components/ui/AudioTester'; // Probador temporal
import AudioTest from './components/ui/AudioTest'; // Debug temporal
import { AnimatePresence, motion } from 'framer-motion';
import Login from './components/ui/Login';
import { useUser } from './context/UserContext';

function App() {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen justify-between animated-bg">
      <MiniNavbar />
      <main className="flex-1 pt-[96px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.01, filter: 'blur(8px)' }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<Hero />} />
              <Route path="/test-audio" element={<AudioTester />} />
              <Route path="/debug-audio" element={<AudioTest />} />
              <Route path="/laboratorio" element={<Laboratorio />} />
              <Route path="/crear" element={<Crear />} />
              <Route path="/edicion" element={<Edicion />} />
              <Route path="/ediciontarjeta" element={<EdicionTarjeta />} />
              <Route path="/equipo" element={<Equipo />} />
              <Route path="/packs" element={<Packs />} />
              <Route path="/pokemonevents" element={<PokemonEvents />} />
              <Route path="/about" element={<About />} /> {/* Add route for About */}
              <Route path="/faq" element={<Faq />} /> {/* Add route for Faq */}
              <Route path="/terminos-uso" element={<TerminosUso />} /> {/* Add route for Terms of Use */}
              <Route path="/paquetes" element={<Paquetes />} />
              <Route path="/pokemoncatch" element={<PokemonCatch />} />
              <Route path="/minigames" element={<MiniGames />} />
              <Route path="/coinmachine" element={<CoinMachine />} />
              <Route path="/whosthat" element={<WhosThatPokemon />} />
              <Route path="/memorice" element={<Memorice />} />
              <Route path="/incubators" element={<Incubators />} />
              <Route path="/ligapokemon" element={<LigaPokemon />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;