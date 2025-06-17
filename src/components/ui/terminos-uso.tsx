import { Link } from 'react-router-dom'

export default function TerminosUso() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors"
            >
              ← Volver al inicio
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Términos de Uso
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Última actualización: {new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mt-0">Términos de Uso de Pokegenetic</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p>
              Al utilizar la web app Pokegenetic, el usuario acepta los siguientes términos y condiciones. Se recomienda leer detenidamente antes de utilizar los servicios.
            </p>
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
            <h3 className="font-bold">1. Responsabilidad del Usuario</h3>
            <ul>
              <li>El uso de esta aplicación es responsabilidad exclusiva del usuario.</li>
              <li>Pokegenetic permite generar, importar o personalizar Pokémon legales compatibles con los juegos de Nintendo Switch. Sin embargo, el proceso de recepción de los Pokémon en la consola requiere una correcta configuración por parte del usuario (cuenta Nintendo, conexión online, espacio en el equipo, etc.).</li>
              <li>Pokegenetic no se hace responsable por errores, bloqueos, mal funcionamiento de la consola o del juego durante la entrega o uso de los Pokémon.</li>
              <li>El usuario asume la responsabilidad de contar con Pokémon de poco valor para realizar los intercambios requeridos en entregas vía intercambio.</li>
            </ul>
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
            <h3 className="font-bold">2. Entrega de Pokémon</h3>
            <ul>
              <li>Las entregas se realizarán dentro de un plazo máximo de 24 horas desde que el pedido ha sido recibido y confirmado.</li>
              <li>Una vez recibido el pedido, se verificará y se coordinará con el usuario el proceso de entrega mediante los canales disponibles.</li>
              <li>Para la entrega de Pokémon individuales, equipos o packs mediante intercambio, es obligatorio contar con Nintendo Switch Online y tener Pokémon disponibles para intercambiar.</li>
              <li>Para entregas mediante Pokémon HOME, el usuario debe contar con una cuenta activa de Pokémon HOME Premium. La entrega se realiza iniciando sesión mediante un enlace oficial de Nintendo, donde el usuario deberá ingresar su código de acceso. Todos los Pokémon del pack serán depositados directamente en su cuenta.</li>
            </ul>
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
            <h3 className="font-bold">3. Minijuegos y Recompensas Gratuitas</h3>
            <ul>
              <li>Pokegenetic ofrece minijuegos gratuitos como Pokémon Catch e Incubadoras, donde los usuarios pueden obtener Pokémon sin costo.</li>
              <li>Aunque estos Pokémon son generados gratuitamente, para recibirlos en la consola es necesario contar con al menos un Pokémon de pago en el equipo (ya sea individual o de pack).</li>
              <li>Las compras habilitan beneficios y objetos adicionales dentro de los minijuegos. Las compras de mayor valor activan mayores recompensas aleatorias.</li>
            </ul>
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
            <h3 className="font-bold">4. Descuentos y Promociones</h3>
            <ul>
              <li>Todas las compras que incluyan más de 6 Pokémon en el equipo recibirán automáticamente un 10% de descuento en el total.</li>
              <li>Los packs de intercambio también aplican dentro de esta promoción y suman para alcanzar el descuento.</li>
            </ul>
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
            <h3 className="font-bold">5. Legalidad y Compatibilidad</h3>
            <ul>
              <li>Pokegenetic utiliza parámetros avanzados para generar Pokémon completamente legales. Sin embargo, puede haber detalles o combinaciones que no estén completamente cubiertos por las reglas actuales del juego.</li>
              <li>En caso de detectarse incompatibilidades, Pokegenetic ajustará automáticamente el Pokémon a los parámetros más cercanos según la selección original, garantizando su legalidad y funcionamiento dentro del juego.</li>
            </ul>
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
            <h3 className="font-bold">6. Uso de Objetos y Beneficios</h3>
            <ul>
              <li>Las compras generan beneficios que pueden usarse dentro de los distintos minijuegos de la plataforma.</li>
              <li>La cantidad y tipo de recompensas obtenidas dependerán de variables como el valor del pedido y la configuración aleatoria de la app.</li>
            </ul>
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
            <h3 className="font-bold">7. Condiciones Generales</h3>
            <ul>
              <li>Pokegenetic no está afiliado, respaldado ni licenciado por Nintendo, Game Freak, Creatures Inc. o The Pokémon Company.</li>
              <li>El uso de esta aplicación debe hacerse de forma responsable. Al utilizar los servicios, el usuario acepta cumplir con estos Términos de Uso.</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} Pokegenetic. Todos los derechos reservados.
              </p>
              <Link 
                to="/"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
