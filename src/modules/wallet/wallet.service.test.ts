import * as walletService from './wallet.service';
import Wallet from './wallet.model';
import { ApiError } from '../../common/utils/ApiError';

// Mock Mongoose model
jest.mock('./wallet.model');

describe('Wallet Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createWallet', () => {
        test('Nên tạo ví thành công', async () => {
            const mockBody = { user: 'user123', balance: 1000 };
            (Wallet.create as jest.Mock).mockResolvedValue(mockBody);

            const result = await walletService.createWallet(mockBody);

            expect(Wallet.create).toHaveBeenCalledWith(mockBody);
            expect(result).toEqual(mockBody);
        });
    });

    describe('getWalletByUserId', () => {
        test('Nên trả về ví nếu tìm thấy', async () => {
            const mockWallet = { user: '507f191e810c19729de860ea', balance: 500 };
            (Wallet.findOne as jest.Mock).mockResolvedValue(mockWallet);

            const result = await walletService.getWalletByUserId('507f191e810c19729de860ea');

            expect(Wallet.findOne).toHaveBeenCalledWith({ user: '507f191e810c19729de860ea' });
            expect(result).toEqual(mockWallet);
        });

        test('Nên ném lỗi nếu không tìm thấy ví', async () => {
            (Wallet.findOne as jest.Mock).mockResolvedValue(null);
            await expect(walletService.getWalletByUserId('507f191e810c19729de860ea')).rejects.toThrow(ApiError);
        });
    });

    describe('updateBalance', () => {
        test('Nên cập nhật số dư thành công', async () => {
            const mockWallet = { 
                balance: 100, 
                save: jest.fn().mockResolvedValue(true) 
            };
            (Wallet.findOne as jest.Mock).mockResolvedValue(mockWallet);
            (Wallet.findOneAndUpdate as jest.Mock).mockResolvedValue({ balance: 150 });

            // Nạp thêm 50 -> 150
            const result = await walletService.updateBalance('507f191e810c19729de860ea', 50);

            expect(result.balance).toBe(150);
        });

        test('Nên báo lỗi nếu số dư sau cập nhật < 0', async () => {
            const mockWallet = { balance: 30 };
            (Wallet.findOne as jest.Mock).mockResolvedValue(mockWallet);

            // Trừ 50 -> -20 (Lỗi)
            await expect(walletService.updateBalance('507f191e810c19729de860ea', -50))
                .rejects.toThrow(new ApiError(400, 'Số dư không đủ'));
        });
    });
});
