import ExcelJS from 'exceljs';
import { Response } from 'express';
import logger from './logger.js';

export interface CowExcelData {
    tagNumber: string;
    name: string;
    animalNumber?: string;
    birthDate: Date;
    parity: number;
    cowGroupName?: string;
    cowBreed?: string;
    isLactating: boolean;
    isPregnant: boolean;
    isDryOff: boolean;
}

export interface BullExcelData {
    tagNumber: string;
    name: string;
    animalNumber?: string;
    birthDate: Date;
    cowBreed?: string;
    isRetired: boolean;
}

const calculateAge = (birthDate: Date): string => {
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
        months -= 1;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} Year`);
    if (months > 0) parts.push(`${months} Month`);
    if (days > 0) parts.push(`${days} Day`);
    
    return parts.length > 0 ? parts.join(', ') : '0 Day';
};

export const generateCowReport = async (res: Response, data: CowExcelData[], phase: string) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${phase} Cows`);

        worksheet.columns = [
            { header: 'Tag No.', key: 'tagNumber', width: 15 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Animal No.', key: 'animalNumber', width: 15 },
            { header: 'Birth Date', key: 'birthDate', width: 15 },
            { header: 'Age', key: 'age', width: 25 },
            { header: 'Parity', key: 'parity', width: 10 },
            { header: 'Group', key: 'cowGroupName', width: 20 },
            { header: 'Breed', key: 'cowBreed', width: 15 },
            { header: 'Lactating', key: 'isLactating', width: 12 },
            { header: 'Pregnant', key: 'isPregnant', width: 12 },
            { header: 'Dry Off', key: 'isDryOff', width: 12 }
        ];

        // Styling the header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        data.forEach(item => {
            worksheet.addRow({
                tagNumber: item.tagNumber,
                name: item.name,
                animalNumber: item.animalNumber || '-',
                birthDate: item.birthDate.toISOString().split('T')[0],
                age: calculateAge(item.birthDate),
                parity: item.parity,
                cowGroupName: item.cowGroupName || '-',
                cowBreed: item.cowBreed || '-',
                isLactating: item.isLactating ? 'Yes' : 'No',
                isPregnant: item.isPregnant ? 'Yes' : 'No',
                isDryOff: item.isDryOff ? 'Yes' : 'No'
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Cow_Report_${phase}_${new Date().toISOString().split('T')[0]}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        logger.error('Error generating Cow Excel report:', error);
        throw error;
    }
};

export const generateBullReport = async (res: Response, data: BullExcelData[], phase: string) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${phase} Bulls`);

        worksheet.columns = [
            { header: 'Tag No.', key: 'tagNumber', width: 15 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Animal No.', key: 'animalNumber', width: 15 },
            { header: 'Birth Date', key: 'birthDate', width: 15 },
            { header: 'Age', key: 'age', width: 25 },
            { header: 'Breed', key: 'cowBreed', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };

        data.forEach(item => {
            worksheet.addRow({
                tagNumber: item.tagNumber,
                name: item.name,
                animalNumber: item.animalNumber || '-',
                birthDate: item.birthDate.toISOString().split('T')[0],
                age: calculateAge(item.birthDate),
                cowBreed: item.cowBreed || '-',
                status: item.isRetired ? 'Retired' : 'Active'
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Bull_Report_${phase}_${new Date().toISOString().split('T')[0]}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        logger.error('Error generating Bull Excel report:', error);
        throw error;
    }
};
