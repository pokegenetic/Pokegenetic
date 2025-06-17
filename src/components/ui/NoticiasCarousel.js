import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar, Tag, ExternalLink } from 'lucide-react';
import { useNoticias } from '@/lib/noticiasUtils';
import { cn } from '@/lib/utils';
import './noticias-carousel.css';
const NoticiasCarousel = () => {
    const { getAllNoticias, formatDate } = useNoticias();
    const noticias = getAllNoticias();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedNoticia, setSelectedNoticia] = useState(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    // Auto-advance carousel
    useEffect(() => {
        if (!isAutoPlaying)
            return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % noticias.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(interval);
    }, [isAutoPlaying]);
    // Pause auto-play when modal is open
    useEffect(() => {
        setIsAutoPlaying(!selectedNoticia);
    }, [selectedNoticia]);
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % noticias.length);
    };
    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + noticias.length) % noticias.length);
    };
    const getCategoryColor = (categoria) => {
        switch (categoria) {
            case 'juegos': return 'bg-blue-500';
            case 'actualizacion': return 'bg-green-500';
            case 'eventos': return 'bg-purple-500';
            case 'noticias': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };
    const getCategoryLabel = (categoria) => {
        switch (categoria) {
            case 'juegos': return 'Juegos';
            case 'actualizacion': return 'Actualización';
            case 'eventos': return 'Eventos';
            case 'noticias': return 'Noticias';
            default: return 'General';
        }
    };
    const formatText = (text) => {
        // Convertir **texto** a <strong>texto</strong>
        const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return boldFormatted;
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "w-full max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h2", { className: "text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg mb-2", children: "\u00DAltimas Noticias Pok\u00E9mon" }), _jsx("p", { className: "text-xs sm:text-sm text-gray-500 max-w-xl mx-auto", children: "Mantente al d\u00EDa con las \u00FAltimas novedades del mundo Pok\u00E9mon" })] }), _jsxs("div", { className: "relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/70 dark:border-gray-700/60 overflow-hidden", children: [_jsx("button", { onClick: prevSlide, className: "absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors", "aria-label": "Noticia anterior", children: _jsx(ChevronLeft, { className: "w-5 h-5 text-gray-700 dark:text-gray-300" }) }), _jsx("button", { onClick: nextSlide, className: "absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors", "aria-label": "Siguiente noticia", children: _jsx(ChevronRight, { className: "w-5 h-5 text-gray-700 dark:text-gray-300" }) }), _jsx("div", { className: "w-full h-full overflow-hidden", children: _jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.div, { initial: { opacity: 0, x: 300 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -300 }, transition: { duration: 0.5, ease: "easeInOut" }, className: "flex flex-col h-auto", children: [_jsxs("div", { className: "w-full h-48 md:h-60 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center relative overflow-hidden", children: [noticias[currentIndex].imagen ? (_jsx("img", { src: noticias[currentIndex].imagen, alt: noticias[currentIndex].titulo, className: "w-full h-full object-cover absolute inset-0", onError: (e) => {
                                                            // Fallback to placeholder if image fails to load
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        } })) : (
                                                    /* Show placeholder only when no image */
                                                    _jsx("div", { className: "w-full h-full bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-blue-500/20 flex items-center justify-center", children: _jsx("div", { className: "text-6xl opacity-30", children: "\uD83C\uDFAE" }) })), _jsx("div", { className: "hidden w-full h-full bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-blue-500/20 flex items-center justify-center absolute inset-0", children: _jsx("div", { className: "text-6xl opacity-30", children: "\uD83C\uDFAE" }) }), _jsxs("div", { className: cn("absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1", getCategoryColor(noticias[currentIndex].categoria)), children: [_jsx(Tag, { className: "w-3 h-3" }), getCategoryLabel(noticias[currentIndex].categoria)] })] }), _jsxs("div", { className: "w-full p-6 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3", children: [_jsx(Calendar, { className: "w-4 h-4" }), formatDate(noticias[currentIndex].fecha)] }), _jsx("h3", { className: "text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2", children: noticias[currentIndex].titulo }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3", dangerouslySetInnerHTML: { __html: formatText(noticias[currentIndex].resumen) } })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setSelectedNoticia(noticias[currentIndex]), className: "flex-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform text-sm", children: "Leer m\u00E1s" }), noticias[currentIndex].link && (_jsx("button", { onClick: () => window.open(noticias[currentIndex].link, '_blank'), className: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors", "aria-label": "Ver fuente original", children: _jsx(ExternalLink, { className: "w-4 h-4" }) }))] })] })] }, currentIndex) }) })] })] }), _jsx(AnimatePresence, { children: selectedNoticia && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: () => setSelectedNoticia(null), children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.9, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 20 }, className: "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "relative h-48 bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden", children: [selectedNoticia.imagen ? (_jsx("img", { src: selectedNoticia.imagen, alt: selectedNoticia.titulo, className: "w-full h-full object-cover absolute inset-0", onError: (e) => {
                                            // Fallback to placeholder if image fails to load
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        } })) : (
                                    /* Show placeholder only when no image */
                                    _jsx("div", { className: "w-full h-full bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-blue-500/20 flex items-center justify-center", children: _jsx("div", { className: "text-8xl opacity-30", children: "\uD83C\uDFAE" }) })), _jsx("div", { className: "hidden w-full h-full bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-blue-500/20 flex items-center justify-center absolute inset-0", children: _jsx("div", { className: "text-8xl opacity-30", children: "\uD83C\uDFAE" }) }), _jsx("button", { onClick: () => setSelectedNoticia(null), className: "absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 hover:bg-white dark:hover:bg-gray-700 transition-colors", children: _jsx(X, { className: "w-5 h-5 text-gray-700 dark:text-gray-300" }) }), _jsxs("div", { className: cn("absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1", getCategoryColor(selectedNoticia.categoria)), children: [_jsx(Tag, { className: "w-3 h-3" }), getCategoryLabel(selectedNoticia.categoria)] })] }), _jsxs("div", { className: "p-6 max-h-[50vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4", children: [_jsx(Calendar, { className: "w-4 h-4" }), formatDate(selectedNoticia.fecha)] }), _jsx("h2", { className: "text-2xl font-bold text-gray-800 dark:text-white mb-4", children: selectedNoticia.titulo }), _jsx("div", { className: "prose prose-sm dark:prose-invert max-w-none", children: selectedNoticia.contenido.split('\n').map((paragraph, index) => (_jsx("p", { className: "mb-3 text-gray-600 dark:text-gray-300", dangerouslySetInnerHTML: { __html: formatText(paragraph) } }, index))) }), selectedNoticia.link && (_jsx("div", { className: "mt-6 pt-4 border-t border-gray-200 dark:border-gray-700", children: _jsxs("button", { onClick: () => window.open(selectedNoticia.link, '_blank'), className: "inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors", children: [_jsx(ExternalLink, { className: "w-4 h-4" }), "Ver fuente original"] }) })), selectedNoticia.id === 'pokemon-home-update-meloetta-shiny' && (_jsx("div", { className: "mt-6 flex justify-center", children: _jsx("button", { className: "bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:scale-105 transition-transform", onClick: () => {
                                                // Importa dinámicamente la función y el array de eventos
                                                import('@/data/sv/eventPokemon').then(({ eventPokemon }) => {
                                                    const meloetta = eventPokemon.find(p => p.name === 'Meloetta' && p.isShiny);
                                                    if (meloetta) {
                                                        import('@/lib/equipoStorage').then(({ addPokemonToTeam }) => {
                                                            addPokemonToTeam(meloetta);
                                                            alert('¡Meloetta variocolor añadido a tu equipo!');
                                                        });
                                                    }
                                                    else {
                                                        alert('No se encontró el Meloetta variocolor en los eventos.');
                                                    }
                                                });
                                            }, children: "A\u00F1adir Meloetta variocolor al equipo" }) }))] })] }) })) })] }));
};
export default NoticiasCarousel;
