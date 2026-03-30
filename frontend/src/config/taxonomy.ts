/**
 * Centralized Taxonomy Configuration for "A Big Boy's Game"
 * 
 * ABSOLUTE RULE: No hardcoded platform or condition strings should exist elsewhere 
 * in the application. Import from this file to ensure data integrity.
 */

export const PLATFORMS = [
    "PlayStation 5", "PlayStation 4", "PlayStation 3", "PlayStation 2", "PlayStation 1",
    "PSP", "PS Vita", 
    "Nintendo Switch", "Nintendo Wii U", "Nintendo Wii", "Nintendo GameCube", "Nintendo 64", 
    "SNES", "NES", "GameBoy", "GameBoy Color", "GameBoy Advance", "Nintendo DS", "Nintendo 3DS",
    "Xbox Series X", "Xbox One", "Xbox 360", "Xbox Classic",
    "Sega Dreamcast", "Sega Saturn", "Sega Genesis", "Sega Game Gear",
    "PC", "Atari", "Neo Geo"
] as const;

export const CONDITIONS = [
    "Nieuw", 
    "CIB (Compleet)", 
    "Loose (Alleen disk/card)", 
    "Zonder handleiding"
] as const;

export const PRICE_RANGES = [
    { id: 'low', label: "Tot €170", max: 17000 },
    { id: 'mid', label: "Tot €250", max: 25000 },
    { id: 'high', label: "Premium (€500+)", min: 50000 }
] as const;

export type Platform = typeof PLATFORMS[number];
export type Condition = typeof CONDITIONS[number];

/**
 * Metadata for grouping platforms by brand in the UI Sidebar.
 */
export const PLATFORM_GROUPS = [
    {
        brand: "PlayStation",
        platforms: ["PlayStation 5", "PlayStation 4", "PlayStation 3", "PlayStation 2", "PlayStation 1", "PSP", "PS Vita"] as Platform[]
    },
    {
        brand: "Nintendo",
        platforms: ["Nintendo Switch", "Nintendo Wii U", "Nintendo Wii", "Nintendo GameCube", "Nintendo 64", "SNES", "NES", "GameBoy", "GameBoy Color", "GameBoy Advance", "Nintendo DS", "Nintendo 3DS"] as Platform[]
    },
    {
        brand: "Xbox",
        platforms: ["Xbox Series X", "Xbox One", "Xbox 360", "Xbox Classic"] as Platform[]
    },
    {
        brand: "Sega",
        platforms: ["Sega Dreamcast", "Sega Saturn", "Sega Genesis", "Sega Game Gear"] as Platform[]
    },
    {
        brand: "Other",
        platforms: ["PC", "Atari", "Neo Geo"] as Platform[]
    }
] as const;
