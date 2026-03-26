import { Schema, model } from 'mongoose';
import { IWalletHistory } from './walletHistory.interface';

const walletHistorySchema = new Schema<IWalletHistory>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: ['deposit', 'withdraw', 'payment'], required: true, index: true },
        amount: { type: Number, required: true },
        balanceBefore: { type: Number, required: true },
        balanceAfter: { type: Number, required: true },
        description: { type: String, trim: true },
    },
    {
        timestamps: true,
    },
);

const WalletHistory = model<IWalletHistory>('WalletHistory', walletHistorySchema);
export default WalletHistory;
