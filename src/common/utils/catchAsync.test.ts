import catchAsync from './catchAsync';
import { Request, Response, NextFunction } from 'express';

describe('catchAsync utility', () => {
    test('Nên thực thi function thành công và không gọi next', async () => {
        const mockFn = jest.fn().mockResolvedValue('success');
        const mockReq = {} as any;
        const mockRes = {} as any;
        const mockNext = jest.fn() as any;

        const wrapped = catchAsync(mockFn);
        await wrapped(mockReq, mockRes, mockNext);

        expect(mockFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('Nên bắt lỗi bất đồng bộ và gọi next(err)', async () => {
        const error = new Error('Async Error');
        const mockFn = jest.fn().mockRejectedValue(error);
        const mockReq = {} as any;
        const mockRes = {} as any;
        const mockNext = jest.fn() as any;

        const wrapped = catchAsync(mockFn);
        wrapped(mockReq, mockRes, mockNext);

        // Chờ xử lý bất đồng bộ trong catchAsync
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockFn).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
    });
});
