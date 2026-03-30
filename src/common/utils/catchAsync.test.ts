import catchAsync from './catchAsync';

describe('catchAsync utility', () => {
    test('Nên thực thi function thành công và không gọi next', async () => {
        const mockFn = jest.fn().mockResolvedValue('success');
        const mockReq = {} as unknown;
        const mockRes = {} as unknown;
        const mockNext = jest.fn() as unknown;

        const wrapped = catchAsync(mockFn as unknown as never);
        await wrapped(mockReq as unknown as never, mockRes as unknown as never, mockNext as unknown as never);

        expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('Nên bắt lỗi bất đồng bộ và gọi next(err)', async () => {
        const error = new Error('Async Error');
        const mockFn = jest.fn().mockRejectedValue(error);
        const mockReq = {} as unknown;
        const mockRes = {} as unknown;
        const mockNext = jest.fn() as unknown;

        const wrapped = catchAsync(mockFn as unknown as never);
        wrapped(mockReq as unknown as never, mockRes as unknown as never, mockNext as unknown as never);

        // Chờ xử lý bất đồng bộ trong catchAsync
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockFn).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
    });
});
