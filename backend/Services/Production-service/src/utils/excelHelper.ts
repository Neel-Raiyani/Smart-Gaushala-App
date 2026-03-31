import ExcelJS from 'exceljs';
import { Response } from 'express';
import logger from './logger.js';

export interface MilkExportData {
    cowName: string;
    tagNumber: string;
    days: {
        [day: number]: {
            MORNING?: number;
            EVENING?: number;
        }
    };
    totalMonthly: number;
}

export const generateMonthlyMilkReport = async (
    res: Response, 
    data: MilkExportData[], 
    month: number, 
    year: number
) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Milk Report ${month}-${year}`);

        const daysInMonth = new Date(year, month, 0).getDate();

        // Build columns
        const columns: any[] = [
            { header: 'Cow Name', key: 'cowName', width: 20 },
            { header: 'Tag No.', key: 'tagNumber', width: 15 }
        ];

        for (let i = 1; i <= daysInMonth; i++) {
            columns.push({ header: `Day ${i} (M)`, key: `day${i}M`, width: 10 });
            columns.push({ header: `Day ${i} (E)`, key: `day${i}E`, width: 10 });
        }

        columns.push({ header: 'Total Monthly (L)', key: 'totalMonthly', width: 20 });
        worksheet.columns = columns;

        // Header Styling
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Data processing
        data.forEach(item => {
            const rowData: any = {
                cowName: item.cowName,
                tagNumber: item.tagNumber,
                totalMonthly: item.totalMonthly
            };

            for (let i = 1; i <= daysInMonth; i++) {
                rowData[`day${i}M`] = item.days[i]?.MORNING !== undefined ? item.days[i].MORNING : '-';
                rowData[`day${i}E`] = item.days[i]?.EVENING !== undefined ? item.days[i].EVENING : '-';
            }

            worksheet.addRow(rowData);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Monthly_Milk_Report_${month}_${year}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        logger.error('Error generating Monthly Milk Excel report:', error);
        throw error;
    }
};
