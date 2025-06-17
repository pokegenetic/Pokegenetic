import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { playSoundEffect } from '@/lib/soundEffects';
import { getShowdownCryUrl } from '@/lib/getShowdownCryUrl';
import pokemonData from '@/data/sv/pokemon-sv.json';
import { addPokemonToTeam } from '@/lib/equipoStorage';
import { getRandomMovesForSpecies, getPokemonDetails } from '@/lib/pokedexHelper';
import { updateUserHatchedHistory } from '@/lib/userData';
import { useUser } from '../../context/UserContext';
import './bounce-animation.css';
// Lista de primeras etapas evolutivas permitidas (puedes expandirla)
const FIRST_STAGE_POKEMON = [
    'Bulbasaur', 'Charmander', 'Squirtle', 'Chikorita', 'Cyndaquil', 'Totodile',
    'Treecko', 'Torchic', 'Mudkip', 'Turtwig', 'Chimchar', 'Piplup',
    'Snivy', 'Tepig', 'Oshawott', 'Chespin', 'Fennekin', 'Froakie',
    'Rowlet', 'Litten', 'Popplio', 'Grookey', 'Scorbunny', 'Sobble',
    'Sprigatito', 'Fuecoco', 'Quaxly', 'Pichu', 'Cleffa', 'Igglybuff',
    'Azurill', 'Budew', 'Togepi', 'Tyrogue', 'Elekid', 'Magby', 'Smoochum',
    'Wynaut', 'Riolu', 'Munchlax', 'Happiny', 'Mantyke', 'Toxel', 'Togedemaru', 'Charcadet', 'Tandemaus', 'Nymble', 'Lechonk', 'Smoliv', 'Pawmi', 'Cetoddle', 'Poliwag',
    'Magikarp', 'Feebas', 'Cufant', 'Dreepy', 'Applin', 'Bellsprout', 'Sunkern', 'Ralts', 'Horsea', 'Azurill', 'Bagon', 'Bonsly', 'Gible', 'Riolu', 'Axew', 'Deino', 'Dratini', 'Pawniard', 'Goomy',
    'Scatterbug', 'Noibat', 'Salandit', 'Impidimp', 'Snom', 'Tadbulb', 'Fidough', 'Tinkatink', 'Frigibax', 'Wattrel', 'Nacli',
];
const MAX_EGGS = 9;
const HATCH_TIME_MS = 1000 * 60 * 60 * 48; // 48 horas
function getRandomFirstStage() {
    // pokemonData is an array, not an object
    const filtered = Array.isArray(pokemonData)
        ? pokemonData.filter((p) => FIRST_STAGE_POKEMON.includes(p.name))
        : [];
    if (!filtered.length)
        return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
}
function generateEgg() {
    const now = Date.now();
    return {
        createdAt: now,
        hatched: false,
        pokemon: null,
        id: Math.random().toString(36).slice(2),
        lastSaved: now, // Para trackear cuándo se guardó por última vez
    };
}
function generatePokemonData(base) {
    if (!base)
        return null;
    // Manejar abilities como array u objeto
    let ability = '';
    if (Array.isArray(base.abilities)) {
        ability = base.abilities[0] || '';
    }
    else if (typeof base.abilities === 'object' && base.abilities !== null) {
        ability = base.abilities.H || base.abilities[0] || base.abilities[1] || base.abilities["0"] || '';
    }
    const sprite = getSprite(base, true);
    return {
        ...base,
        species: base.name,
        level: 1,
        shiny: true,
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        ability,
        item: '',
        price: 0,
        nickname: '',
        gender: base.gender === 'genderless' ? 'genderless' : 'random',
        nature: 'Adamant',
        hatched: true, // Indicador de que fue eclosionado
        sprite
    };
}
async function saveEggs(eggs) {
    // Guardar en localStorage primero (como hace el equipo)
    try {
        // Actualizar lastSaved timestamp en todos los huevos
        const now = Date.now();
        const eggsWithTimestamp = eggs.map(egg => ({
            ...egg,
            lastSaved: now
        }));
        // Guardar en localStorage
        localStorage.setItem('userIncubadoras', JSON.stringify(eggsWithTimestamp));
        console.log('🔄 Incubadoras guardadas en localStorage:', eggsWithTimestamp.length, 'huevos');
        return eggsWithTimestamp;
    }
    catch (error) {
        console.error('❌ Error guardando incubadoras en localStorage:', error);
        throw error;
    }
}
function loadEggs() {
    // Cargar desde localStorage
    try {
        const stored = localStorage.getItem('userIncubadoras');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                console.log('🔄 Incubadoras cargadas desde localStorage:', parsed.length, 'huevos');
                return parsed;
            }
        }
    }
    catch (error) {
        console.error('Error parsing incubadoras from localStorage:', error);
    }
    // Fallback a array vacío
    return [];
}
// Copiado de equipo.tsx para máxima compatibilidad con sprites Pokemondb
function formatNameForPokemondb(name) {
    if (!name)
        return '';
    let formattedName = name.toLowerCase();
    formattedName = formattedName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (formattedName.includes("nidoran") && formattedName.includes("♀"))
        return "nidoran-f";
    if (formattedName.includes("nidoran") && formattedName.includes("♂"))
        return "nidoran-m";
    if (formattedName === "indeedee-m")
        return "indeedee-male";
    if (formattedName === "indeedee-f")
        return "indeedee-female";
    if (formattedName === "meowstic-m")
        return "meowstic-male";
    if (formattedName === "meowstic-f")
        return "meowstic-female";
    if (formattedName === "basculegion-m")
        return "basculegion-male";
    if (formattedName === "basculegion-f")
        return "basculegion-female";
    formattedName = formattedName
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/[.'’:]/g, '')
        .replace(/\s+/g, '-');
    formattedName = formattedName
        .replace(/-alola$/, '-alolan')
        .replace(/-galar$/, '-galarian')
        .replace(/-hisui$/, '-hisuian')
        .replace(/-paldea$/, '-paldean')
        .replace(/-therian$/, '-therian')
        .replace(/-incarnate$/, '')
        .replace(/-origin$/, '-origin')
        .replace(/-sky$/, '-sky')
        .replace(/-land$/, '')
        .replace(/-zen$/, '-zen')
        .replace(/-standard$/, '')
        .replace(/-blade$/, '-blade')
        .replace(/-shield$/, '')
        .replace(/-sunshine$/, '-sunshine')
        .replace(/-overcast$/, '')
        .replace(/-school$/, '-school')
        .replace(/-solo$/, '')
        .replace(/-aria$/, '-aria')
        .replace(/-pirouette$/, '-pirouette')
        .replace(/-resolute$/, '-resolute')
        .replace(/-ordinary$/, '')
        .replace(/-strike$/, '')
        .replace(/-rapid-strike$/, '-rapid-strike')
        .replace(/-crowned$/, '-crowned')
        .replace(/-hero$/, '')
        .replace(/-eternamax$/, '-eternamax')
        .replace(/-hangry$/, '-hangry')
        .replace(/-full-belly$/, '')
        .replace(/-amped$/, '-amped')
        .replace(/-low-key$/, '-low-key')
        .replace(/-10%?$/, '-10')
        .replace(/-50%?$/, '')
        .replace(/-complete$/, '-complete')
        .replace(/-ash$/, '-ash')
        .replace(/-original-cap$/, '-original-cap')
        .replace(/-hoenn-cap$/, '-hoenn-cap')
        .replace(/-sinnoh-cap$/, '-sinnoh-cap')
        .replace(/-unova-cap$/, '-unova-cap')
        .replace(/-kalos-cap$/, '-kalos-cap')
        .replace(/-alola-cap$/, '-alola-cap')
        .replace(/-partner-cap$/, '-partner-cap')
        .replace(/-world-cap$/, '-world-cap')
        .replace(/-zero$/, '-zero')
        .replace(/-hero-form$/, '-hero')
        .replace(/-curly$/, '-curly')
        .replace(/-droopy$/, '-droopy')
        .replace(/-stretchy$/, '-stretchy')
        .replace(/-green-plumage$/, '-green-plumage')
        .replace(/-blue-plumage$/, '-blue-plumage')
        .replace(/-yellow-plumage$/, '-yellow-plumage')
        .replace(/-white-plumage$/, '-white-plumage')
        .replace(/-family-of-three$/, '-family-of-three')
        .replace(/-family-of-four$/, '')
        .replace(/^ogerpon-teal(-mask)?$/, 'ogerpon')
        .replace(/^ogerpon-(wellspring|hearthflame|cornerstone)(-mask)?$/, 'ogerpon-$1-mask');
    const specificNameMap = {
        'mr-mime': 'mr-mime',
        'mr-mime-galarian': 'mr-mime-galarian',
        'mr-rime': 'mr-rime',
        'type-null': 'type-null',
        'farfetchd': 'farfetchd',
        'farfetchd-galarian': 'farfetchd-galarian',
        'sirfetchd': 'sirfetchd',
        'ho-oh': 'ho-oh',
        'porygon-z': 'porygon-z',
        'kommo-o': 'kommo-o',
        'jangmo-o': 'jangmo-o',
        'hakamo-o': 'hakamo-o',
        'shaymin-land': 'shaymin-land',
        'shaymin-sky': 'shaymin-sky',
        'giratina-origin': 'giratina-origin',
        'darmanitan-standard': 'darmanitan',
        'darmanitan-galarian-standard': 'darmanitan-galarian',
        'aegislash-shield': 'aegislash',
        'wishiwashi-solo': 'wishiwashi',
        'meloetta-aria': 'meloetta-aria',
        'keldeo-ordinary': 'keldeo',
        'morpeko-full-belly': 'morpeko',
        'zygarde': 'zygarde',
        'zygarde-50': 'zygarde',
        'zacian': 'zacian',
        'zamazenta': 'zamazenta',
        'palafin': 'palafin-zero',
    };
    if (specificNameMap[formattedName]) {
        formattedName = specificNameMap[formattedName];
    }
    formattedName = formattedName.replace(/--+/g, '-').replace(/^-+|-+$/g, '');
    return formattedName;
}
function getSprite(parsedPokemon, shiny) {
    if (!parsedPokemon || !parsedPokemon.species)
        return null;
    const nameForUrl = formatNameForPokemondb(parsedPokemon.species);
    if (!nameForUrl)
        return null;
    const shinyStr = shiny ? 'shiny' : 'normal';
    return `https://img.pokemondb.net/sprites/home/${shinyStr}/${nameForUrl}.png`;
}
export default function Incubators() {
    const { user, refreshUserProfile, forceSyncComponents } = useUser();
    const [eggs, setEggs] = useState([]); // Inicializar con array vacío
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
    // Estado para historial de eclosionados - sync with Firestore
    const [hatchedHistory, setHatchedHistory] = useState([]);
    // Sincronizar historial de eclosionados desde Firestore
    useEffect(() => {
        if (user?.profile?.hatchedHistory) {
            setHatchedHistory(user.profile.hatchedHistory);
        }
    }, [user?.profile?.hatchedHistory]);
    // Sincronizar incubadoras desde localStorage primero, luego Firestore
    useEffect(() => {
        // Solo ejecutar si no se ha completado la carga inicial Y hay un usuario válido
        if (isInitialLoadComplete || !user?.uid || !user?.email) {
            if (isInitialLoadComplete) {
                console.log('⚠️ Carga inicial ya completada, saltando syncIncubadoras');
            }
            return;
        }
        const syncIncubadoras = async () => {
            console.log('🔄 syncIncubadoras ejecutándose - Usuario:', {
                uid: user?.uid,
                email: user?.email,
                hasProfile: !!user?.profile,
                hasIncubadoras: !!user?.profile?.incubadoras,
                incubadorasLength: user?.profile?.incubadoras?.length || 0,
                currentEggsLength: eggs.length,
                isInitialLoadComplete
            });
            // Dar tiempo para que se complete la carga del usuario
            await new Promise(resolve => setTimeout(resolve, 100));
            // Primero intentar cargar desde localStorage (fuente de verdad)
            const localEggs = loadEggs();
            console.log('🔄 Incubadoras cargadas desde localStorage:', {
                count: localEggs.length,
                currentEggsInState: eggs.length,
                isLoadingFromScratch: eggs.length === 0
            });
            if (localEggs.length > 0) {
                console.log('✅ Usando incubadoras desde localStorage (fuente de verdad):', localEggs.length, 'huevos');
                const adjustedEggs = adjustEggsTimeAfterOffline(localEggs);
                setEggs(adjustedEggs);
                setIsInitialLoadComplete(true);
                return;
            }
            // Solo si localStorage está completamente vacío, intentar cargar desde el perfil del usuario
            if (user?.profile?.incubadoras && user.profile.incubadoras.length > 0) {
                console.log('✅ Cargando incubadoras desde user.profile (fallback):', user.profile.incubadoras.length, 'huevos');
                console.log('📋 Incubadoras desde profile:', user.profile.incubadoras);
                const adjustedEggs = adjustEggsTimeAfterOffline(user.profile.incubadoras);
                setEggs(adjustedEggs);
                // Guardar en localStorage para mantener consistencia
                await saveEggs(adjustedEggs);
                setIsInitialLoadComplete(true);
                return;
            }
            if (user?.uid && user?.email) {
                // Si el usuario está logueado pero no tiene incubadoras en el profile, cargar desde Firestore
                console.log('🔍 Buscando incubadoras directamente en Firestore para usuario:', user.email);
                try {
                    const { getUserProfile } = await import('../../lib/userData');
                    const profile = await getUserProfile(user.uid, user.email);
                    console.log('📦 Perfil obtenido de Firestore:', {
                        hasProfile: !!profile,
                        hasIncubadoras: !!profile?.incubadoras,
                        incubadorasLength: profile?.incubadoras?.length || 0
                    });
                    if (profile?.incubadoras && profile.incubadoras.length > 0) {
                        console.log('✅ Incubadoras encontradas en Firestore:', profile.incubadoras.length);
                        console.log('📋 Incubadoras desde Firestore:', profile.incubadoras);
                        const adjustedEggs = adjustEggsTimeAfterOffline(profile.incubadoras);
                        setEggs(adjustedEggs);
                        // Guardar en localStorage para mantener consistencia
                        await saveEggs(adjustedEggs);
                        setIsInitialLoadComplete(true);
                        return;
                    }
                    // Si llegamos aquí, significa que no hay datos ni en localStorage ni en profile ni en Firestore
                    // Solo resetear si el estado actual también está vacío
                    if (eggs.length === 0) {
                        console.log('🆕 No se encontraron incubadoras en ningún lado, inicializando array vacío');
                        setEggs([]);
                    }
                    else {
                        console.log('⚠️ No hay datos guardados, pero hay huevos en estado actual, manteniendo:', eggs.length);
                    }
                }
                catch (error) {
                    console.error('❌ Error al cargar incubadoras desde Firestore:', error);
                    // Solo resetear si no hay huevos en el estado actual
                    if (eggs.length === 0) {
                        setEggs([]); // Fallback a array vacío
                    }
                    else {
                        console.log('⚠️ Error cargando desde Firestore, pero manteniendo huevos actuales:', eggs.length);
                    }
                }
            }
            else {
                // Usuario no logueado, solo resetear si no hay huevos actuales
                if (eggs.length === 0) {
                    console.log('👤 Usuario no logueado, inicializando array vacío');
                    setEggs([]);
                }
                else {
                    console.log('👤 Usuario no logueado, pero manteniendo huevos actuales:', eggs.length);
                }
            }
            setIsInitialLoadComplete(true);
        };
        // Ejecutar con un pequeño delay para evitar condiciones de carrera
        const timeoutId = setTimeout(() => {
            syncIncubadoras();
        }, 200);
        return () => clearTimeout(timeoutId);
    }, [user?.uid, user?.email]); // Removidas dependencias problemáticas
    // ELIMINADO: useEffect que escuchaba cambios en user?.profile?.incubadoras para evitar loops circulares
    // Pestaña activa: 'activos' o 'historial'
    const [activeTab, setActiveTab] = useState('activos');
    // Eliminar el efecto que borraba los huevos al montar
    // useEffect(() => {
    //   setEggs([]);
    //   saveEggs([]);
    //   // Cargar historial de eclosionados de localStorage
    //   try {
    //     const history = JSON.parse(localStorage.getItem('hatchedHistory') || '[]');
    //     setHatchedHistory(history);
    //   } catch {
    //     setHatchedHistory([]);
    //   }
    // }, []);
    const [now, setNow] = useState(Date.now());
    // Estado para animación de eclosión por huevo
    const [hatchingIdx, setHatchingIdx] = useState(null);
    // Estado para mostrar sprite tras animación
    const [showSpriteIdx, setShowSpriteIdx] = useState(null);
    // Estado para animación de brillo antes de mostrar sprite
    const [glowIdx, setGlowIdx] = useState(null);
    // --- Incubación acelerada por navegación activa ---
    // Multiplicador de incubación cuando el usuario navega activamente
    const [incubationMultiplier, setIncubationMultiplier] = useState(1);
    const [lastActive, setLastActive] = useState(Date.now());
    // Detectar actividad del usuario (scroll, click, keydown, navegación)
    useEffect(() => {
        function markActive() {
            setLastActive(Date.now());
            setIncubationMultiplier(3); // x3 cuando hay actividad
        }
        window.addEventListener('scroll', markActive);
        window.addEventListener('click', markActive);
        window.addEventListener('keydown', markActive);
        window.addEventListener('mousemove', markActive);
        return () => {
            window.removeEventListener('scroll', markActive);
            window.removeEventListener('click', markActive);
            window.removeEventListener('keydown', markActive);
            window.removeEventListener('mousemove', markActive);
        };
    }, []);
    // Reducir el multiplicador si no hay actividad por 10s
    useEffect(() => {
        if (incubationMultiplier === 1)
            return;
        const timeout = setTimeout(() => setIncubationMultiplier(1), 10000);
        return () => clearTimeout(timeout);
    }, [lastActive, incubationMultiplier]);
    // Avance acelerado del tiempo de incubación
    useEffect(() => {
        let lastTick = Date.now();
        const interval = setInterval(() => {
            const nowTick = Date.now();
            const elapsed = nowTick - lastTick;
            lastTick = nowTick;
            if (incubationMultiplier > 1) {
                // Avanzar el tiempo "virtual" de los huevos
                setEggs(eggs => eggs.map(egg => {
                    if (egg.hatched)
                        return egg;
                    // Simular que el huevo fue creado antes (acelerar incubación)
                    return {
                        ...egg,
                        createdAt: egg.createdAt - elapsed * (incubationMultiplier - 1)
                    };
                }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [incubationMultiplier]);
    // Timer para actualizar el tiempo actual
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);
    // Auto-save simplificado: solo guardar en localStorage cuando cambien los huevos
    useEffect(() => {
        console.log('🔍 useEffect [eggs] ejecutándose:', {
            eggsLength: eggs.length,
            hasUser: !!user?.uid,
            hasEmail: !!user?.email
        });
        // Si no hay usuario, no hacer nada
        if (!user?.uid || !user?.email || eggs.length < 0) {
            console.log('⏸️ No guardando - usuario no autenticado o estado inválido');
            return;
        }
        const syncEggs = async () => {
            try {
                console.log('🔄 Guardando huevos en localStorage...', eggs.length, 'huevos');
                // Guardar en localStorage (UserContext detectará el cambio y sincronizará con Firestore)
                await saveEggs(eggs);
                console.log('✅ Huevos guardados en localStorage exitosamente');
            }
            catch (error) {
                console.error('❌ Error saving eggs to localStorage:', error);
            }
        };
        // Ejecutar inmediatamente sin delay para evitar loops
        syncEggs();
    }, [eggs.length]); // Solo depender del LENGTH de eggs, no del contenido completo
    // Referencia para evitar auto-save innecesario
    const lastAutoSaveRef = useRef('');
    // Guardar periódicamente cuando hay aceleración activa (separado del cambio de huevos)
    useEffect(() => {
        if (incubationMultiplier <= 1 || !user?.uid || !user?.email)
            return;
        console.log('⚡ Iniciando auto-save por aceleración activa');
        const interval = setInterval(async () => {
            try {
                // Crear un hash del estado actual para evitar saves innecesarios
                const currentEggsHash = JSON.stringify(eggs.map(egg => ({
                    id: egg.id,
                    startTime: egg.startTime,
                    isHatching: egg.isHatching,
                    pokemon: egg.pokemon
                })));
                // Solo guardar si el estado cambió desde el último auto-save
                if (currentEggsHash === lastAutoSaveRef.current) {
                    console.log('⚡ Auto-save cancelado - sin cambios detectados');
                    return;
                }
                console.log('⚡ Auto-save por aceleración:', eggs.length, 'huevos');
                lastAutoSaveRef.current = currentEggsHash;
                // Guardar en localStorage (UserContext detectará el cambio)
                await saveEggs(eggs);
            }
            catch (error) {
                console.error('❌ Error en auto-save por aceleración:', error);
            }
        }, 15000); // Aumentado a 15 segundos para reducir más la frecuencia
        return () => {
            console.log('⚡ Deteniendo auto-save por aceleración');
            clearInterval(interval);
        };
    }, [incubationMultiplier > 1, user?.uid, user?.email]);
    // Update hatchedHistory in Firestore
    const saveHatchedHistoryToFirestore = async (history) => {
        if (!user?.uid || !user?.email)
            return;
        try {
            await updateUserHatchedHistory(user.uid, user.email, history);
        }
        catch (error) {
            console.error('Error saving hatched history to Firestore:', error);
        }
    };
    // Guardar historial en Firestore cuando cambie
    useEffect(() => {
        if (hatchedHistory.length > 0) {
            saveHatchedHistoryToFirestore(hatchedHistory);
        }
    }, [hatchedHistory]);
    // Animación y sonidos al eclosionar
    const hatchEgg = async (eggIdx) => {
        const egg = eggs[eggIdx];
        if (!egg || egg.hatched)
            return;
        setGlowIdx(eggIdx); // Primero, animación de brillo
        playSoundEffect('catchmusic', 0.2);
        setTimeout(() => {
            setGlowIdx(null);
            setHatchingIdx(eggIdx); // Luego, animación de sacudida
            setTimeout(async () => {
                const pokeBase = getRandomFirstStage();
                const pokemon = generatePokemonData(pokeBase);
                if (!pokemon) {
                    alert('No se pudo generar el Pokémon. Revisa los datos de pokemonData.');
                    setHatchingIdx(null);
                    return;
                }
                pokemon.sprite = getSprite(pokemon, true);
                // Mostrar sprite
                setShowSpriteIdx(eggIdx);
                // Reproducir cry
                if (pokemon && pokemon.species) {
                    const cryUrl = getShowdownCryUrl(pokemon.species);
                    if (cryUrl) {
                        const cry = new window.Audio(cryUrl);
                        cry.volume = 0.13;
                        cry.play();
                    }
                }
                // Actualizar estado del huevo: solo marcar como hatched y asignar pokemon, NO agregar a historial ni equipo aún
                const newEggs = eggs.slice();
                newEggs[eggIdx] = { ...egg, hatched: true, pokemon };
                setEggs(newEggs);
                // Limpiar animación visual después de un tiempo
                setTimeout(() => {
                    setHatchingIdx(null);
                    // No limpiar showSpriteIdx aquí, se limpia tras acción del usuario
                }, 1800);
            }, 900); // Duración de la animación de sacudida
        }, 900); // Duración de la animación de brillo
    };
    // Nueva función para guardar historial
    function saveHatchedHistory(history) {
        // Update Firestore instead of localStorage
        saveHatchedHistoryToFirestore(history);
    }
    // Nueva función addToTeam según instrucciones (modificada para badge correcto y limpiar sprite)
    function addToTeam(index) {
        const updatedEggs = [...eggs];
        const pokemon = updatedEggs[index].pokemon;
        if (pokemon) {
            // Get correct details for the species
            const details = getPokemonDetails(pokemon.species || pokemon.name);
            // Pick a random ability from available abilities
            let ability = '';
            if (details?.abilities) {
                const abilityList = Object.values(details.abilities).filter(Boolean);
                ability = abilityList.length > 0 ? abilityList[Math.floor(Math.random() * abilityList.length)] : '';
            }
            // Get random moves for the species
            const moves = getRandomMovesForSpecies(pokemon.species || pokemon.name);
            // Gender
            let gender = details?.gender || 'N';
            // Types
            let types = details?.types || pokemon.types || [];
            if (!Array.isArray(types) && typeof types === 'string')
                types = [types];
            addPokemonToTeam({
                name: pokemon.name || pokemon.species,
                species: pokemon.species,
                gender: gender,
                item: '',
                ability: ability,
                isShiny: true,
                isHO: false,
                teraType: types[0] || 'Normal',
                EVs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
                IVs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
                nature: 'Adamant',
                moves: moves && moves.length === 4 ? moves : ['-', '-', '-', '-'],
                level: 1,
                types: types.length ? types : ['Normal'],
                caught: true,
                price: 0,
                hatched: true, // Marca especial para el badge
            });
            const history = [
                { ...pokemon, hatchedAt: Date.now(), released: false },
                ...hatchedHistory,
            ];
            setHatchedHistory(history);
            saveHatchedHistory(history);
        }
        updatedEggs.splice(index, 1);
        setEggs(updatedEggs);
        // No necesitamos await aquí porque setEggs triggereará el useEffect
        setShowSpriteIdx(null);
        playSoundEffect('notification', 0.2);
    }
    // Nueva función releasePokemon según instrucciones (modificada para badge correcto y limpiar sprite)
    function releasePokemon(index) {
        const updatedEggs = [...eggs];
        const pokemon = updatedEggs[index].pokemon;
        if (pokemon) {
            alert('¡El Pokémon fue liberado en su hábitat natural!');
            const history = [
                { ...pokemon, hatchedAt: Date.now(), released: true },
                ...hatchedHistory,
            ];
            setHatchedHistory(history);
            saveHatchedHistory(history);
        }
        updatedEggs.splice(index, 1);
        setEggs(updatedEggs);
        // No necesitamos await aquí porque setEggs triggereará el useEffect
        setShowSpriteIdx(null);
        playSoundEffect('notification', 0.2);
    }
    // Función para agregar un huevo nuevo
    function addEgg() {
        if (eggs.length >= MAX_EGGS)
            return;
        playSoundEffect('notification', 0.15);
        setEggs([...eggs, generateEgg()]);
    }
    // Formato de fecha corto
    function formatDateShort(ts) {
        const d = new Date(ts);
        return d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    // Función para ajustar el tiempo de los huevos después de tiempo offline
    const adjustEggsTimeAfterOffline = (eggsFromFirestore) => {
        const now = Date.now();
        return eggsFromFirestore.map(egg => {
            if (egg.hatched)
                return egg;
            // El tiempo no avanza cuando el usuario está offline, 
            // pero podríamos implementar un pequeño bonus por tiempo offline
            // Por ahora, mantenemos el tiempo como está
            return {
                ...egg,
                // Mantener el createdAt como está para preservar el progreso de incubación
                lastSeen: now // Agregar timestamp de cuándo se vio por última vez
            };
        });
    };
    // Debug: Mostrar información de tiempo de huevos
    const debugEggTimes = () => {
        console.log('🐣 Estado actual de huevos:');
        eggs.forEach((egg, index) => {
            if (!egg.hatched) {
                const timeElapsed = (now - egg.createdAt) / 1000 / 60; // minutos
                const timeToHatch = (HATCH_TIME_MS / 1000 / 60 - timeElapsed); // minutos restantes
                console.log(`Huevo ${index}: ${timeElapsed.toFixed(1)}min transcurridos, ${timeToHatch.toFixed(1)}min restantes`);
            }
        });
    };
    // Debug: llamar cada 10 segundos si hay aceleración activa
    useEffect(() => {
        if (incubationMultiplier > 1) {
            const debugInterval = setInterval(debugEggTimes, 10000);
            return () => clearInterval(debugInterval);
        }
    }, [incubationMultiplier, eggs, now]);
    const debugRefreshProfile = async () => {
        console.log('🔧 DEBUG: Refrescando perfil manualmente...');
        await refreshUserProfile();
    };
    return (_jsxs("div", { className: "max-w-xl mx-auto mt-8 p-4", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-bold mb-4 pb-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-xl animate-fade-in-down text-center", children: "Incubadora Pok\u00E9mon" }), _jsx("p", { className: "text-xs sm:text-sm text-gray-500 mb-6 text-center", style: { textAlign: 'center' }, children: "Consigue Pok\u00E9mon shiny, 6IV y nivel 1 de primera etapa. Incuba huevos y elige si quieres agregarlos a tu equipo o liberarlos. \u00A1Perfecto para coleccionistas y jugadores competitivos!" }), _jsxs("div", { className: "flex justify-center mb-4 mt-2", children: [_jsx("button", { className: `px-4 py-1 rounded-t-lg font-semibold transition-colors border-b-2 ${activeTab === 'activos'
                            ? 'bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 text-pink-700 border-pink-400'
                            : 'bg-gray-100 text-gray-500 border-transparent hover:text-pink-600'}`, onClick: () => setActiveTab('activos'), children: "\uD83E\uDD5A Activos" }), _jsx("button", { className: `px-4 py-1 rounded-t-lg font-semibold transition-colors border-b-2 ml-2 ${activeTab === 'historial'
                            ? 'bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 text-pink-700 border-pink-400'
                            : 'bg-gray-100 text-gray-500 border-transparent hover:text-pink-600'}`, onClick: () => setActiveTab('historial'), children: "\uD83D\uDC23 Historial" })] }), activeTab === 'activos' ? (_jsxs("div", { className: "flex flex-wrap gap-4 justify-center", children: [eggs.length === 0 && (_jsx("div", { className: "text-center text-gray-500 w-full", children: "No tienes huevos en incubaci\u00F3n. \u00A1Agrega uno!" })), eggs.map((egg, idx) => {
                        const timeLeft = Math.max(0, egg.createdAt + HATCH_TIME_MS - now);
                        const hours = Math.floor(timeLeft / 3600000);
                        const minutes = Math.floor((timeLeft % 3600000) / 60000);
                        const seconds = Math.floor((timeLeft % 60000) / 1000);
                        const isHatching = hatchingIdx === idx;
                        const isShowSprite = showSpriteIdx === idx;
                        const isGlowing = glowIdx === idx;
                        return (_jsx("div", { className: "flex flex-col items-center bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 rounded-lg p-3 w-32 shadow", children: (!egg.hatched && !isShowSprite) ? (_jsxs(_Fragment, { children: [(() => {
                                        let eggAnimClass = '';
                                        if (isGlowing) {
                                            eggAnimClass = 'hatch-glow-flash';
                                        }
                                        else if (isHatching) {
                                            eggAnimClass = 'animate-hatch-shake';
                                        }
                                        else if (timeLeft <= 0 && !egg.hatched && !isShowSprite) {
                                            eggAnimClass = 'animate-egg-ready';
                                        }
                                        else if (timeLeft > 0 && !egg.hatched && !isShowSprite) {
                                            eggAnimClass = 'animate-bounce';
                                        }
                                        return (_jsxs("div", { className: `relative w-20 h-20 mb-2 ${eggAnimClass}`, style: timeLeft <= 0 && !egg.hatched && !isShowSprite && !isGlowing ? { animation: 'egg-ready-shake 0.7s cubic-bezier(.36,.07,.19,.97) infinite !important' } : {}, children: [_jsx("img", { src: "src/img/egg.png", alt: "Huevo", className: `w-20 h-20` }), isHatching && _jsx("div", { className: "absolute inset-0 rounded-full bg-yellow-200/60 blur-2xl animate-hatch-glow" })] }));
                                    })(), _jsxs("span", { className: "text-xs text-gray-700", children: ["Eclosiona en", _jsx("br", {}), hours, "h ", minutes, "m ", seconds, "s"] }), import.meta.env.DEV && (_jsx("button", { className: "mt-1 px-2 py-0.5 rounded bg-purple-600 text-white text-[9px] font-bold shadow hover:bg-purple-700 transition-colors", onClick: () => {
                                            // Simula que el tiempo ya pasó para este huevo individual
                                            const updatedEggs = [...eggs];
                                            updatedEggs[idx].createdAt = Date.now() - HATCH_TIME_MS;
                                            setEggs(updatedEggs);
                                            saveEggs(updatedEggs);
                                        }, children: "\u26A1 Forzar (DEV)" })), timeLeft <= 0 && (_jsx("button", { className: "mt-2 px-2 py-1 rounded bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-500 text-white text-xs font-bold shadow hover:scale-105 transition-transform", onClick: () => hatchEgg(idx), disabled: isHatching || isGlowing, children: "Eclosionar" })), timeLeft <= 0 && !egg.hatched && !isShowSprite && (_jsx("span", { className: "block text-xs text-pink-600 font-bold mt-1 animate-pulse", children: "\u00A1Listo para eclosionar!" }))] })) : (egg.hatched && isShowSprite) ? (
                            // Mostrar sprite y botones de decisión tras eclosión
                            _jsxs("div", { className: "relative flex flex-col items-center mb-2", children: [_jsx("span", { className: "absolute left-1/2 -top-4 -translate-x-1/2 z-10 text-2xl animate-heart-pop select-none pointer-events-none", style: { textShadow: '0 0 8px #fff6, 0 1px 0 #f06' }, children: "\u2764\uFE0F" }), _jsx("img", { src: egg.pokemon?.sprite || '/pokeball.png', alt: egg.pokemon?.name || 'Pokémon', className: "w-24 h-24 mb-1 animate-hatch-celebration", onError: e => {
                                            const target = e.currentTarget;
                                            if (!target.src.endsWith('/pokeball.png')) {
                                                target.src = '/pokeball.png';
                                            }
                                        } }), _jsx("span", { className: "absolute -top-1 -right-1 bg-yellow-400 text-[10px] text-white font-bold px-1 rounded-full animate-pulse", children: "\u2605" }), _jsx("span", { className: "text-xs font-bold text-pink-700 mt-2", children: egg.pokemon?.name || 'Pokémon' }), _jsx("div", { className: "text-[9px] text-gray-500 mb-1", children: "Nivel 1 \u2022 6IV \u2022 Adamant" }), _jsxs("div", { className: "flex gap-1 mt-1", children: [_jsx("button", { className: "px-2 py-0.5 rounded bg-green-500 text-white text-[10px] font-bold shadow hover:bg-green-600 transition-colors", onClick: () => addToTeam(idx), children: "Agregar al equipo" }), _jsx("button", { className: "px-2 py-0.5 rounded bg-gray-400 text-white text-[10px] font-bold shadow hover:bg-gray-500 transition-colors", onClick: () => releasePokemon(idx), children: "Liberar" })] })] })) : null }, egg.id));
                    }), eggs.length < MAX_EGGS && (_jsxs("button", { className: "flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 rounded-lg border-2 border-dashed border-pink-300 hover:scale-105 transition-transform", onClick: addEgg, children: [_jsx("img", { src: "src/img/egg.png", alt: "Nuevo huevo", className: "w-20 h-20 mb-2 opacity-60" }), _jsx("span", { className: "text-xs text-pink-500", children: "Agregar huevo" })] }))] })) : (_jsx("div", { className: "flex flex-wrap gap-4 justify-center", children: hatchedHistory.length === 0 ? (_jsx("div", { className: "text-center text-gray-500 w-full", children: "A\u00FAn no tienes historial de eclosiones." })) : (hatchedHistory.map((poke, idx) => (_jsxs("div", { className: "flex flex-col items-center bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 rounded-lg p-3 w-32 shadow", children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: poke.sprite || '/pokeball.png', alt: poke.name || 'Pokémon', className: "w-24 h-24 mb-1", onError: e => {
                                        const target = e.currentTarget;
                                        if (!target.src.endsWith('/pokeball.png')) {
                                            target.src = '/pokeball.png';
                                        }
                                    } }), _jsx("span", { className: "absolute -top-1 -right-1 bg-yellow-400 text-[10px] text-white font-bold px-1 rounded-full animate-pulse", children: "\u2605" })] }), _jsx("span", { className: "text-xs font-bold text-pink-700 mb-1", children: poke.name || poke.species }), _jsx("div", { className: "text-[9px] text-gray-500 mb-1", children: "Nivel 1 \u2022 6IV \u2022 Adamant" }), _jsxs("div", { className: "text-[9px] text-gray-600 mb-1", children: ["Eclosionado el ", _jsx("span", { className: "font-semibold", children: formatDateShort(poke.hatchedAt) })] }), poke.released ? (_jsx("div", { className: "flex items-center justify-center bg-gray-200 text-gray-600 text-[10px] font-bold py-0.5 px-1 rounded-full mt-1", children: "Liberado" })) : (_jsx("div", { className: "flex items-center justify-center bg-green-100 text-green-800 text-[10px] font-bold py-0.5 px-1 rounded-full mt-1", children: "Enviado al equipo" }))] }, poke.hatchedAt + '-' + poke.species + idx)))) })), activeTab === 'historial' && hatchedHistory.length > 0 && (_jsx("div", { className: "flex justify-end mb-2", children: _jsx("button", { className: "px-3 py-1 rounded bg-red-400 hover:bg-red-600 text-white text-xs font-bold shadow transition-colors", onClick: () => {
                        if (window.confirm('¿Estás seguro de que deseas eliminar todo el historial de eclosiones?')) {
                            setHatchedHistory([]);
                            saveHatchedHistory([]);
                        }
                    }, children: "Eliminar historial" }) })), import.meta.env.DEV && (_jsx("div", { className: "mb-4 p-2 bg-blue-100 border border-blue-300 rounded", children: _jsx("button", { onClick: () => {
                        console.log('🧪 DEBUG: Forzando sincronización de componentes...');
                        if (forceSyncComponents) {
                            forceSyncComponents();
                        }
                        else {
                            console.log('❌ forceSyncComponents no está disponible');
                        }
                    }, className: "px-2 py-1 bg-blue-500 text-white text-xs rounded", children: "\uD83D\uDD04 Forzar Sync (DEBUG)" }) })), import.meta.env.DEV && (_jsxs("div", { className: "mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded", children: [_jsx("button", { onClick: () => {
                            const newEgg = generateEgg();
                            if (newEgg) {
                                setEggs(prev => [...prev, newEgg]);
                                console.log('✅ setEggs llamado, useEffect debería ejecutarse...');
                            }
                            else {
                                console.log('❌ No se pudo generar huevo');
                            }
                        }, className: "px-2 py-1 bg-green-500 text-white text-xs rounded mr-2", children: "Agregar Huevo Test" }), _jsx("button", { onClick: async () => {
                            console.log('🧪 TEST: Refrescando perfil...');
                            await refreshUserProfile();
                        }, className: "px-2 py-1 bg-blue-500 text-white text-xs rounded mr-2", children: "Refresh Profile" }), _jsx("button", { onClick: async () => {
                            console.log('🧪 TEST: Verificando datos en Firestore...');
                            if (user?.uid && user?.email) {
                                try {
                                    const { getUserProfile } = await import('../../lib/userData');
                                    const profile = await getUserProfile(user.uid, user.email);
                                    console.log('📊 Datos en Firestore:', {
                                        incubadoras: profile?.incubadoras?.length || 0,
                                        pokeballs: profile?.pokeballs,
                                        fichas: profile?.fichas
                                    });
                                }
                                catch (error) {
                                    console.error('❌ Error:', error);
                                }
                            }
                        }, className: "px-2 py-1 bg-purple-500 text-white text-xs rounded", children: "Check Firestore" })] }))] }));
}
