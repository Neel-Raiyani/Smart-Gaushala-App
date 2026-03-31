/**
 * Custom application error with HTTP status code and error code.
 * Use this throughout the service instead of throwing generic Error objects.
 * 
 * Usage:
 *   throw new AppError('Animal not found', 404, 'ANIMAL_NOT_FOUND');
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
