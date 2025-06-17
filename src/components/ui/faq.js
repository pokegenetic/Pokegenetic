import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import ScarletVioletTrade1 from '@/img/faq/Scarlet_Violet_Trade1.webp';
import ScarletVioletTrade2 from '@/img/faq/Scarlet_Violet_Trade2.webp';
import SHLinkCode from '@/img/faq/SHLinkCode.webp';
import SHYComm from '@/img/faq/SHYComm.webp';
import BDSPGlobal from '@/img/faq/BDSPGlobal.webp';
import BDSPLinkCode from '@/img/faq/BDSPLinkCode.webp';
import tradingpost from '@/img/faq/tradingpost.webp';
const faqData = [
    {
        question: '¿Necesito tener el plan Home Premium para recibir packs masivos de Pokémon?',
        answer: (_jsx(_Fragment, { children: _jsxs("p", { className: "mb-6 text-left", children: ["S\u00ED. Para poder recibir packs masivos (como Pok\u00E9dex completas o grandes cantidades de Pok\u00E9mon), necesitas tener activa la suscripci\u00F3n Home Premium. Esto se debe a que la versi\u00F3n gratuita de Pok\u00E9mon Home solo permite almacenar hasta 30 espacios, lo que no es suficiente para transferencias grandes.", _jsx("br", {}), _jsx("br", {}), "Con Home Premium, desbloqueas todo el almacenamiento disponible y puedes mover sin problemas todos los Pok\u00E9mon de un pack a tu cuenta.", _jsx("br", {}), _jsx("br", {}), _jsx("b", { children: "Importante:" }), " Si decides dejar de pagar la suscripci\u00F3n Premium, los Pok\u00E9mon que ya est\u00E9n almacenados no se eliminar\u00E1n. Sin embargo, solo podr\u00E1s acceder a los primeros 30 espacios (es decir, la primera caja). El resto permanecer\u00E1 guardado, pero no ser\u00E1 accesible mientras no reactives el plan Premium."] }) })),
    },
    {
        question: '¿Necesito tener Nintendo Switch Online para poder recibir mis Pokémon?',
        answer: (_jsx(_Fragment, { children: _jsxs("p", { className: "mb-6 text-left", children: ["S\u00ED. Para poder realizar intercambios en l\u00EDnea y recibir tus Pok\u00E9mon directamente en tu juego, necesitas tener una suscripci\u00F3n activa a Nintendo Switch Online. Este servicio es obligatorio para todas las funciones en l\u00EDnea del juego, incluyendo los intercambios con otros jugadores o con bots.", _jsx("br", {}), _jsx("br", {}), "Si no tienes Nintendo Switch Online, no podr\u00E1s conectarte a internet desde el juego, lo que hace imposible completar el proceso de entrega."] }) })),
    },
    {
        question: '¿Cómo recibir Pokémon en Pokémon Escarlata y Púrpura?',
        answer: (_jsxs(_Fragment, { children: [_jsx("p", { className: "mb-2", children: "Sigue estos pasos para intercambiar en Pok\u00E9mon Escarlata y P\u00FArpura:" }), _jsxs("ol", { className: "list-decimal ml-6 my-2 text-left", children: [_jsx("li", { children: "Abre el men\u00FA principal y selecciona " }), _jsx("li", { children: "Pok\u00E9portal" }), _jsx("li", { children: "Elige " }), _jsx("li", { children: "Introduce el c\u00F3digo de intercambio que te proporcionamos." }), _jsx("li", { children: "Confirma y espera a que nos conectemos para realizar el intercambio." })] }), _jsx("img", { src: ScarletVioletTrade1, alt: "Pok\u00E9portal paso 1", className: "rounded-lg shadow my-2 mx-auto max-w-xs" }), _jsx("img", { src: ScarletVioletTrade2, alt: "Pok\u00E9portal paso 2", className: "rounded-lg shadow my-2 mx-auto max-w-xs" })] })),
    },
    {
        question: '¿Cómo recibir Pokémon en Pokémon Espada y Escudo?',
        answer: (_jsxs(_Fragment, { children: [_jsx("p", { className: "mb-2", children: "Para intercambiar en Espada y Escudo:" }), _jsxs("ol", { className: "list-decimal ml-6 my-2 text-left", children: [_jsx("li", { children: "Abre el men\u00FA de " }), _jsx("li", { children: "Y-Comm" }), _jsx("li", { children: "Selecciona " }), _jsx("li", { children: "Elige " }), _jsx("li", { children: "Confirma y espera a que nos conectemos para el intercambio." })] }), _jsx("img", { src: SHYComm, alt: "Y-Comm paso 1", className: "rounded-lg shadow my-2 mx-auto max-w-xs" }), _jsx("img", { src: SHLinkCode, alt: "Y-Comm paso 2", className: "rounded-lg shadow my-2 mx-auto max-w-xs" })] })),
    },
    {
        question: '¿Cómo recibir Pokémon en Diamante Brillante y Perla Reluciente (BDSP)?',
        answer: (_jsxs(_Fragment, { children: [_jsx("p", { className: "mb-2", children: "Pasos para intercambiar en BDSP:" }), _jsxs("ol", { className: "list-decimal ml-6 my-2 text-left", children: [_jsxs("li", { children: ["Dir\u00EDgete a la", ' ', _jsx("b", { children: "Sala Uni\u00F3n" }), " (Union Room) desde cualquier Centro Pok\u00E9mon."] }), _jsxs("li", { children: ["Habla con la recepcionista y selecciona", ' ', _jsx("b", { children: "Entrar con c\u00F3digo de enlace" }), "."] }), _jsx("li", { children: "Introduce el c\u00F3digo que te enviamos." }), _jsx("li", { children: "Cuando estemos conectados, inicia el intercambio." })] }), _jsx("img", { src: BDSPGlobal, alt: "Sala Uni\u00F3n paso 1", className: "rounded-lg shadow my-2 mx-auto max-w-xs" }), _jsx("img", { src: BDSPLinkCode, alt: "Sala Uni\u00F3n paso 2", className: "rounded-lg shadow my-2 mx-auto max-w-xs" })] })),
    },
    {
        question: '¿Cómo recibir Pokémon en Leyendas Pokémon: Arceus?',
        answer: (_jsxs(_Fragment, { children: [_jsx("p", { className: "mb-2", children: "Para intercambiar en Leyendas Arceus:" }), _jsxs("ol", { className: "list-decimal ml-6 my-2 text-left", children: [_jsxs("li", { children: ["Habla con Simona en el", ' ', _jsx("b", { children: "Puesto de Intercambio" }), " (Trading Post) en Villa Jubileo."] }), _jsxs("li", { children: ["Selecciona ", _jsx("b", { children: "Intercambiar Pok\u00E9mon" }), " y luego", ' ', _jsx("b", { children: "Usar c\u00F3digo de enlace" }), "."] }), _jsx("li", { children: "Introduce el c\u00F3digo que te damos y espera a que nos conectemos." })] }), _jsx("img", { src: tradingpost, alt: "Trading Post paso 1", className: "rounded-lg shadow my-2 mx-auto max-w-xs" })] })),
    },
    {
        question: '¿Cómo recibir Pokémon en Pokémon Let’s Go Pikachu/Eevee?',
        answer: (_jsxs(_Fragment, { children: [_jsx("p", { className: "mb-2", children: "Pasos para intercambiar en Let\u2019s Go:" }), _jsxs("ol", { className: "list-decimal ml-6 my-2 text-left", children: [_jsxs("li", { children: ["Abre el men\u00FA de comunicaci\u00F3n y selecciona", ' ', _jsx("b", { children: "Intercambio en conexi\u00F3n" }), " (Link Trade)."] }), _jsx("li", { children: "Elige los iconos en el orden que te indicamos (en vez de un c\u00F3digo num\u00E9rico)." }), _jsx("li", { children: "Confirma y espera a que nos conectemos para el intercambio." })] })] })),
    },
    // --- Preguntas generales ---
    {
        question: '¿Es seguro recibir Pokémon de PokéGenetic?',
        answer: (_jsx(_Fragment, { children: _jsx("p", { children: "S\u00ED, todos los Pok\u00E9mon generados cumplen con los est\u00E1ndares legales del juego y pasan los controles de Pok\u00E9mon HOME y el propio juego. No se utilizan hacks ni m\u00E9todos ilegales." }) })),
    },
    {
        question: '¿Puedo personalizar mis Pokémon?',
        answer: (_jsxs(_Fragment, { children: [_jsx("p", { children: "\u00A1Por supuesto! Puedes elegir naturaleza, IVs, EVs, movimientos, objeto, teratipo y mucho m\u00E1s. La app est\u00E1 pensada para darte la m\u00E1xima flexibilidad." }), _jsx("p", { className: "mt-3 mb-1 font-semibold", children: "\uD83D\uDEE0\uFE0F Importante:" }), _jsxs("p", { children: ["Los Pok\u00E9mon obtenidos desde packs de intercambio, creados desde cero, o importados desde Showdown se pueden editar sin problemas.", _jsx("br", {}), "Sin embargo, los Pok\u00E9mon obtenidos por captura o eclosi\u00F3n en los minijuegos no pueden ser modificados, ya que su esencia est\u00E1 ligada al resultado del juego."] })] })),
    },
    {
        question: '¿Cuánto tiempo tarda en llegar mi pedido?',
        answer: (_jsx(_Fragment, { children: _jsx("p", { children: "Normalmente, los pedidos se entregan en menos de 24 horas. En eventos de alta demanda, puede demorar un poco m\u00E1s, pero siempre recibir\u00E1s actualizaciones por Instagram o correo." }) })),
    },
    {
        question: '¿Con qué juegos es compatible PokéGenetic?',
        answer: (_jsxs(_Fragment, { children: [_jsx("p", { className: "mb-2", children: "Pok\u00E9Genetic ofrece soporte para los siguientes juegos de Nintendo Switch:" }), _jsxs("ul", { className: "list-disc ml-6 my-2 text-left", children: [_jsx("li", { children: "Pok\u00E9mon Escarlata y P\u00FArpura" }), _jsx("li", { children: "Pok\u00E9mon Espada y Escudo" }), _jsx("li", { children: "Leyendas Pok\u00E9mon: Arceus" }), _jsx("li", { children: "Diamante Brillante y Perla Reluciente" }), _jsx("li", { children: "Pok\u00E9mon Let's Go Pikachu/Eevee" })] }), _jsxs("p", { className: "mb-2", children: ["Actualmente, la web app permite autogesti\u00F3n solo para Pok\u00E9mon Escarlata y P\u00FArpura, es decir, puedes crear y gestionar Pok\u00E9mon directamente desde la plataforma.", _jsx("br", {}), "Pr\u00F3ximamente habilitaremos compatibilidad completa con los dem\u00E1s juegos."] }), _jsxs("p", { children: ["\uD83D\uDCF2 Si necesitas soporte para otro juego, puedes contactarnos directamente a trav\u00E9s de nuestro bot\u00F3n de", ' ', _jsx("a", { href: "https://wa.me/5491134533666", target: "_blank", rel: "noopener noreferrer", className: "text-green-600 underline font-semibold", children: "WhatsApp" }), ' ', "o nuestras redes sociales."] })] })),
    },
    {
        question: '¿Cómo puedo contactar para dudas o soporte?',
        answer: (_jsx(_Fragment, { children: _jsxs("p", { children: ["Puedes escribir por mensaje directo en", ' ', _jsx("a", { href: "https://instagram.com/pokegenetic", target: "_blank", rel: "noopener noreferrer", className: "text-pink-500 underline", children: "Instagram" }), ' ', "o por", ' ', _jsx("a", { href: "https://wa.me/5491134533666", target: "_blank", rel: "noopener noreferrer", className: "text-green-600 underline font-semibold", children: "WhatsApp" }), ". \u00A1Siempre respondemos!"] }) })),
    },
];
const Accordion = () => {
    const [openIndex, setOpenIndex] = useState(null);
    return (_jsx("div", { className: "w-full max-w-2xl mx-auto mt-8", children: faqData.map((faq, idx) => (_jsxs("div", { className: "mb-4 rounded-xl overflow-hidden shadow-sm relative group", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-pink-500/5 to-blue-500/5 opacity-50 transition-opacity duration-300 group-hover:opacity-80" }), _jsxs("button", { className: "w-full min-h-[60px] flex justify-between items-center px-4 py-3 text-left font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:ring-opacity-50 relative bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/80", onClick: () => setOpenIndex(openIndex === idx ? null : idx), "aria-expanded": openIndex === idx, children: [_jsx("span", { className: `${openIndex === idx ? 'font-bold text-gray-900' : 'text-gray-800'} transition-colors duration-300 text-sm sm:text-base pr-2 line-clamp-2`, children: faq.question }), _jsx("div", { className: `ml-1 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${openIndex === idx ? 'bg-pink-500' : 'bg-gray-200'} transition-all duration-300`, children: _jsx("span", { className: "text-white font-bold text-xs", children: openIndex === idx ? '−' : '+' }) })] }), openIndex === idx && (_jsx("div", { className: "px-4 pt-2 pb-4 text-gray-700 text-xs sm:text-sm bg-white/60 animate-fade-in border-t border-pink-100/30", children: faq.answer }))] }, idx))) }));
};
export default function FAQ() {
    return (_jsxs("div", { className: "flex flex-col items-center px-4 pt-6 pb-10 text-center min-h-screen bg-gradient-to-b from-transparent via-fuchsia-50/70 to-purple-50/70", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "Preguntas Frecuentes" }), _jsx("p", { className: "text-xs sm:text-sm text-gray-500 mb-4 max-w-xl", children: "Encuentra respuestas a las dudas m\u00E1s comunes sobre nuestra plataforma y el proceso de intercambio de Pok\u00E9mon." }), _jsx(Accordion, {})] }));
}
