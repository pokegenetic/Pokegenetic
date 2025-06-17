import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
// Recomendaciones reales extraídas del CSV (solo usuarios distintos de 'pokegenetic' y comentarios que no empiezan con '@')
const RECOMENDACIONES = [
    { usuario: "@e.osovngas", texto: "Excelente servicio. Yo ya he comprado 2 terapack, 2 ditto shiny japonés. me perdí los eventos de ondulagua y ferroverdor y gracias a pokegenetic pude conseguirlos. Excelente servicio. Muchas gracias tío pokegenetic estoy ala espera de algún evento." },
    { usuario: "@marcotzoee", texto: "ESPECTACULAR!!! Feliz, muy buena onda" },
    { usuario: "@nacholuna", texto: "Son bakanes y super dedicados ❤️" },
    { usuario: "@misterdiaz91", texto: "Hace minutos hice mi pedido y es super confiable y rápido super recomendable 👏" },
    { usuario: "@epyon.04", texto: "He usado su servicio como 4 o 5 veces ya creo y nada que decir se toma el tiempo para preguntar lo que quieres como lo quieres y también te puedes organizar con él para el tiempo de entrega 10/10 en atención y servicio recomendado" },
    { usuario: "@cindy_kent11", texto: "He usado su servicio, son muy atentos, me tuvieron paciencia ya que soy de otro país 100 % recomendado 👍 en cuanto uno paga te dan los pokemones me encantó 💕 🤩" },
    { usuario: "@aofushi_gensui", texto: "Uff. 1000 % recomendados. Una experiencia agradable, servicial, confiable, cómoda, puntuales y siempre disponibles para el cliente.  No tenga más palabras que agradecerles por toda la atención y soporte que me dieron. Las palabras se quedan muy cortas.  Lo vale. No se arrepentirán. De verdad muchas gracias 😊. 💯 de 💯.❤️." },
    { usuario: "@diego._rb", texto: "Muy recomendable y muy buena voluntad para todo" },
    { usuario: "@ang_mag", texto: "Es un servicio rápido, seguro, con trato personalizado y de calidad. Indiscutiblemente el precio lo vale. Con completa confianza. ¡ E X C E L E N T E !" },
    { usuario: "@felipemillanflores", texto: "Atienden bien, tienen paciencia y muy buen servicio" },
    { usuario: "@alejandro.rg.92.7", texto: "Muy buen servicio" },
    { usuario: "@_yeisser_", texto: "Lo mejor" },
    { usuario: "@marcoantonio.gomezvilchis", texto: "Excelente servicio, todo fue sencillo, rápido y muy confiable, sin dudarlo compraré más Pokémon." },
    { usuario: "@mithrandir_evans", texto: "Son espectaculares" },
    { usuario: "@rochan2012", texto: "Excelente 100% recomendado 😉👍🏻" },
    { usuario: "@used_corpse", texto: "Muy bueno! Me compré un ditto japonés y un clodsire customisado, recomendado para cualquiera que quiere un Pokémon en específico o le gusta la idea de criar con algún ditto japonés y eso :)" },
    { usuario: "@tirsooviedo", texto: "Super recomendable se porto increíble y fue al momento el intercambio" },
    { usuario: "@chris_carvajalv", texto: "Muy buen servicio recomendable y confiables" },
    { usuario: "@gersonn42", texto: "Muy confiable y exelente servicio los chicos" },
    { usuario: "@real.kachorro", texto: "Acabo de sacar los 2 de Escarlata que me faltaban gracias a ellos. Rápidos, transparentes y confiables, muy agradecido!" },
    { usuario: "@diegosaaac", texto: "Excelente te servicio" },
    { usuario: "@el_elmo.28", texto: "Exelente servicio 🙌" },
    { usuario: "@erenn.pdf", texto: "Es un servicio de pana, yo compre la dex completa hasta Alola y hasta me hizo precio por un pack completo con shinys, de panini" },
    { usuario: "@maaty_aranguiz", texto: "100%confiables" },
    { usuario: "@davidcntreras", texto: "Son lo máximo! 👏" },
    { usuario: "@keeviints", texto: "100% real, me completaron la pokedex y hasta en shiny 👏👏👏" },
    { usuario: "@freak.diamond", texto: "Una maravilla, rápido y 100% confiable. Jamás ha fallado 💝💝💝" },
    { usuario: "@chris_dalidet", texto: "Excelente 100%recomendable....." },
    { usuario: "@nicowolleter", texto: "100% confiables, te guían en el proceso y sobre todo pacientes, les compré al poco de empezar con la consola y no tenía idea de nada. Altamente recomendable" },
    { usuario: "@shaggypothers", texto: "Excelente servio es más feliz es mi hijo 👏👏👏👏👏👏👏" },
    { usuario: "@vhfn1991", texto: "Recomendado 10/10" },
    { usuario: "@efe.martinz", texto: "Todo bcn y siempre rápido 🔥" },
    { usuario: "@joaquino_14", texto: "Excelente servicio ❤️" },
    { usuario: "@_yeisser_", texto: "100% excelente servicio 💪❤️" },
    { usuario: "@ke.espina", texto: "Yo lo recomiendo 110%, hasta el día de hoy sigo utilizando el servicio para crear mis equipos competitivos vgc, además están los pokes libres de baneo y el nombre del entrenador es el mismo que tu avatar" },
    { usuario: "@omniimpotente", texto: "Un súper trato, amable, le dieron todo el color a mi Pokémon Home, es hermoso gracias a este servicio, apenas tenga la subscripción de nuevo volveré con @pokegenetic3 (ay me emocioné 🥺)" },
    { usuario: "@buenaeljose", texto: "Excelentisimo servicio !" },
    { usuario: "@kevin13.khv", texto: "El servicio es excelente, fue super rapido y totalmente coordial. Lejos el mejor servicio👏👏🏼👏" },
    { usuario: "@genavalch", texto: "Recomiendo 🙌" },
    { usuario: "@rockopsx", texto: "Compré unos pokes y a los minutos estábamos haciendo el cambio. Súper recomendable!!" },
    { usuario: "@manu_inostroza", texto: "Excelente servicio 😁" },
    { usuario: "@pacita_morena", texto: "Excelente servicio 👍" },
    { usuario: "@kevinsebatorres", texto: "El master de master" },
    { usuario: "@cokeccontreras", texto: "Lejos lo mejor y lo más confiable !!" },
    { usuario: "@joe_d_c9", texto: "Excelente servicio , muy amigable, muy rapido y sin ninguna falla" },
    { usuario: "@joe_d_c9", texto: "10/10 🔥🔥🔥🔥" },
    { usuario: "@snowloud", texto: "Excelente servicio 🤝🏼 los cabros se merecen unas 🍻" },
    { usuario: "@mack_commando", texto: "100% recomendable, cero atados en las transferencias y super preocupado." },
    { usuario: "@alvarojsgarcia", texto: "Son bakanes" },
    { usuario: "@sumajestadelreydelcompleto", texto: "Buen servicio mis wachos" },
    { usuario: "@memtejo", texto: "😍" },
    { usuario: "@psuarez92", texto: "Lo he usado desde shield/sword y de ahí en cada juego que ha salido. Siempre muy buena experiencia, responde rápido, se adapta a tus tiempos y necesidades del juego y siempre muy buen trato. 100000% recomendable👏👏👏🔥🔥" },
    { usuario: "@lucho_6_c", texto: "Yo le he comprado desde antes, y nunca he tenido problemas, no con los Pokémon, ni nada por el estilo. De hecho, cuando pides un Pokémon, te pregunta cómo lo quieres y todo, y si no sabes las naturalezas y esas cosas como yo, te manda la mejor opción siempre. Sin contar, que apenas le escribes para pedir Pokémon, te responde de inmediato y siempre es súper claro con los tratos. El que quiera algún Pokémon, @pokegenetic3 es lo mejor que te puedo recomendar" },
    { usuario: "@michellosher", texto: "Tiene mucha paciencia para explicarle al usuario, buena disposición, abierto al diálogo si es que es necesario, es confiable, mantiene dinámicas de sorteo con sus seguidores y siempre mantiene un buen trato contigo. ¡Lo recomiendo! 👌😜" },
    { usuario: "@tiendaelmonochino", texto: "Super hiper recomendado!! Confiable y rápido, se agradece lo que hacen!" },
    { usuario: "@maortega.28", texto: "a pesar de no usar el servicio si o si es recomendado, estan atentos a todo y realmente se preocupan de gestionar todo bien" },
    { usuario: "@0scarcg", texto: "Super Recomendable!! 🙌" },
    { usuario: "@onikomorin", texto: "Lo conocí hace poquito, super confiable y puntual!! No me pierdo ningún reparto , siempre que puedo paso el dato por stream 💖" },
    { usuario: "@franban26", texto: "Excelente! Te responde súper rápido! 🩵 y Pokemon 💪🏽" },
    { usuario: "@curs3d_s0ul", texto: "Es tremendo servicio, apaña a todas las opciones y experimentos que uno quiera intentar. Después de Arceus está pokegenetic jejeje 🔥✨🥳" },
    { usuario: "@angelolmosquispe", texto: "Muy confiables!!!" },
    { usuario: "@ivaneduardo1994", texto: "100% recomendable yo le he comprado varios pokemon 🙌" },
    { usuario: "@andreu23m", texto: "Son los mejores!!! Totalmente feliz y satisfecho con el servicio 😍🙌🏼" },
    { usuario: "@marasilo04", texto: "Los mejores sigan así 🙌" },
    { usuario: "@sebasgali", texto: "Muchas gracias por su ayuda! Los amo ❤️" },
    { usuario: "@criscamposc", texto: "Super confiables, muy recomendados." },
    { usuario: "@marioroce", texto: "Muy buena atención, siempre disponibles! 💪🏼" },
    { usuario: "@chich0_", texto: "Ya lo he usado como 3 veces súper recomendado" },
    { usuario: "@mameitorv2", texto: "Excelente serivicio! Se nota la dedicación, tiempo, conocimiento y amor con lo que hacen ♥️ se recomienda ampliamente 🙌🏻" },
    { usuario: "@eljuanmel", texto: "rapido y sencillo, feliz con mi ditto shaiiniii" },
    { usuario: "@iscooo______", texto: "Muy buen trabajo, profesional, serio y muy amable !! Amigo haces realidad nuestros caprichos jajajajaja ❤️ sos un crack" },
    { usuario: "@geoninleon", texto: "Excelente servicio" },
    { usuario: "@diego.nuvi", texto: "Super confiablee!!!" },
    { usuario: "@l0ratadina", texto: "Excelente servicio siempre. Nada que decir, me ha ayudado desde espada y escudo con mis requerimientos. Un siete ❤️🔥" },
    { usuario: "@thenovas_asylum", texto: "El mejor Servicio, demasiado confiable y siempre atento 🔥" },
    { usuario: "@se_tattoo", texto: "Los mejores,super capos en lo suyo🔥🔥🔥" },
    { usuario: "@andyfergil94", texto: "De momento sólo he participado en los repartos de Pokémon gratuitos, pero aún así estoy muy satisfecho con los pokes que he conseguido gracias a vosotros😉😊" },
    { usuario: "@zegabo", texto: "Impecable servicio, desde sword and shield que lo uso, recomendado siempre" },
];
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
export default function RecomendacionesHero() {
    const [reco, setReco] = useState(() => getRandomItem(RECOMENDACIONES));
    useEffect(() => {
        const interval = setInterval(() => {
            setReco(getRandomItem(RECOMENDACIONES));
        }, 6000);
        return () => clearInterval(interval);
    }, []);
    return (_jsxs("div", { className: "w-full flex flex-col items-center justify-center mt-8 mb-2", children: [_jsx("div", { className: "p-1 rounded-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 w-full max-w-md mx-auto", children: _jsxs("div", { className: "relative w-full rounded-xl flex flex-col items-center animate-fade-in bg-clip-padding px-6 py-5 shadow-xl", style: {
                        background: 'rgba(255,255,255,)',
                        backdropFilter: 'blur(2px)',
                    }, children: [_jsxs("p", { className: "text-m sm:text-m font-bold text-white-800 text-center italic mb-2 drop-shadow-md", style: { textShadow: '0 1px 8px #fff8' }, children: ["\u201C", reco.texto, "\u201D"] }), _jsx("span", { className: "text-xs font-bold text-gray-800 flex items-center gap-1 drop-shadow-md", children: reco.usuario })] }) }), _jsx("a", { href: "https://www.instagram.com/p/Cq9EOrsvpVV/", target: "_blank", rel: "noopener noreferrer", className: "text-[#E4405F] underline hover:text-[#C13584] transition-colors" })] }));
}
