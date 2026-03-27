import { Document, Types } from 'mongoose';

export interface IWallet extends Document {
    user: Types.ObjectId | string;
    balance: number;
    currency: string;
    createdAt?: Date;
    updatedAt?: Date;
}
