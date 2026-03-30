import { PrismaClient } from '@prisma/client';
import { PLATFORMS, CONDITIONS } from '../src/config/taxonomy';

const prisma = new PrismaClient();

const DESCRIPTIONS = [
    "Een must-have voor elke serieuze verzamelaar.",
    "In uitstekende staat, getests en werkend.",
    "Beleef de nostalgie opnieuw met deze klassieker.",
    "Zeldzame vondst in deze conditie.",
    "Perfect voor een avondje retro gaming."
];

const GAMES = [
    { title: "GoldenEye 007", platform: "Nintendo 64" },
    { title: "The Legend of Zelda: Ocarina of Time", platform: "Nintendo 64" },
    { title: "Super Mario 64", platform: "Nintendo 64" },
    { title: "Metal Gear Solid", platform: "PlayStation 1" },
    { title: "Final Fantasy VII", platform: "PlayStation 1" },
    { title: "Resident Evil 2", platform: "PlayStation 1" },
    { title: "Halo: Combat Evolved", platform: "Xbox Classic" },
    { title: "Sonic Adventure", platform: "Sega Dreamcast" },
    { title: "Metroid Prime", platform: "Nintendo GameCube" },
    { title: "Super Smash Bros. Melee", platform: "Nintendo GameCube" },
    { title: "Pokémon Red Version", platform: "GameBoy" },
    { title: "Tetris", platform: "GameBoy" },
    { title: "The Legend of Zelda: A Link to the Past", platform: "SNES" },
    { title: "Super Mario World", platform: "SNES" },
    { title: "Metal Slug", platform: "Neo Geo" },
    { title: "Garou: Mark of the Wolves", platform: "Neo Geo" },
    { title: "Wii Sports", platform: "Nintendo Wii" },
    { title: "Mario Kart 8", platform: "Nintendo Wii U" },
    { title: "Breath of the Wild", platform: "Nintendo Switch" },
    { title: "Elden Ring", platform: "PlayStation 5" }
];

async function main() {
    console.log('--- Database Reset Starting ---');
    await prisma.orderItem.deleteMany();
    await prisma.product.deleteMany();
    console.log('--- Database Cleared ---');

    console.log('--- Seeding 20 Realistic Games ---');

    for (const game of GAMES) {
        // Random price between €15 (1500) and €180 (18000)
        let price = Math.floor(Math.random() * (18000 - 1500 + 1) + 1500);
        
        if (game.platform === "Neo Geo") {
            price = Math.floor(Math.random() * (75000 - 50000 + 1) + 50000);
        }

        const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
        const stock = Math.random() > 0.15 ? Math.floor(Math.random() * 5) + 1 : 0;
        const imageName = game.title.toLowerCase().replace(/ /g, '-').replace(/:/g, '');
        const imageUrl = `https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop&sig=${imageName}`;

        // Cast prisma.product to any because local types are locked by the dev-server
        await (prisma.product as any).create({
            data: {
                title: game.title,
                platform: game.platform,
                priceInCents: price,
                condition: condition,
                stock: stock,
                imageUrl: imageUrl,
                isLegacy: false,
                isWeekdeal: Math.random() > 0.8
            }
        });
        
        console.log(`Seeded: ${game.title} (${game.platform}) - €${(price / 100).toFixed(2)} [Stock: ${stock}]`);
    }

    console.log('--- Seeding Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
