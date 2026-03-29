import { ApiError } from './ApiError';

describe('ApiError Utils', () => {
    test('Nên tạo được một đối tượng ApiError với statusCode và message chính xác', () => {
        const error = new ApiError(400, 'Lỗi yêu cầu không hợp lệ');
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Lỗi yêu cầu không hợp lệ');
        expect(error.isOperational).toBe(true);
    });

    test('Nên tự động tạo stack trace nếu không được cung cấp', () => {
        const error = new ApiError(500, 'Lỗi hệ thống');
        expect(error.stack).toBeDefined();
    });

    test('Nên sử dụng stack trace được cung cấp nếu có', () => {
        const customStack = 'Custom stack trace';
        const error = new ApiError(404, 'Không tìm thấy', true, customStack);
        expect(error.stack).toBe(customStack);
    });
});
