import React, { useState } from 'react';
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
		answer: (
			<>
				<p className="mb-6 text-left">
					Sí. Para poder recibir packs masivos (como Pokédex completas o grandes
					cantidades de Pokémon), necesitas tener activa la suscripción Home
					Premium. Esto se debe a que la versión gratuita de Pokémon Home solo
					permite almacenar hasta 30 espacios, lo que no es suficiente para
					transferencias grandes.
					<br />
					<br />
					Con Home Premium, desbloqueas todo el almacenamiento disponible y puedes
					mover sin problemas todos los Pokémon de un pack a tu cuenta.
					<br />
					<br />
					<b>Importante:</b> Si decides dejar de pagar la suscripción Premium, los
					Pokémon que ya estén almacenados no se eliminarán. Sin embargo, solo
					podrás acceder a los primeros 30 espacios (es decir, la primera caja). El
					resto permanecerá guardado, pero no será accesible mientras no reactives
					el plan Premium.
				</p>
			</>
		),
	},
	{
		question: '¿Necesito tener Nintendo Switch Online para poder recibir mis Pokémon?',
		answer: (
			<>
				<p className="mb-6 text-left">
					Sí. Para poder realizar intercambios en línea y recibir tus Pokémon directamente en tu juego, necesitas tener una suscripción activa a Nintendo Switch Online. Este servicio es obligatorio para todas las funciones en línea del juego, incluyendo los intercambios con otros jugadores o con bots.<br /><br />
					Si no tienes Nintendo Switch Online, no podrás conectarte a internet desde el juego, lo que hace imposible completar el proceso de entrega.
				</p>
			</>
		),
	},
	{
		question: '¿Cómo recibir Pokémon en Pokémon Escarlata y Púrpura?',
		answer: (
			<>
				<p className="mb-2">
					Sigue estos pasos para intercambiar en Pokémon Escarlata y Púrpura:
				</p>
				<ol className="list-decimal ml-6 my-2 text-left">
					<li>Abre el menú principal y selecciona </li>
					<li>Poképortal</li>
					<li>Elige </li>
					<li>Introduce el código de intercambio que te proporcionamos.</li>
					<li>
						Confirma y espera a que nos conectemos para realizar el intercambio.
					</li>
				</ol>
				<img
					src={ScarletVioletTrade1}
					alt="Poképortal paso 1"
					className="rounded-lg shadow my-2 mx-auto max-w-xs"
				/>
				<img
					src={ScarletVioletTrade2}
					alt="Poképortal paso 2"
					className="rounded-lg shadow my-2 mx-auto max-w-xs"
				/>
			</>
		),
	},
	{
		question: '¿Cómo recibir Pokémon en Pokémon Espada y Escudo?',
		answer: (
			<>
				<p className="mb-2">Para intercambiar en Espada y Escudo:</p>
				<ol className="list-decimal ml-6 my-2 text-left">
					<li>Abre el menú de </li>
					<li>Y-Comm</li>
					<li>Selecciona </li>
					<li>Elige </li>
					<li>Confirma y espera a que nos conectemos para el intercambio.</li>
				</ol>
				<img
					src={SHYComm}
					alt="Y-Comm paso 1"
					className="rounded-lg shadow my-2 mx-auto max-w-xs"
				/>
				<img
					src={SHLinkCode}
					alt="Y-Comm paso 2"
					className="rounded-lg shadow my-2 mx-auto max-w-xs"
				/>
			</>
		),
	},
	{
		question: '¿Cómo recibir Pokémon en Diamante Brillante y Perla Reluciente (BDSP)?',
		answer: (
			<>
				<p className="mb-2">Pasos para intercambiar en BDSP:</p>
				<ol className="list-decimal ml-6 my-2 text-left">
					<li>
						Dirígete a la{' '}
						<b>Sala Unión</b> (Union Room) desde cualquier Centro Pokémon.
					</li>
					<li>
						Habla con la recepcionista y selecciona{' '}
						<b>Entrar con código de enlace</b>.
					</li>
					<li>Introduce el código que te enviamos.</li>
					<li>Cuando estemos conectados, inicia el intercambio.</li>
				</ol>
				<img
					src={BDSPGlobal}
					alt="Sala Unión paso 1"
					className="rounded-lg shadow my-2 mx-auto max-w-xs"
				/>
				<img
					src={BDSPLinkCode}
					alt="Sala Unión paso 2"
					className="rounded-lg shadow my-2 mx-auto max-w-xs"
				/>
			</>
		),
	},
	{
		question: '¿Cómo recibir Pokémon en Leyendas Pokémon: Arceus?',
		answer: (
			<>
				<p className="mb-2">Para intercambiar en Leyendas Arceus:</p>
				<ol className="list-decimal ml-6 my-2 text-left">
					<li>
						Habla con Simona en el{' '}
						<b>Puesto de Intercambio</b> (Trading Post) en Villa Jubileo.
					</li>
					<li>
						Selecciona <b>Intercambiar Pokémon</b> y luego{' '}
						<b>Usar código de enlace</b>.
					</li>
					<li>Introduce el código que te damos y espera a que nos conectemos.</li>
				</ol>
				<img
					src={tradingpost}
					alt="Trading Post paso 1"
					className="rounded-lg shadow my-2 mx-auto max-w-xs"
				/>
			</>
		),
	},
	{
		question: '¿Cómo recibir Pokémon en Pokémon Let’s Go Pikachu/Eevee?',
		answer: (
			<>
				<p className="mb-2">Pasos para intercambiar en Let’s Go:</p>
				<ol className="list-decimal ml-6 my-2 text-left">
					<li>
						Abre el menú de comunicación y selecciona{' '}
						<b>Intercambio en conexión</b> (Link Trade).
					</li>
					<li>
						Elige los iconos en el orden que te indicamos (en vez de un código
						numérico).
					</li>
					<li>Confirma y espera a que nos conectemos para el intercambio.</li>
				</ol>
			</>
		),
	},
	// --- Preguntas generales ---
	{
		question: '¿Es seguro recibir Pokémon de PokéGenetic?',
		answer: (
			<>
				<p>
					Sí, todos los Pokémon generados cumplen con los estándares legales del
					juego y pasan los controles de Pokémon HOME y el propio juego. No se
					utilizan hacks ni métodos ilegales.
				</p>
			</>
		),
	},
	{
		question: '¿Puedo personalizar mis Pokémon?',
		answer: (
			<>
				<p>
					¡Por supuesto! Puedes elegir naturaleza, IVs, EVs, movimientos, objeto, teratipo y mucho más. La app está pensada para darte la máxima flexibilidad.
				</p>
				<p className="mt-3 mb-1 font-semibold">🛠️ Importante:</p>
				<p>
					Los Pokémon obtenidos desde packs de intercambio, creados desde cero, o importados desde Showdown se pueden editar sin problemas.<br />
					Sin embargo, los Pokémon obtenidos por captura o eclosión en los minijuegos no pueden ser modificados, ya que su esencia está ligada al resultado del juego.
				</p>
			</>
		),
	},
	{
		question: '¿Cuánto tiempo tarda en llegar mi pedido?',
		answer: (
			<>
				<p>
					Normalmente, los pedidos se entregan en menos de 24 horas. En eventos de
					alta demanda, puede demorar un poco más, pero siempre recibirás
					actualizaciones por Instagram o correo.
				</p>
			</>
		),
	},
	{
		question: '¿Con qué juegos es compatible PokéGenetic?',
		answer: (
			<>
				<p className="mb-2">
					PokéGenetic ofrece soporte para los siguientes juegos de Nintendo Switch:
				</p>
				<ul className="list-disc ml-6 my-2 text-left">
					<li>Pokémon Escarlata y Púrpura</li>
					<li>Pokémon Espada y Escudo</li>
					<li>Leyendas Pokémon: Arceus</li>
					<li>Diamante Brillante y Perla Reluciente</li>
					<li>Pokémon Let's Go Pikachu/Eevee</li>
				</ul>
				<p className="mb-2">
					Actualmente, la web app permite autogestión solo para Pokémon Escarlata
					y Púrpura, es decir, puedes crear y gestionar Pokémon directamente desde
					la plataforma.
					<br />
					Próximamente habilitaremos compatibilidad completa con los demás juegos.
				</p>
				<p>
					📲 Si necesitas soporte para otro juego, puedes contactarnos directamente
					a través de nuestro botón de{' '}
					<a
						href="https://wa.me/5491134533666"
						target="_blank"
						rel="noopener noreferrer"
						className="text-green-600 underline font-semibold"
					>
						WhatsApp
					</a>{' '}
					o nuestras redes sociales.
				</p>
			</>
		),
	},
	{
		question: '¿Cómo puedo contactar para dudas o soporte?',
		answer: (
			<>
				<p>
					Puedes escribir por mensaje directo en{' '}
					<a
						href="https://instagram.com/pokegenetic"
						target="_blank"
						rel="noopener noreferrer"
						className="text-pink-500 underline"
					>
						Instagram
					</a>{' '}
					o por{' '}
					<a
						href="https://wa.me/5491134533666"
						target="_blank"
						rel="noopener noreferrer"
						className="text-green-600 underline font-semibold"
					>
						WhatsApp
					</a>
					. ¡Siempre respondemos!
				</p>
			</>
		),
	},
];

const Accordion: React.FC = () => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	return (
		<div className="w-full max-w-2xl mx-auto mt-8">
			{faqData.map((faq, idx) => (
				<div
					key={idx}
					className="mb-4 rounded-xl overflow-hidden shadow-sm relative group"
				>
					<div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-pink-500/5 to-blue-500/5 opacity-50 transition-opacity duration-300 group-hover:opacity-80"></div>
					<button
						className="w-full min-h-[60px] flex justify-between items-center px-4 py-3 text-left font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:ring-opacity-50 relative bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/80"
						onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
						aria-expanded={openIndex === idx}
					>
						<span className={`${openIndex === idx ? 'font-bold text-gray-900' : 'text-gray-800'} transition-colors duration-300 text-sm sm:text-base pr-2 line-clamp-2`}>
							{faq.question}
						</span>
						<div className={`ml-1 flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${openIndex === idx ? 'bg-pink-500' : 'bg-gray-200'} transition-all duration-300`}>
							<span className="text-white font-bold text-xs">
								{openIndex === idx ? '−' : '+'}
							</span>
						</div>
					</button>
					{openIndex === idx && (
						<div className="px-4 pt-2 pb-4 text-gray-700 text-xs sm:text-sm bg-white/60 animate-fade-in border-t border-pink-100/30">
							{faq.answer}
						</div>
					)}
				</div>
			))}
		</div>
	);
};
export default function FAQ() {
	return (
		<div className="flex flex-col items-center px-4 pt-6 pb-10 text-center min-h-screen bg-gradient-to-b from-transparent via-fuchsia-50/70 to-purple-50/70">
			<h1 className="text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center">
				Preguntas Frecuentes
			</h1>
			<p className="text-xs sm:text-sm text-gray-500 mb-4 max-w-xl">
				Encuentra respuestas a las dudas más comunes sobre nuestra plataforma y el proceso de intercambio de Pokémon.
			</p>
			<Accordion />
		</div>
	);
}
