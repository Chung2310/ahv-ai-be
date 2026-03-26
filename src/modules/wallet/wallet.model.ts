import { Schema, model } from 'mongoose';
import { IWallet } from './wallet.interface';

const walletSchema = new Schema<IWallet>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
        balance: { type: Number, default: 0, min: 0 },
        currency: { type: String, default: 'VND' },
    },
    {
        timestamps: true,
    },
);

const Wallet = model<IWallet>('Wallet', walletSchema);
export default Wallet;
