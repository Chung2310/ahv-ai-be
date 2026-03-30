import * as tokenService from './token.service';
import Token from './token.model';
import jwt from 'jsonwebtoken';
import moment from 'moment';

// Mock models
jest.mock('./token.model');
// Mock jwt
jest.mock('jsonwebtoken');

describe('Token Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generateAuthTokens', () => {
        test('Nên tạo bộ access và refresh tokens thành công', async () => {
            const mockUser = { id: 'user123' };
            (jwt.sign as jest.Mock).mockReturnValue('mocked_token');
            (Token.create as jest.Mock).mockResolvedValue({});

            const tokens = await tokenService.generateAuthTokens(mockUser as any);

            expect(tokens.access.token).toBe('mocked_token');
            expect(tokens.refresh.token).toBe('mocked_token');
            expect(Token.create).toHaveBeenCalled(); // Nên save refresh token
        });
    });

    describe('verifyToken', () => {
        test('Nên xác thực token thành công nếu hợp lệ', async () => {
            const mockPayload = { sub: 'user123' };
            const mockTokenDoc = { token: 'valid_token' };
            (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
            (Token.findOne as jest.Mock).mockResolvedValue(mockTokenDoc);

            const result = await tokenService.verifyToken('valid_token', 'refresh');

            expect(result).toEqual(mockTokenDoc);
            expect(Token.findOne).toHaveBeenCalledWith({
                token: 'valid_token',
                type: 'refresh',
                user: 'user123',
                blacklisted: false
            });
        });

        test('Nên báo lỗi nếu không tìm thấy token trong DB', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ sub: 'user123' });
            (Token.findOne as jest.Mock).mockResolvedValue(null);

            await expect(tokenService.verifyToken('invalid', 'refresh')).rejects.toThrow('Token not found');
        });
    });
});
