import * as walletService from './wallet.service';
import Wallet from './wallet.model';
import WalletHistory from './walletHistory.model';
import { ApiError } from '../../common/utils/ApiError';

// Mock Mongoose model
jest.mock('./wallet.model');
jest.mock('./walletHistory.model');

describe('Wallet Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createWallet', () => {
        test('Nên tạo ví thành công', async () => {
            const mockBody = { user: 'user123', balance: 1000 };
            (Wallet.create as jest.Mock).mockResolvedValue(mockBody);
            const result = await walletService.createWallet(mockBody);
            expect(result).toEqual(mockBody);
        });
    });

    describe('getWalletByUserId', () => {
        test('Nên trả về ví nếu tìm thấy', async () => {
            const mockWallet = { user: '507f1f77bcf86cd799439011', balance: 500 };
            (Wallet.findOne as jest.Mock).mockResolvedValue(mockWallet);
            const result = await walletService.getWalletByUserId('507f1f77bcf86cd799439011');
            expect(result).toEqual(mockWallet);
        });

        test('Nên ném lỗi nếu không tìm thấy ví', async () => {
            (Wallet.findOne as jest.Mock).mockResolvedValue(null);
            await expect(walletService.getWalletByUserId('507f1f77bcf86cd799439011')).rejects.toThrow(ApiError);
        });
    });

    describe('updateBalance', () => {
        test('Nên cập nhật số dư thành công', async () => {
            const mockWallet = { balance: 100 };
            (Wallet.findOne as jest.Mock).mockResolvedValue(mockWallet);
            (Wallet.findOneAndUpdate as jest.Mock).mockResolvedValue({ balance: 150 });
            (WalletHistory.create as jest.Mock).mockResolvedValue({});

            const result = await walletService.updateBalance('507f1f77bcf86cd799439011', 50);
            expect(result.balance).toBe(150);
        });

        test('Nên báo lỗi nếu số dư không đủ', async () => {
            (Wallet.findOne as jest.Mock).mockResolvedValue({ balance: 30 });
            await expect(walletService.updateBalance('507f1f77bcf86cd799439011', -50)).rejects.toThrow('Số dư không đủ');
        });

        test('Nên thực hiện logic retry nếu bị xung đột', async () => {
            (Wallet.findOne as jest.Mock).mockResolvedValue({ balance: 100 });
            (Wallet.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(null);
            (Wallet.findOneAndUpdate as jest.Mock).mockResolvedValueOnce({ balance: 150 });
            const result = await walletService.updateBalance('507f1f77bcf86cd799439011', 50);
            expect(result.balance).toBe(150);
        });
    });

    describe('queryWallets', () => {
        test('Nên trả về danh sách ví phân trang', async () => {
            const mockItems = [{ user: '507f1f77bcf86cd799439011' }];
            const mockFind = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockItems)
            };
            (Wallet.find as jest.Mock).mockReturnValue(mockFind);
            (Wallet.countDocuments as jest.Mock).mockResolvedValue(1);

            const result = await walletService.queryWallets({}, { limit: 10, page: 1 });
            expect(result.items).toEqual(mockItems);
        });
    });
});
