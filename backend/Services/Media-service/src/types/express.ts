import { Request } from 'express';

export enum Role {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
    VETERINARIAN = 'VETERINARIAN'
}

export interface UserPayload {
    userId: string;
    email?: string;
    name?: string;
    role?: Role;
}

export interface GaushalaContext {
    id: string;
    role: Role;
}

export interface AuthRequest extends Request {
    user?: UserPayload;
    gaushala?: GaushalaContext;
    headers: Request['headers'] & {
        'gaushala-id'?: string;
    };
}
