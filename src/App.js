import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Footer from "@/components/ui/footer";
import Hero from "./components/ui/hero";
import { Routes, Route, useLocation } from 'react-router-dom';
import Laboratorio from './components/ui/laboratorio';
import Crear from './components/ui/crear';
import Edicion from "@/components/ui/edicion";
import Equipo from "@/components/ui/equipo";
import EdicionTarjeta from "@/components/ui/ediciontarjeta";
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
import SimpleAudioPage from './components/ui/SimpleAudioPage';
import { AnimatePresence, motion } from 'framer-motion';
function App() {
    const location = useLocation();                    return (_jsxs("div", { className: "flex flex-col min-h-screen justify-between animated-bg", children: [_jsx(MiniNavbar, {}), _jsx("main", { className: "flex-1 pt-[96px]", children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, scale: 0.98, filter: 'blur(8px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' }, exit: { opacity: 0, scale: 1.01, filter: 'blur(8px)' }, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] }, className: "h-full", children: _jsxs(Routes, { location: location, children: [_jsx(Route, { path: "/", element: _jsx(Hero, {}) }), _jsx(Route, { path: "/test-simple", element: _jsx(SimpleAudioPage, {}) }), _jsx(Route, { path: "/laboratorio", element: _jsx(Laboratorio, {}) }), _jsx(Route, { path: "/crear", element: _jsx(Crear, {}) }), _jsx(Route, { path: "/edicion", element: _jsx(Edicion, {}) }), _jsx(Route, { path: "/ediciontarjeta", element: _jsx(EdicionTarjeta, {}) }), _jsx(Route, { path: "/equipo", element: _jsx(Equipo, {}) }), _jsx(Route, { path: "/packs", element: _jsx(Packs, {}) }), _jsx(Route, { path: "/pokemonevents", element: _jsx(PokemonEvents, {}) }), _jsx(Route, { path: "/about", element: _jsx(About, {}) }), " ", _jsx(Route, { path: "/faq", element: _jsx(Faq, {}) }), " ", _jsx(Route, { path: "/terminos-uso", element: _jsx(TerminosUso, {}) }), " ", _jsx(Route, { path: "/paquetes", element: _jsx(Paquetes, {}) }), _jsx(Route, { path: "/pokemoncatch", element: _jsx(PokemonCatch, {}) }), _jsx(Route, { path: "/minigames", element: _jsx(MiniGames, {}) }), _jsx(Route, { path: "/coinmachine", element: _jsx(CoinMachine, {}) }), _jsx(Route, { path: "/whosthat", element: _jsx(WhosThatPokemon, {}) }), _jsx(Route, { path: "/memorice", element: _jsx(Memorice, {}) }), _jsx(Route, { path: "/incubators", element: _jsx(Incubators, {}) }), _jsx(Route, { path: "/ligapokemon", element: _jsx(LigaPokemon, {}) })] }) }, location.pathname) }) }), _jsx(Footer, {})] }));
}
export default App;
