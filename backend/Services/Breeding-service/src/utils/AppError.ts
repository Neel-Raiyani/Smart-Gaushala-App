/**
 * Custom application error with HTTP status code and error code.
 * Use this throughout the service instead of throwing generic Error objects.
 * 
 * Usage:
 *   throw new AppError('Record not found', 404, 'NOT_FOUND');
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, errorCode?: string) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode || 'INTERNAL_ERROR';
        this.isOperational = true; // distinguishes from programming bugs
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
