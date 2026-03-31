import { Prisma } from '@prisma/client';

/**
 * Hard-deletes all related shadow-model records for an animal.
 * Used during disposal events (sell/death/donation) and animal deletion.
 */
export async function deleteRelatedRecords(tx: Prisma.TransactionClient, animalId: string) {
    // Health-service records
    await tx.medicalRecord.deleteMany({ where: { animalId } });
    await tx.vaccinationRecord.deleteMany({ where: { animalId } });
    await tx.dewormingRecord.deleteMany({ where: { animalId } });
    await tx.labRecord.deleteMany({ where: { animalId } });

    // Production-service records
    await tx.milkRecord.deleteMany({ where: { animalId } });

    // Breeding-service records
    await tx.parityRecord.deleteMany({ where: { animalId } });
    await tx.heatRecord.deleteMany({ where: { animalId } });
    await tx.dryOffRecord.deleteMany({ where: { animalId } });
    await tx.conceptionJourney.deleteMany({ where: { animalId } });
}
