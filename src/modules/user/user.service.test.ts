import * as userService from './user.service';
import User from './user.model';
import { ApiError } from '../../common/utils/ApiError';
import bcrypt from 'bcryptjs';

// Mock Mongoose model
jest.mock('./user.model');
// Mock bcrypt
jest.mock('bcryptjs');

describe('User Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        test('Nên tạo người dùng thành công nếu email chưa tồn tại', async () => {
            const mockBody = { email: 'test@example.com', password: 'password123' };
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.create as jest.Mock).mockResolvedValue(mockBody);

            const result = await userService.createUser(mockBody as any);

            expect(User.findOne).toHaveBeenCalledWith({ email: mockBody.email });
            expect(User.create).toHaveBeenCalledWith(mockBody);
            expect(result).toEqual(mockBody);
        });

        test('Nên báo lỗi 400 nếu email đã được sử dụng', async () => {
            (User.findOne as jest.Mock).mockResolvedValue({ email: 'taken@example.com' });

            await expect(userService.createUser({ email: 'taken@example.com' } as any))
                .rejects.toThrow(new ApiError(400, 'Email đã tồn tại'));
        });
    });

    describe('getUserById', () => {
        test('Nên trả về user nếu tìm thấy', async () => {
            const mockUser = { id: '507f1f77bcf86cd799439011', name: 'John' };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.getUserById('507f1f77bcf86cd799439011');
            expect(result).toEqual(mockUser);
        });
    });

    describe('updateUserById', () => {
        test('Nên báo lỗi nếu không tìm thấy user', async () => {
            (User.findById as jest.Mock).mockResolvedValue(null);
            await expect(userService.updateUserById('507f1f77bcf86cd799439011', {})).rejects.toThrow(ApiError);
        });

        test('Nên cập nhật và lưu user thành công', async () => {
            const mockUser = { 
                email: 'old@ex.com', 
                save: jest.fn().mockResolvedValue(true) 
            };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await userService.updateUserById('507f1f77bcf86cd799439011', { email: 'new@ex.com' });

            expect(mockUser.email).toBe('new@ex.com');
            expect(mockUser.save).toHaveBeenCalled();
        });
    });
});
