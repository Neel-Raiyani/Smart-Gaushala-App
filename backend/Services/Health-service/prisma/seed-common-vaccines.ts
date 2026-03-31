/**
 * Seed script to insert common vaccines (visible to ALL gaushalas).
 * Common vaccines have gaushalaId = null.
 *
 * Run:  npx ts-node prisma/seed-common-vaccines.ts
 *  or:  npx tsx prisma/seed-common-vaccines.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMMON_VACCINES = [
    { name: 'FMD (Foot & Mouth Disease)', frequencyMonths: 6 },
    { name: 'HS (Hemorrhagic Septicemia)', frequencyMonths: 6 },
    { name: 'BQ (Black Quarter)', frequencyMonths: 6 },
    { name: 'Brucellosis', frequencyMonths: 6 },
    { name: 'LSD (Lumpy Skin Disease)', frequencyMonths: 6 },
];

async function main() {
    console.log('Seeding common vaccines...');

    for (const vaccine of COMMON_VACCINES) {
        const existing = await prisma.vaccineMaster.findFirst({
            where: { name: vaccine.name, gaushalaId: null }
        });

        if (existing) {
            console.log(`  ⏭  Already exists: ${vaccine.name}`);
            continue;
        }

        await prisma.vaccineMaster.create({
            data: {
                name: vaccine.name,
                gaushalaId: null,
                frequencyMonths: vaccine.frequencyMonths,
            }
        });
        console.log(`  ✅ Created: ${vaccine.name}`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        throw e;
    })
    .finally(() => prisma.$disconnect());
