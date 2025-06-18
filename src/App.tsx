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
import AudioDebugPage from './components/ui/AudioDebugPage'; // Nuevo probador completo
import SimpleAudioTest from './components/ui/SimpleAudioTest'; // Probador simple
import BasicAudioTest from './components/ui/BasicAudioTest'; // Probador básico
import SimpleAudioPage from './components/ui/SimpleAudioPage'; // Probador simple funcional
import AudioRefactorTest from './components/ui/AudioRefactorTest'; // Test del refactor de audio
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
              <Route path="/audio-debug" element={<AudioDebugPage />} />
              <Route path="/simple-audio" element={<SimpleAudioTest />} />
              <Route path="/test-simple" element={<SimpleAudioPage />} />
              <Route path="/basic-audio" element={
                <div className="p-8 max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold text-center mb-8">🔊 Probador de Audio Básico</h1>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <button 
                      onClick={() => {
                        console.log('Probando notification...');
                        const audio = new Audio('/notification.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(e => console.error('Error:', e));
                      }}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      🔔 Notification
                    </button>
                    
                    <button 
                      onClick={() => {
                        console.log('Probando levelup...');
                        const audio = new Audio('/sfx/levelup.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(e => console.error('Error:', e));
                      }}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      ⬆️ Level Up
                    </button>
                    
                    <button 
                      onClick={() => {
                        console.log('Probando whosthat...');
                        const audio = new Audio('/whosthat.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(e => console.error('Error:', e));
                      }}
                      className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                    >
                      ❓ Who's That
                    </button>
                    
                    <button 
                      onClick={() => {
                        console.log('Probando victory...');
                        const audio = new Audio('/sfx/victory.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(e => console.error('Error:', e));
                      }}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                    >
                      🏆 Victory
                    </button>
                    
                    <button 
                      onClick={() => {
                        console.log('Probando pokeballcatch...');
                        const audio = new Audio('/sfx/pokeballcatch.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(e => console.error('Error:', e));
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      ⚾ Pokeball Catch
                    </button>
                    
                    <button 
                      onClick={() => {
                        console.log('Probando heal...');
                        const audio = new Audio('/sfx/heal.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(e => console.error('Error:', e));
                      }}
                      className="bg-cyan-500 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded"
                    >
                      💚 Heal
                    </button>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">📋 Instrucciones:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Haz clic en cada botón para probar el sonido</li>
                      <li>Abre la consola del navegador (F12) para ver logs</li>
                      <li>En móviles: toca la pantalla primero para habilitar audio</li>
                    </ul>
                  </div>
                </div>
              } />
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
              <Route path="/audio-refactor-test" element={<AudioRefactorTest />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;