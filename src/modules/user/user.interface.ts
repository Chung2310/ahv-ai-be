import { Document } from 'mongoose';

export interface IUser extends Document {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'admin' | 'superadmin';
    isEmailVerified: boolean;
    isPasswordMatch(password: string): Promise<boolean>;
}
