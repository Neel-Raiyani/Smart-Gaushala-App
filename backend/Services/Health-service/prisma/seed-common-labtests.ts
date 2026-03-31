/**
 * Seed script to insert common lab tests (visible to ALL gaushalas).
 * Common lab tests have gaushalaId = null.
 *
 * Run:  npx tsx prisma/seed-common-labtests.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMMON_LABTESTS = [
    { name: 'CBC (Complete Blood Count)' },
    { name: 'Milk Culture & Sensitivity' },
    { name: 'Brucella Test (RBPT)' },
    { name: 'Tuberculin Test (PPD)' },
    { name: 'Blood Smear Examination' },
];

async function main() {
    console.log('Seeding common lab tests...');

    for (const labTest of COMMON_LABTESTS) {
        const existing = await (prisma as any).labtestMaster.findFirst({
            where: { name: labTest.name, gaushalaId: null }
        });

        if (existing) {
            console.log(`  Already exists: ${labTest.name}`);
            continue;
        }

        await (prisma as any).labtestMaster.create({
            data: {
                name: labTest.name,
                gaushalaId: null,
            }
        });
        console.log(`  Created: ${labTest.name}`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        throw e;
    })
    .finally(() => prisma.$disconnect());
