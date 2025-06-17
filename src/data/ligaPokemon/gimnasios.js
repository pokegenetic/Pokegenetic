// Importar sprites de medallas
import BoulderBadge from '../../img/badges/kanto/BoulderBadge.png';
import CascadeBadge from '../../img/badges/kanto/CascadeBadge.png';
import ThunderBadge from '../../img/badges/kanto/ThunderBadge.png';
import RainbowBadge from '../../img/badges/kanto/RainbowBadge.png';
import SoulBadge from '../../img/badges/kanto/SoulBadge.png';
import MarshBadge from '../../img/badges/kanto/MarshBadge.png';
import VolcanoBadge from '../../img/badges/kanto/VolcanoBadge.png';
import EarthBadge from '../../img/badges/kanto/EarthBadge.png';
export const GIMNASIOS_KANTO = [
    {
        id: 1,
        nombre: 'Brock',
        tipo: 'Roca',
        color: 'from-amber-600 to-orange-700',
        pokemon: ['Geodude', 'Graveler', 'Onix', 'Golem'],
        sprite: 'https://archives.bulbagarden.net/media/upload/1/1c/Spr_B2W2_Brock.png',
        medalla: {
            nombre: 'Medalla Roca',
            emoji: '🗿',
            sprite: BoulderBadge
        },
        entrenadores: [
            { nombre: 'Alpinista Carlos', pokemon: ['Geodude', 'Onix'], sprite: 'https://archives.bulbagarden.net/media/upload/3/30/Spr_B2W2_Backpacker_M.png' },
            { nombre: 'Excursionista Ana', pokemon: ['Graveler', 'Machop'], sprite: 'https://archives.bulbagarden.net/media/upload/7/7c/Spr_B2W2_Backpacker_F.png' }
        ],
        recompensas: { pokeballs: 2, fichas: 15 }
    },
    {
        id: 2,
        nombre: 'Misty',
        tipo: 'Agua',
        color: 'from-blue-400 to-cyan-600',
        pokemon: ['Staryu', 'Psyduck', 'Goldeen', 'Starmie'],
        sprite: 'https://archives.bulbagarden.net/media/upload/b/b1/Spr_B2W2_Misty.png',
        medalla: {
            nombre: 'Medalla Cascada',
            emoji: '💧',
            sprite: CascadeBadge
        },
        entrenadores: [
            { nombre: 'Nadador Luis', pokemon: ['Tentacool', 'Horsea'], sprite: 'https://archives.bulbagarden.net/media/upload/4/4e/Spr_B2W2_Swimmer_M.png' },
            { nombre: 'Nadadora María', pokemon: ['Goldeen', 'Seaking'], sprite: 'https://archives.bulbagarden.net/media/upload/8/88/Spr_B2W2_Swimmer_F.png' }
        ],
        recompensas: { pokeballs: 2, fichas: 18 }
    },
    {
        id: 3,
        nombre: 'Lt. Surge',
        tipo: 'Eléctrico',
        color: 'from-yellow-400 to-amber-500',
        pokemon: ['Pikachu', 'Voltorb', 'Magnemite', 'Raichu'],
        sprite: 'https://archives.bulbagarden.net/media/upload/7/7a/Spr_B2W2_Lt_Surge.png',
        medalla: {
            nombre: 'Medalla Trueno',
            emoji: '⚡',
            sprite: ThunderBadge
        },
        entrenadores: [
            { nombre: 'Ingeniero Pedro', pokemon: ['Magnemite', 'Voltorb'], sprite: 'https://archives.bulbagarden.net/media/upload/a/a5/Spr_B2W2_Engineer.png' },
            { nombre: 'Soldado Rick', pokemon: ['Pikachu', 'Electabuzz'], sprite: 'https://archives.bulbagarden.net/media/upload/f/ff/Spr_B2W2_Gentleman.png' }
        ],
        recompensas: { pokeballs: 2, fichas: 20 }
    },
    {
        id: 4,
        nombre: 'Erika',
        tipo: 'Planta',
        color: 'from-green-400 to-emerald-600',
        pokemon: ['Oddish', 'Bellsprout', 'Tangela', 'Vileplume'],
        sprite: 'https://archives.bulbagarden.net/media/upload/4/47/Spr_B2W2_Erika.png',
        medalla: {
            nombre: 'Medalla Arcoíris',
            emoji: '🌸',
            sprite: RainbowBadge
        },
        entrenadores: [
            { nombre: 'Jardinera Rosa', pokemon: ['Oddish', 'Gloom'], sprite: 'https://archives.bulbagarden.net/media/upload/5/5c/Spr_B2W2_Lass.png' },
            { nombre: 'Florista Carmen', pokemon: ['Bellsprout', 'Weepinbell'], sprite: 'https://archives.bulbagarden.net/media/upload/f/f4/Spr_B2W2_Beauty.png' }
        ],
        recompensas: { pokeballs: 3, fichas: 22 }
    },
    {
        id: 5,
        nombre: 'Koga',
        tipo: 'Veneno',
        color: 'from-purple-500 to-violet-700',
        pokemon: ['Koffing', 'Grimer', 'Golbat', 'Crobat'],
        sprite: 'https://archives.bulbagarden.net/media/upload/2/2c/Spr_B2W2_Koga.png',
        medalla: {
            nombre: 'Medalla Alma',
            emoji: '☠️',
            sprite: SoulBadge
        },
        entrenadores: [
            { nombre: 'Ninja Akira', pokemon: ['Koffing', 'Grimer'], sprite: 'https://archives.bulbagarden.net/media/upload/4/46/Spr_B2W2_Juggler.png' },
            { nombre: 'Kunoichi Yuki', pokemon: ['Golbat', 'Arbok'], sprite: 'https://archives.bulbagarden.net/media/upload/5/5c/Spr_B2W2_Lass.png' }
        ],
        recompensas: { pokeballs: 3, fichas: 25 }
    },
    {
        id: 6,
        nombre: 'Sabrina',
        tipo: 'Psíquico',
        color: 'from-pink-400 to-rose-600',
        pokemon: ['Abra', 'Kadabra', 'Mr. Mime', 'Alakazam'],
        sprite: 'https://archives.bulbagarden.net/media/upload/7/7a/Spr_B2W2_Sabrina.png',
        medalla: {
            nombre: 'Medalla Pantano',
            emoji: '🔮',
            sprite: MarshBadge
        },
        entrenadores: [
            { nombre: 'Médium Elena', pokemon: ['Abra', 'Kadabra'], sprite: 'https://archives.bulbagarden.net/media/upload/c/c3/Spr_B2W2_Psychic_F.png' },
            { nombre: 'Psíquico Marco', pokemon: ['Drowzee', 'Hypno'], sprite: 'https://archives.bulbagarden.net/media/upload/a/ae/Spr_B2W2_Psychic_M.png' }
        ],
        recompensas: { pokeballs: 3, fichas: 28 }
    },
    {
        id: 7,
        nombre: 'Blaine',
        tipo: 'Fuego',
        color: 'from-red-500 to-orange-600',
        pokemon: ['Growlithe', 'Ponyta', 'Magmar', 'Arcanine'],
        sprite: 'https://archives.bulbagarden.net/media/upload/6/6b/Spr_B2W2_Blaine.png',
        medalla: {
            nombre: 'Medalla Volcán',
            emoji: '🔥',
            sprite: VolcanoBadge
        },
        entrenadores: [
            { nombre: 'Domador de Fuego Raúl', pokemon: ['Growlithe', 'Ponyta'], sprite: 'https://archives.bulbagarden.net/media/upload/1/15/Spr_B2W2_Burglar.png' },
            { nombre: 'Investigador Ígneo Dr. Lava', pokemon: ['Magmar', 'Rapidash'], sprite: 'https://archives.bulbagarden.net/media/upload/f/f2/Spr_B2W2_Scientist.png' }
        ],
        recompensas: { pokeballs: 3, fichas: 30 }
    },
    {
        id: 8,
        nombre: 'Giovanni',
        tipo: 'Tierra',
        color: 'from-stone-600 to-neutral-800',
        pokemon: ['Rhyhorn', 'Dugtrio', 'Nidoqueen', 'Nidoking'],
        sprite: 'https://archives.bulbagarden.net/media/upload/8/86/Spr_B2W2_Giovanni.png',
        medalla: {
            nombre: 'Medalla Tierra',
            emoji: '🌍',
            sprite: EarthBadge
        },
        entrenadores: [
            { nombre: 'Recluta Rocket Jake', pokemon: ['Rhyhorn', 'Sandslash'], sprite: 'https://archives.bulbagarden.net/media/upload/7/74/Spr_B2W2_Team_Rocket_Grunt_M.png' },
            { nombre: 'Admin Rocket Jessie', pokemon: ['Nidoqueen', 'Dugtrio'], sprite: 'https://archives.bulbagarden.net/media/upload/0/00/Spr_B2W2_Team_Rocket_Grunt_F.png' }
        ],
        recompensas: { pokeballs: 4, fichas: 35 }
    }
];
