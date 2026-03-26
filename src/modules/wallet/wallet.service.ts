import mongoose from 'mongoose';
import Wallet from './wallet.model';
import WalletHistory from './walletHistory.model';
import { ApiError } from '../../common/utils/ApiError';

export const createWallet = async (body: { user: string; balance?: number; currency?: string }) => {
    return Wallet.create(body);
};

export const getWalletByUserId = async (userId: string) => {
    return Wallet.findOne({ user: userId });
};

export const updateBalance = async (userId: string, amount: number, description?: string) => {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new ApiError(404, 'Không tìm thấy ví');

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    if (balanceAfter < 0) throw new ApiError(400, 'Số dư không đủ');

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Cập nhật số dư nguyên tử (atomic)
    const updatedWallet = await Wallet.findOneAndUpdate(
        { user: userObjectId, balance: balanceBefore },
        { $inc: { balance: amount } },
        { new: true },
    );

    if (!updatedWallet) {
        // Dự phòng nếu có xung đột trạng thái (race condition)
        const retryWallet = await Wallet.findOneAndUpdate(
            { user: userObjectId },
            { $inc: { balance: amount } },
            { new: true, runValidators: true },
        );
        if (!retryWallet) throw new ApiError(404, 'Không tìm thấy ví để cập nhật');
        
    // Ghi log lịch sử
    await WalletHistory.create({
        user: userObjectId as any,
        type: amount > 0 ? 'deposit' : 'withdraw',
        amount: Math.abs(amount),
        balanceBefore,
        balanceAfter: retryWallet.balance,
        description,
    });

        return retryWallet;
    }

    // Ghi log lịch sử
    await WalletHistory.create({
        user: userObjectId as any,
        type: amount > 0 ? 'deposit' : 'withdraw',
        amount: Math.abs(amount),
        balanceBefore,
        balanceAfter,
        description,
    });

    return updatedWallet;
};
