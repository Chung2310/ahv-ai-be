import { ApiError } from './ApiError';

describe('ApiError utility', () => {
    test('Nên khởi tạo ApiError với stack trace tự động', () => {
        const error = new ApiError(404, 'Not Found');
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Not Found');
        expect(error.stack).toBeDefined();
    });

    test('Nên khởi tạo ApiError với stack trace được cung cấp', () => {
        const customStack = 'Custom Stack Trace';
        const error = new ApiError(500, 'Error', false, customStack);
        expect(error.stack).toBe(customStack);
    });
});
