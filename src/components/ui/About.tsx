import React from 'react';
import aboutImg from '@/img/about.png';

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white/50 dark:bg-gray-900/50 rounded-2xl shadow-lg p-6 flex flex-col gap-6 border border-gray-200/70 dark:border-gray-700/60">
        <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Todo comenzó con un cartucho azul y un Game Boy Color en las manos.</h1>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={aboutImg}
            alt="PokéGenetic About"
            className="w-64 h-64 object-contain rounded-xl shadow-md mb-2 md:mb-0 md:mr-6 flex-shrink-0"
          />
          <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed space-y-4 text-justify [text-align-last:center]">
            <p><span className="font-bold">Era Pokémon Azul</span>, y con él descubrí por primera vez el mundo de los Pokémon.</p>
            <p>Ahí, sin saberlo, empezó una historia de conexión profunda con estas criaturas pixeladas que, con el tiempo, se volverían parte de mi vida. Luego vino <span className="font-bold">Pokémon Cristal</span>, donde logré capturar <span className="font-bold">250 Pokémon… pero nunca a Celebi</span>. Ese último, el número 251 de la Pokédex, solo podía conseguirse mediante un evento especial exclusivo de Japón. Para muchos —incluyéndome— fue una ilusión inalcanzable, que quedó suspendida en el tiempo, como tantas cosas que nos marcan cuando somos chicos.</p>
            <p>Los días del <span className="font-bold">Link Cable</span> quedaron atrás, y durante mucho tiempo no volví a jugar. Hasta que llegó <span className="font-bold">Nintendo Switch</span>, y con <span className="font-bold">Espada y Escudo</span> redescubrí esa chispa. Como adulto, ahora con más herramientas y curiosidad, me lancé a investigar cómo obtener aquellos Pokémon que en mi infancia parecían imposibles. Y en ese proceso, nació algo mucho más grande que solo completar una Pokédex.</p>
            <p><span className="font-bold">PokéGenetic</span> surge desde ese viaje personal, como un puente entre la nostalgia y la tecnología, entre el cariño de antaño y las posibilidades de hoy. Lo que empezó como una exploración propia, se convirtió en una comunidad en Instagram y ahora en esta web app: un espacio pensado para ti, para que puedas visualizar tus Pokémon, explorar opciones y diseñar tus equipos con facilidad, reuniendo toda la información de PokéGenetic en un solo lugar.</p>
            <p>La idea es <span className="font-bold">hacerte el camino más claro, más cómodo, y darte más libertad</span> para explorar lo que puedes construir con tu equipo.</p>
            <p className="font-semibold text-center text-lg mt-4">Bienvenid@ a PokéGenetic.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
