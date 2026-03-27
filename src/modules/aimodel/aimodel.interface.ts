import { Document } from 'mongoose';

export interface IAiModel extends Document {
    name: string;
    provider: string;
    description?: string;
    isActive: boolean;
    price: string;
    payload?: string;
    image?: string;
}
