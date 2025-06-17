export const calcularTapsObjetivo = (combatienteActual, gimnasioActual, pokemonActual) => {
    if (combatienteActual === 'entrenador') {
        return 30 + (gimnasioActual * 8) + (pokemonActual * 5);
    }
    else {
        return 60 + (gimnasioActual * 20) + (pokemonActual * 15);
    }
};
export const calcularTiempoBase = (combatienteActual, gimnasioActual) => {
    if (combatienteActual === 'entrenador') {
        return 12 + (gimnasioActual * 1); // Menos tiempo para entrenadores
    }
    else {
        return 20 + (gimnasioActual * 2); // Más tiempo para líderes
    }
};
export const obtenerPokemonActual = (gimnasio, combatienteActual, entrenadorActual, pokemonActual) => {
    if (combatienteActual === 'entrenador') {
        return gimnasio.entrenadores[entrenadorActual].pokemon[pokemonActual];
    }
    else {
        return gimnasio.pokemon[pokemonActual];
    }
};
export const obtenerNombreOponente = (gimnasio, combatienteActual, entrenadorActual) => {
    if (combatienteActual === 'entrenador') {
        return gimnasio.entrenadores[entrenadorActual].nombre;
    }
    else {
        return gimnasio.nombre;
    }
};
export const obtenerSpriteOponente = (gimnasio, combatienteActual, entrenadorActual) => {
    if (combatienteActual === 'entrenador') {
        return gimnasio.entrenadores[entrenadorActual].sprite;
    }
    else {
        return gimnasio.sprite;
    }
};
export const esUltimoPokemon = (gimnasio, combatienteActual, entrenadorActual, pokemonActual) => {
    if (combatienteActual === 'entrenador') {
        return pokemonActual === gimnasio.entrenadores[entrenadorActual].pokemon.length - 1;
    }
    else {
        return pokemonActual === gimnasio.pokemon.length - 1;
    }
};
