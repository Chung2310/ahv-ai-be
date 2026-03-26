import { ObjectId } from 'mongoose';

export interface IWalletHistory {
    user: ObjectId;
    type: 'deposit' | 'withdraw' | 'payment';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
