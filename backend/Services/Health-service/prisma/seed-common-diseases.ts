/**
 * Seed script to insert common diseases (visible to ALL gaushalas).
 * Common diseases have gaushalaId = null.
 *
 * Run:  npx tsx prisma/seed-common-diseases.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMMON_DISEASES = [
    { name: 'Mastitis' },
    { name: 'Foot and Mouth Disease (FMD)' },
    { name: 'Lumpy Skin Disease (LSD)' },
    { name: 'Black Quarter (BQ)' },
    { name: 'Hemorrhagic Septicemia (HS)' },
];

async function main() {
    console.log('Seeding common diseases...');

    for (const disease of COMMON_DISEASES) {
        const existing = await prisma.diseaseMaster.findFirst({
            where: { name: disease.name, gaushalaId: null }
        });

        if (existing) {
            console.log(`  Already exists: ${disease.name}`);
            continue;
        }

        await prisma.diseaseMaster.create({
            data: {
                name: disease.name,
                gaushalaId: null,
            }
        });
        console.log(`  Created: ${disease.name}`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        throw e;
    })
    .finally(() => prisma.$disconnect());
