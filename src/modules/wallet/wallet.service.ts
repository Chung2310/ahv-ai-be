import mongoose from 'mongoose';
import Wallet from './wallet.model';
import WalletHistory from './walletHistory.model';
import { ApiError } from '../../common/utils/ApiError';
import { IPaginatedResult } from '../../common/interfaces/pagination.interface';
import { IWallet } from './wallet.interface';

export const createWallet = async (body: { user: string; balance?: number; currency?: string }) => {
    return Wallet.create(body);
};

export const getWalletByUserId = async (userId: string) => {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new ApiError(404, 'Không tìm thấy ví');
    return wallet;
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
        user: userObjectId,
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
        user: userObjectId,
        type: amount > 0 ? 'deposit' : 'withdraw',
        amount: Math.abs(amount),
        balanceBefore,
        balanceAfter,
        description,
    });

    return updatedWallet;
};

export const queryWallets = async (
    filter: Record<string, unknown>,
    options: { limit?: number; page?: number; sortBy?: string },
): Promise<IPaginatedResult<IWallet>> => {
    const { limit = 10, page = 1, sortBy = 'createdAt:desc' } = options;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
        Wallet.find(filter).sort(sortBy).skip(skip).limit(limit).populate('user', 'name email'),
        Wallet.countDocuments(filter),
    ]);

    return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
    };
};
