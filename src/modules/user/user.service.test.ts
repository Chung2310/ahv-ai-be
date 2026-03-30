import * as userService from './user.service';
import User from './user.model';
import { ApiError } from '../../common/utils/ApiError';

// Mock Mongoose model
jest.mock('./user.model');
// Mock bcrypt
jest.mock('bcryptjs');

describe('User Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserByEmail', () => {
        test('Nên tìm thấy người dùng theo email', async () => {
            const mockUser = { email: 'test@ex.com' };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            const result = await userService.getUserByEmail('test@ex.com');
            expect(result).toEqual(mockUser);
        });
    });

    describe('loginUserWithEmailAndPassword', () => {
        test('Nên trả về user nếu thông tin đăng nhập đúng', async () => {
            const mockUser = { 
                email: 'test@ex.com', 
                isPasswordMatch: jest.fn().mockResolvedValue(true) 
            };
            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const result = await userService.loginUserWithEmailAndPassword('test@ex.com', 'pass123');
            expect(result).toEqual(mockUser);
        });

        test('Nên ném lỗi 401 nếu không tìm thấy người dùng', async () => {
            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await expect(userService.loginUserWithEmailAndPassword('w@ex.com', 'p'))
                .rejects.toThrow('Email hoặc mật khẩu không chính xác');
        });

        test('Nên ném lỗi 401 nếu mật khẩu không khớp', async () => {
            const mockUser = { isPasswordMatch: jest.fn().mockResolvedValue(false) };
            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await expect(userService.loginUserWithEmailAndPassword('t@ex.com', 'wrong'))
                .rejects.toThrow('Email hoặc mật khẩu không chính xác');
        });
    });

    describe('createUser', () => {
        test('Nên tạo người dùng thành công nếu email chưa tồn tại', async () => {
            const mockBody = { email: 'test@example.com', password: 'password123' };
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.create as jest.Mock).mockResolvedValue(mockBody);

            const result = await userService.createUser(mockBody as unknown as never);

            expect(User.findOne).toHaveBeenCalledWith({ email: mockBody.email });
            expect(User.create).toHaveBeenCalledWith(mockBody);
            expect(result).toEqual(mockBody);
        });

        test('Nên tạo người dùng thành công nếu không có email', async () => {
            const mockBody = { name: 'NoEmail' };
            (User.create as jest.Mock).mockResolvedValue(mockBody);
            await userService.createUser(mockBody as unknown as never);
            expect(User.findOne).not.toHaveBeenCalled();
            expect(User.create).toHaveBeenCalled();
        });

        test('Nên báo lỗi 400 nếu email đã được sử dụng', async () => {
            (User.findOne as jest.Mock).mockResolvedValue({ email: 'taken@example.com' });

            await expect(userService.createUser({ email: 'taken@example.com' } as unknown as never))
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

        test('Nên báo lỗi 400 nếu email mới đã bị người khác sử dụng', async () => {
            (User.findById as jest.Mock).mockResolvedValue({ id: 'u1' });
            (User.findOne as jest.Mock).mockResolvedValue({ id: 'u2' }); // Khác ID

            await expect(userService.updateUserById('u1', { email: 'dup@ex.com' }))
                .rejects.toThrow('Email đã tồn tại');
        });

        test('Nên cập nhật thành công nếu không cập nhật email', async () => {
            const mockUser = { save: jest.fn().mockResolvedValue(true) };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);
            await userService.updateUserById('u1', { name: 'New Name' });
            expect(User.findOne).not.toHaveBeenCalled();
            expect(mockUser.save).toHaveBeenCalled();
        });
    });

    describe('deleteUserById', () => {
        test('Nên xóa user thành công nếu tồn tại', async () => {
            const mockUser = { deleteOne: jest.fn().mockResolvedValue(true) };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.deleteUserById('507f1f77bcf86cd799439011');
            expect(result).toBe(mockUser);
            expect(mockUser.deleteOne).toHaveBeenCalled();
        });

        test('Nên ném lỗi 404 nếu xóa user không tồn tại', async () => {
            (User.findById as jest.Mock).mockResolvedValue(null);
            await expect(userService.deleteUserById('invalid')).rejects.toThrow('Người dùng không tồn tại');
        });
    });

    describe('queryUsers', () => {
        test('Nên trả về kết quả phân trang', async () => {
            const mockUsers = [{ name: 'User1' }];
            const mockFind = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockUsers),
                then: jest.fn().mockImplementation((resolve) => resolve(mockUsers))
            };
            (User.find as jest.Mock).mockReturnValue(mockFind);
            (User.countDocuments as jest.Mock).mockResolvedValue(1);

            const result = await userService.queryUsers({}, { limit: 10, page: 1 });
            expect(result.items).toEqual(mockUsers);
            expect(result.totalItems).toBe(1);
        });
    });
});
