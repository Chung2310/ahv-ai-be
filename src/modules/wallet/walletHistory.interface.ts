import { Types } from 'mongoose';

export interface IWalletHistory {
    user: Types.ObjectId | string;
    type: 'deposit' | 'withdraw' | 'payment';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
