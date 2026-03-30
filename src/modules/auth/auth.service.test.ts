import * as authService from './auth.service';
import * as userService from '../user/user.service';
import * as tokenService from '../user/token.service';
import * as walletService from '../wallet/wallet.service';
import { ApiError } from '../../common/utils/ApiError';

// Mock các dependencies
jest.mock('../user/user.service');
jest.mock('../user/token.service');
jest.mock('../wallet/wallet.service');
jest.mock('../../common/config/config', () => ({
    initialWalletBalance: 1000,
}));

describe('Auth Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        test('Nên đăng ký thành công, tạo ví và trả về tokens', async () => {
            const mockUser = { id: 'user123', email: 'test@ex.com' };
            const mockTokens = { access: {}, refresh: {} };

            (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
            (tokenService.generateAuthTokens as jest.Mock).mockResolvedValue(mockTokens);
            (walletService.createWallet as jest.Mock).mockResolvedValue({});

            const result = await authService.register({ email: 'test@ex.com' });

            expect(userService.createUser).toHaveBeenCalled();
            expect(walletService.createWallet).toHaveBeenCalledWith({
                user: 'user123',
                balance: 1000,
            });
            expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual({ user: mockUser, tokens: mockTokens });
        });
    });

    describe('login', () => {
        test('Nên đăng nhập thành công và trả về tokens', async () => {
            const mockUser = { id: 'user123' };
            const mockTokens = { access: {}, refresh: {} };

            (userService.loginUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUser);
            (tokenService.generateAuthTokens as jest.Mock).mockResolvedValue(mockTokens);

            const result = await authService.login('test@ex.com', 'password');
 
            expect(userService.loginUserWithEmailAndPassword).toHaveBeenCalledWith('test@ex.com', 'password');
            expect(result.tokens).toBe(mockTokens);
        });

        test('Nên ném lỗi nếu đăng nhập thất bại (userService ném lỗi)', async () => {
            const error = new ApiError(401, 'Sai email hoặc mật khẩu');
            (userService.loginUserWithEmailAndPassword as jest.Mock).mockRejectedValue(error);

            await expect(authService.login('wrong@ex.com', 'wrong_pass')).rejects.toThrow(error);
        });
    });

    describe('refreshToken', () => {
        test('Nên ném lỗi nếu không có token', async () => {
            await expect(authService.refreshToken(undefined)).rejects.toThrow(ApiError);
        });

        test('Nên làm mới token thành công', async () => {
            const mockTokenDoc = { user: 'user123' };
            const mockUser = { id: 'user123' };
            const mockTokens = { access: {}, refresh: {} };

            (tokenService.verifyToken as jest.Mock).mockResolvedValue(mockTokenDoc);
            (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
            (tokenService.generateAuthTokens as jest.Mock).mockResolvedValue(mockTokens);

            const result = await authService.refreshToken('old_refresh_token');
 
            expect(tokenService.verifyToken).toHaveBeenCalledWith('old_refresh_token', 'refresh');
            expect(result.tokens).toBe(mockTokens);
        });

        test('Nên ném lỗi nếu không tìm thấy người dùng sau khi xác thực token', async () => {
            const mockTokenDoc = { user: 'user123' };
            (tokenService.verifyToken as jest.Mock).mockResolvedValue(mockTokenDoc);
            (userService.getUserById as jest.Mock).mockResolvedValue(null);

            await expect(authService.refreshToken('valid_token')).rejects.toThrow('Người dùng không tồn tại');
        });
    });
});
