import { Document } from 'mongoose';

export interface IAiModel extends Document {
    name: string;
    version: string;
    provider: string;
    description?: string;
    isActive: boolean;
}
