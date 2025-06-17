// Comprehensive Pokémon Legality Validation System
// Based on PKHeX legality system architecture with modular verifiers
// Result severity levels following PKHeX pattern
export var LegalityResultType;
(function (LegalityResultType) {
    LegalityResultType["Valid"] = "Valid";
    LegalityResultType["Fishy"] = "Fishy";
    LegalityResultType["Invalid"] = "Invalid";
})(LegalityResultType || (LegalityResultType = {}));
// Encounter types for validation
export var EncounterType;
(function (EncounterType) {
    EncounterType["Wild"] = "Wild";
    EncounterType["Static"] = "Static";
    EncounterType["Egg"] = "Egg";
    EncounterType["Trade"] = "Trade";
    EncounterType["MysteryGift"] = "MysteryGift";
    EncounterType["PokemonGO"] = "PokemonGO";
})(EncounterType || (EncounterType = {}));
// Generation boundaries and constraints
export const GENERATION_CONSTRAINTS = {
    1: { minLevel: 2, maxLevel: 100, maxIV: 15 },
    2: { minLevel: 2, maxLevel: 100, maxIV: 15 },
    3: { minLevel: 2, maxLevel: 100, maxIV: 31 },
    4: { minLevel: 1, maxLevel: 100, maxIV: 31 },
    5: { minLevel: 1, maxLevel: 100, maxIV: 31 },
    6: { minLevel: 1, maxLevel: 100, maxIV: 31 },
    7: { minLevel: 1, maxLevel: 100, maxIV: 31 },
    8: { minLevel: 1, maxLevel: 100, maxIV: 31 },
    9: { minLevel: 1, maxLevel: 100, maxIV: 31 }
};
// Shiny-locked Pokémon database (event Pokémon and certain legendaries)
export const SHINY_LOCKED_POKEMON = new Set([
    // Gen 6 starters and box legendaries
    'chespin', 'fennekin', 'froakie', 'xerneas', 'yveltal', 'zygarde',
    // Gen 7 starters, box legendaries, and Ultra Necrozma
    'rowlet', 'litten', 'popplio', 'cosmog', 'cosmoem', 'solgaleo', 'lunala',
    'necrozma-dusk-mane', 'necrozma-dawn-wings', 'necrozma-ultra',
    // Gen 8 starters, box legendaries, and Eternatus
    'grookey', 'scorbunny', 'sobble', 'zacian', 'zamazenta', 'eternatus',
    'calyrex', 'calyrex-ice', 'calyrex-shadow',
    // Gen 9 starters and box legendaries
    'sprigatito', 'fuecoco', 'quaxly', 'koraidon', 'miraidon',
    'terapagos', 'terapagos-terastal', 'terapagos-stellar',
    // Mythicals that are always shiny-locked
    'victini', 'keldeo', 'meloetta', 'genesect', 'zarude', 'pecharunt',
    // Type: Null and Silvally (gift Pokémon in certain games)
    'type-null', 'silvally'
]);
// Ball inheritance rules by generation
export const BALL_INHERITANCE_RULES = {
    6: { inheritFrom: ['mother'] }, // Gen 6: mothers only
    7: { inheritFrom: ['mother', 'father'] }, // Gen 7+: both parents
    8: { inheritFrom: ['mother', 'father'] },
    9: { inheritFrom: ['mother', 'father'] }
};
// Paradox Pokémon minimum level restrictions (Area Zero level 55+)
export const PARADOX_POKEMON_MIN_LEVELS = new Map([
    // Ancient Paradox Pokémon (Scarlet)
    ['great-tusk', 55],
    ['scream-tail', 55],
    ['brute-bonnet', 55],
    ['flutter-mane', 55],
    ['slither-wing', 55],
    ['sandy-shocks', 55],
    ['roaring-moon', 55],
    ['walking-wake', 55],
    ['raging-bolt', 55],
    // Future Paradox Pokémon (Violet)
    ['iron-treads', 55],
    ['iron-bundle', 55],
    ['iron-hands', 55],
    ['iron-jugulis', 55],
    ['iron-moth', 55],
    ['iron-thorns', 55],
    ['iron-valiant', 55],
    ['iron-leaves', 55],
    ['iron-boulder', 55],
    ['iron-crown', 55]
]);
// Known event distributions that must be validated exactly
export const EVENT_POKEMON_DISTRIBUTIONS = new Map([
    ['mewtwo', [{
                species: 'mewtwo',
                level: 100,
                shininess: 'locked',
                requiredIVs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
                eventName: 'Tera Raid Event',
                dateRange: '2023-09-01 to 2023-09-17'
            }]],
    ['mew', [{
                species: 'mew',
                level: 5,
                shininess: 'locked',
                requiredIVs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
                eventName: 'Mystery Gift GETY0URMEW',
                dateRange: '2023-08-08 to 2023-09-18'
            }]],
    ['rayquaza', [{
                species: 'rayquaza',
                level: 70,
                shininess: 'forced',
                requiredIVs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
                eventName: 'Shiny Tera Raid Event',
                dateRange: '2024-01-26 to 2024-02-04'
            }]],
    ['pecharunt', [{
                species: 'pecharunt',
                level: 88,
                shininess: 'locked',
                requiredIVs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
                eventName: 'Mochi Mayhem DLC Story',
                dateRange: 'January 2024+'
            }]]
]);
// Central legality analysis orchestrator
export class LegalityAnalysis {
    results = [];
    generation;
    dex; // Dex instance
    constructor(generation, dex) {
        this.generation = generation;
        this.dex = dex;
    }
    // Main validation method
    validatePokemon(set) {
        this.results = [];
        const species = this.dex.species.get(set.species);
        // Run all verifiers in sequence
        this.verifySpeciesLegality(species, set);
        this.verifyLevelRestrictions(set);
        this.verifyParadoxPokemonLevels(species, set);
        this.verifyMoveLegality(species, set);
        this.verifyShinyLegality(species, set);
        this.verifyEventPokemonLegality(species, set);
        this.verifyAbilityLegality(species, set);
        this.verifyBallLegality(species, set);
        this.verifyItemLegality(set);
        this.verifyIVLegality(set);
        return this.results;
    }
    // Species legality verifier (legendary restrictions)
    verifySpeciesLegality(species, set) {
        // Check for banned legendary categories
        if (species.tags?.includes('Mythical')) {
            this.addResult(LegalityResultType.Invalid, `${species.name} is a Mythical Pokémon and may be restricted in this format`, 'LegalityMythical', 8);
        }
        if (species.tags?.includes('Restricted Legendary')) {
            this.addResult(LegalityResultType.Invalid, `${species.name} is a Restricted Legendary and may be banned in this format`, 'LegalityRestrictedLegendary', 9);
        }
        if (species.tags?.includes('Ultra Beast')) {
            this.addResult(LegalityResultType.Fishy, `${species.name} is an Ultra Beast with special encounter requirements`, 'LegalityUltraBeast', 3);
        }
    }
    // Level restrictions verifier
    verifyLevelRestrictions(set) {
        const constraints = GENERATION_CONSTRAINTS[this.generation];
        if (!constraints)
            return;
        if (set.level < constraints.minLevel) {
            this.addResult(LegalityResultType.Invalid, `Level ${set.level} is below minimum level ${constraints.minLevel} for Gen ${this.generation}`, 'LegalityLevelTooLow', 7);
        }
        if (set.level > constraints.maxLevel) {
            this.addResult(LegalityResultType.Invalid, `Level ${set.level} exceeds maximum level ${constraints.maxLevel} for Gen ${this.generation}`, 'LegalityLevelTooHigh', 7);
        }
    }
    // Paradox Pokémon level restrictions (Area Zero minimum level 55)
    verifyParadoxPokemonLevels(species, set) {
        const speciesId = this.dex.toID(species.name);
        const minLevel = PARADOX_POKEMON_MIN_LEVELS.get(speciesId);
        if (minLevel && set.level < minLevel) {
            this.addResult(LegalityResultType.Invalid, `${species.name} cannot be obtained below level ${minLevel} (Area Zero restriction)`, 'LegalityParadoxMinLevel', 8);
        }
    }
    // Move legality verifier
    verifyMoveLegality(species, set) {
        if (!set.moves || set.moves.length === 0)
            return;
        for (const moveId of set.moves) {
            if (!moveId)
                continue;
            const move = this.dex.moves.get(moveId);
            if (!move || !move.exists) {
                this.addResult(LegalityResultType.Invalid, `Move ${moveId} does not exist`, 'LegalityMoveNonexistent', 8);
                continue;
            }
            // Check if move is available in current generation
            if (move.gen > this.generation) {
                this.addResult(LegalityResultType.Invalid, `${move.name} is not available in Gen ${this.generation}`, 'LegalityMoveFutureGen', 8);
            }
            // TODO: Implement learnset checking using existing learnsets data
            // This would check if the Pokémon can learn the move via level-up, TM, tutor, etc.
        }
    }
    // Shiny legality verifier
    verifyShinyLegality(species, set) {
        if (!set.isShiny)
            return; // Not shiny, no restrictions
        const speciesId = this.dex.toID(species.name);
        if (SHINY_LOCKED_POKEMON.has(speciesId)) {
            this.addResult(LegalityResultType.Invalid, `${species.name} is shiny-locked and cannot be legitimately shiny`, 'LegalityShinyLocked', 9);
        }
        // Check for event-specific shiny restrictions
        // TODO: Integrate with eventPokemon data to check if specific events allow shinies
    }
    // Event Pokémon validation (enforces exact distributions)
    verifyEventPokemonLegality(species, set) {
        const speciesId = this.dex.toID(species.name);
        const eventDistributions = EVENT_POKEMON_DISTRIBUTIONS.get(speciesId);
        if (!eventDistributions)
            return; // Not an event Pokémon
        // Check if the Pokémon matches any known event distribution
        let matchesEvent = false;
        for (const event of eventDistributions) {
            let eventMatch = true;
            // Validate level
            if (set.level !== event.level) {
                eventMatch = false;
                continue;
            }
            // Validate shininess
            if (event.shininess === 'locked' && set.isShiny) {
                this.addResult(LegalityResultType.Invalid, `${species.name} from ${event.eventName} cannot be shiny`, 'LegalityEventShinyLocked', 9);
                eventMatch = false;
            }
            else if (event.shininess === 'forced' && !set.isShiny) {
                this.addResult(LegalityResultType.Invalid, `${species.name} from ${event.eventName} must be shiny`, 'LegalityEventShinyForced', 9);
                eventMatch = false;
            }
            // Validate required IVs
            if (event.requiredIVs && set.IVs) {
                for (const [stat, requiredIV] of Object.entries(event.requiredIVs)) {
                    if (set.IVs[stat] !== requiredIV) {
                        this.addResult(LegalityResultType.Invalid, `${species.name} from ${event.eventName} must have ${stat.toUpperCase()} IV of ${requiredIV}`, 'LegalityEventIVMismatch', 8);
                        eventMatch = false;
                    }
                }
            }
            // Validate required ability
            if (event.requiredAbility && set.ability &&
                this.dex.toID(set.ability) !== this.dex.toID(event.requiredAbility)) {
                this.addResult(LegalityResultType.Invalid, `${species.name} from ${event.eventName} must have ${event.requiredAbility} ability`, 'LegalityEventAbilityMismatch', 8);
                eventMatch = false;
            }
            if (eventMatch) {
                matchesEvent = true;
                this.addResult(LegalityResultType.Valid, `${species.name} matches ${event.eventName} distribution`, 'LegalityEventMatch', 0);
                break;
            }
        }
        if (!matchesEvent) {
            this.addResult(LegalityResultType.Fishy, `${species.name} does not match any known event distribution`, 'LegalityEventNoMatch', 5);
        }
    }
    // Ability legality verifier
    verifyAbilityLegality(species, set) {
        if (!set.ability)
            return;
        const ability = this.dex.abilities.get(set.ability);
        if (!ability || !ability.exists) {
            this.addResult(LegalityResultType.Invalid, `Ability ${set.ability} does not exist`, 'LegalityAbilityNonexistent', 8);
            return;
        }
        // Check if ability is available for this species
        const abilities = species.abilities;
        if (!abilities)
            return;
        const hasAbility = Object.values(abilities).some(abilityName => this.dex.toID(abilityName) === ability.id);
        if (!hasAbility) {
            this.addResult(LegalityResultType.Invalid, `${species.name} cannot have the ability ${ability.name}`, 'LegalityAbilityMismatch', 8);
        }
        // Check Hidden Ability availability
        if (abilities.H && this.dex.toID(abilities.H) === ability.id) {
            // Hidden ability - check if available in this generation
            if (this.generation < 5) {
                this.addResult(LegalityResultType.Invalid, `Hidden Abilities are not available before Gen 5`, 'LegalityHiddenAbilityGen', 7);
            }
        }
    }
    // Ball legality verifier
    verifyBallLegality(species, set) {
        if (!set.item)
            return; // ParsedPokemon doesn't have pokeball property, using item
        const ball = this.dex.items.get(set.item);
        if (!ball || !ball.exists || !ball.isPokeball) {
            // Only check if item is actually a pokeball
            if (set.item && set.item.toLowerCase().includes('ball')) {
                this.addResult(LegalityResultType.Invalid, `${set.item} is not a valid Poké Ball`, 'LegalityInvalidBall', 6);
            }
            return;
        }
        // Check ball availability in generation
        if (ball.gen > this.generation) {
            this.addResult(LegalityResultType.Invalid, `${ball.name} is not available in Gen ${this.generation}`, 'LegalityBallFutureGen', 7);
        }
        // Special ball restrictions
        if (ball.id === 'masterball') {
            this.addResult(LegalityResultType.Fishy, `Master Ball usage should be verified for legitimacy`, 'LegalityMasterBall', 2);
        }
        if (ball.id === 'cherishball') {
            this.addResult(LegalityResultType.Fishy, `Cherish Ball indicates event Pokémon - verify event data`, 'LegalityCherishBall', 3);
        }
    }
    // Item legality verifier
    verifyItemLegality(set) {
        if (!set.item)
            return;
        const item = this.dex.items.get(set.item);
        if (!item || !item.exists) {
            this.addResult(LegalityResultType.Invalid, `Item ${set.item} does not exist`, 'LegalityItemNonexistent', 7);
            return;
        }
        // Check item availability in generation
        if (item.gen > this.generation) {
            this.addResult(LegalityResultType.Invalid, `${item.name} is not available in Gen ${this.generation}`, 'LegalityItemFutureGen', 7);
        }
        // Check for banned items
        if (item.isNonstandard) {
            this.addResult(LegalityResultType.Invalid, `${item.name} is not available in standard play`, 'LegalityItemNonstandard', 8);
        }
    }
    // IV legality verifier
    verifyIVLegality(set) {
        const constraints = GENERATION_CONSTRAINTS[this.generation];
        if (!constraints || !set.IVs)
            return;
        const ivStats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
        for (const stat of ivStats) {
            const iv = set.IVs[stat];
            if (iv !== undefined && iv > constraints.maxIV) {
                this.addResult(LegalityResultType.Invalid, `${stat.toUpperCase()} IV ${iv} exceeds maximum ${constraints.maxIV} for Gen ${this.generation}`, 'LegalityIVTooHigh', 8);
            }
            if (iv !== undefined && iv < 0) {
                this.addResult(LegalityResultType.Invalid, `${stat.toUpperCase()} IV ${iv} cannot be negative`, 'LegalityIVNegative', 8);
            }
        }
        // Check for suspicious perfect IVs
        const perfectIVs = ivStats.filter(stat => set.IVs[stat] === constraints.maxIV).length;
        if (perfectIVs === 6 && this.generation <= 3) {
            this.addResult(LegalityResultType.Fishy, `Perfect IVs in all stats are extremely rare in Gen ${this.generation}`, 'LegalityPerfectIVs', 2);
        }
    }
    // Helper method to add results
    addResult(type, message, identifier, severity) {
        this.results.push({
            type,
            message,
            identifier,
            severity
        });
    }
    // Get overall legality status
    getOverallStatus() {
        if (this.results.some(r => r.type === LegalityResultType.Invalid)) {
            return LegalityResultType.Invalid;
        }
        if (this.results.some(r => r.type === LegalityResultType.Fishy)) {
            return LegalityResultType.Fishy;
        }
        return LegalityResultType.Valid;
    }
    // Get highest severity level
    getMaxSeverity() {
        return this.results.reduce((max, result) => Math.max(max, result.severity), 0);
    }
    // Filter results by type
    getResultsByType(type) {
        return this.results.filter(r => r.type === type);
    }
}
// Specialized verifiers following PKHeX architecture
export class AbilityVerifier {
    static verifyAbilityChange(fromAbility, toAbility, hasAbilityCapsule, hasAbilityPatch, generation) {
        // Ability Capsule: can change between regular abilities (not Hidden)
        // Ability Patch: can change TO Hidden Ability (Gen 8+)
        if (generation < 6 && hasAbilityCapsule) {
            return {
                type: LegalityResultType.Invalid,
                message: 'Ability Capsule is not available before Gen 6',
                identifier: 'AbilityCapsuleGen',
                severity: 7
            };
        }
        if (generation < 8 && hasAbilityPatch) {
            return {
                type: LegalityResultType.Invalid,
                message: 'Ability Patch is not available before Gen 8',
                identifier: 'AbilityPatchGen',
                severity: 7
            };
        }
        return null;
    }
}
export class BallVerifier {
    static verifyBallInheritance(species, parentBalls, generation) {
        const inheritanceRules = BALL_INHERITANCE_RULES[generation];
        if (!inheritanceRules)
            return null;
        // TODO: Implement specific inheritance validation based on parent balls
        return null;
    }
}
export class MiscVerifier {
    static verifyNickname(nickname, species) {
        if (!nickname)
            return null;
        // Check for inappropriate content or length restrictions
        if (nickname.length > 12) {
            return {
                type: LegalityResultType.Invalid,
                message: 'Nickname exceeds maximum length of 12 characters',
                identifier: 'NicknameTooLong',
                severity: 5
            };
        }
        return null;
    }
    static verifyOT(otName, generation) {
        if (!otName)
            return null;
        const maxLength = generation <= 2 ? 7 : generation <= 6 ? 8 : 12;
        if (otName.length > maxLength) {
            return {
                type: LegalityResultType.Invalid,
                message: `OT name exceeds maximum length of ${maxLength} characters for Gen ${generation}`,
                identifier: 'OTNameTooLong',
                severity: 6
            };
        }
        return null;
    }
}
// Convenience function for quick validation
export function validatePokemonLegality(set, generation, dex) {
    const analyzer = new LegalityAnalysis(generation, dex);
    return analyzer.validatePokemon(set);
}
// Helper function to check if a Pokémon is shiny-locked
export function isShinyLocked(species) {
    const speciesId = species.toLowerCase().replace(/[^a-z0-9]/g, '');
    return SHINY_LOCKED_POKEMON.has(speciesId);
}
// Helper function to get minimum level for Paradox Pokémon
export function getParadoxMinLevel(species) {
    const speciesId = species.toLowerCase().replace(/[^a-z0-9]/g, '');
    return PARADOX_POKEMON_MIN_LEVELS.get(speciesId) || null;
}
// Helper function to validate against event distributions
export function validateEventPokemon(set) {
    const speciesId = set.species.toLowerCase().replace(/[^a-z0-9]/g, '');
    const eventDistributions = EVENT_POKEMON_DISTRIBUTIONS.get(speciesId);
    if (!eventDistributions) {
        return { isEventPokemon: false, matchingEvents: [], violations: [] };
    }
    const matchingEvents = [];
    const violations = [];
    for (const event of eventDistributions) {
        const eventViolations = [];
        // Check level
        if (set.level !== event.level) {
            eventViolations.push(`Level mismatch: expected ${event.level}, got ${set.level}`);
        }
        // Check shininess
        if (event.shininess === 'locked' && set.isShiny) {
            eventViolations.push('Pokémon cannot be shiny for this event');
        }
        else if (event.shininess === 'forced' && !set.isShiny) {
            eventViolations.push('Pokémon must be shiny for this event');
        }
        // Check IVs
        if (event.requiredIVs && set.IVs) {
            for (const [stat, requiredIV] of Object.entries(event.requiredIVs)) {
                if (set.IVs[stat] !== requiredIV) {
                    eventViolations.push(`${stat.toUpperCase()} IV mismatch: expected ${requiredIV}, got ${set.IVs[stat]}`);
                }
            }
        }
        if (eventViolations.length === 0) {
            matchingEvents.push(event);
        }
        else {
            violations.push(...eventViolations.map(v => `${event.eventName}: ${v}`));
        }
    }
    return {
        isEventPokemon: true,
        matchingEvents,
        violations: matchingEvents.length === 0 ? violations : []
    };
}
// Enhanced validation for creating legal Pokémon
export function createLegalPokemon(species, options = {}) {
    const { level = 50, shiny = false, generation = 9 } = options;
    // Start with base Pokémon
    const basePokemon = {
        species,
        level,
        isShiny: shiny
    };
    // Check if shiny is allowed
    if (shiny && isShinyLocked(species)) {
        console.warn(`${species} is shiny-locked, forcing non-shiny`);
        basePokemon.isShiny = false;
    }
    // Check Paradox Pokémon minimum level
    const paradoxMinLevel = getParadoxMinLevel(species);
    if (paradoxMinLevel && level < paradoxMinLevel) {
        console.warn(`${species} minimum level is ${paradoxMinLevel}, adjusting from ${level}`);
        basePokemon.level = paradoxMinLevel;
    }
    // Check event distributions
    const speciesId = species.toLowerCase().replace(/[^a-z0-9]/g, '');
    const eventDistributions = EVENT_POKEMON_DISTRIBUTIONS.get(speciesId);
    if (eventDistributions && eventDistributions.length > 0) {
        const event = eventDistributions[0]; // Use first available event
        console.warn(`${species} is an event Pokémon, applying ${event.eventName} distribution`);
        basePokemon.level = event.level;
        basePokemon.isShiny = event.shininess === 'forced';
        if (event.requiredIVs) {
            basePokemon.IVs = {
                hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31,
                ...event.requiredIVs
            };
        }
        if (event.requiredAbility) {
            basePokemon.ability = event.requiredAbility;
        }
        if (event.requiredNature) {
            basePokemon.nature = event.requiredNature;
        }
    }
    return basePokemon;
}
// Note: LegalityResult, GENERATION_CONSTRAINTS, SHINY_LOCKED_POKEMON, BALL_INHERITANCE_RULES, EncounterType are already exported above
