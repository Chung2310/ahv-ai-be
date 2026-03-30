import * as taskService from './task.service';
import Task from './task.model';
import AiModel from '../aimodel/aimodel.model';
import { taskQueue } from './task.queue';
import * as walletService from '../wallet/wallet.service';
import { ApiError } from '../../common/utils/ApiError';

// Mock models
jest.mock('./task.model');
jest.mock('../aimodel/aimodel.model');
// Mock queue
jest.mock('./task.queue', () => ({
    taskQueue: {
        add: jest.fn().mockResolvedValue({ id: 'job1' }),
    },
}));
// Mock dependency services
jest.mock('../wallet/wallet.service');

describe('Task Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        const userId = '507f191e810c19729de860ea';
        const aiModelId = '507f1f77bcf86cd799439011';
        const payload = { input: 'hello' };

        test('Nên báo lỗi nếu AiModel không tồn tại', async () => {
            (AiModel.findById as jest.Mock).mockResolvedValue(null);
            await expect(taskService.createTask(userId, aiModelId, payload))
                .rejects.toThrow(new ApiError(404, 'AiModel không tồn tại'));
        });

        test('Nên báo lỗi nếu AiModel bị vô hiệu hóa', async () => {
            (AiModel.findById as jest.Mock).mockResolvedValue({ isActive: false });
            await expect(taskService.createTask(userId, aiModelId, payload))
                .rejects.toThrow(new ApiError(400, 'AiModel hiện đang bị vô hiệu hóa'));
        });

        test('Nên tạo task thành công, trừ tiền và đẩy vào queue', async () => {
            const mockModel = { _id: '507f1f77bcf86cd799439011', name: 'GPT-4', price: '100', isActive: true };
            const mockTask = { _id: '507f1f77bcf86cd799439012', status: 'pending' };

            (AiModel.findById as jest.Mock).mockResolvedValue(mockModel);
            (walletService.updateBalance as jest.Mock).mockResolvedValue({});
            (Task.create as jest.Mock).mockResolvedValue(mockTask);

            const result = await taskService.createTask(userId, aiModelId, payload);

            expect(walletService.updateBalance).toHaveBeenCalledWith(userId, -100, expect.any(String));
            expect(Task.create).toHaveBeenCalled();
            expect(taskQueue.add).toHaveBeenCalledWith(
                'process_task',
                expect.objectContaining({ taskId: '507f1f77bcf86cd799439012', aiModelId: '507f1f77bcf86cd799439011' }),
                expect.any(Object)
            );
            expect(result).toEqual(mockTask);
        });

        test('Nên sử dụng giá mặc định là 0 nếu aiModel.price không tồn tại', async () => {
            const userId = '507f191e810c19729de860ea';
            const aiModelId = '507f1f77bcf86cd799439011';
            const mockModel = { _id: aiModelId, price: undefined, isActive: true };
            (AiModel.findById as jest.Mock).mockResolvedValue(mockModel);
            (walletService.updateBalance as jest.Mock).mockResolvedValue({});
            (Task.create as jest.Mock).mockResolvedValue({ _id: 't1' });

            await taskService.createTask(userId, aiModelId, { input: 'test' });
            expect(walletService.updateBalance).toHaveBeenCalledWith(userId, -0, expect.any(String));
        });
    });

    describe('handleWebhook', () => {
        test('Nên cập nhật trạng thái task thành công từ webhook', async () => {
            const mockTask = { status: 'pending', save: jest.fn().mockResolvedValue(true) };
            (Task.findById as jest.Mock).mockResolvedValue(mockTask);

            const payload = { status: 'succeeded', result: { url: 'http://img.png' } };
            await taskService.handleWebhook('507f1f77bcf86cd799439012', payload);

            expect(mockTask.status).toBe('succeeded');
            expect(mockTask.save).toHaveBeenCalled();
        });

        test('Nên trả về null nếu không tìm thấy task khi nhận webhook', async () => {
            (Task.findById as jest.Mock).mockResolvedValue(null);
            const result = await taskService.handleWebhook('invalid_id', { status: 'failed' });
            expect(result).toBeNull();
        });

        test('Nên cập nhật trạng thái processing', async () => {
            const mockTask = { status: 'pending', save: jest.fn().mockResolvedValue(true) };
            (Task.findById as jest.Mock).mockResolvedValue(mockTask);
            await taskService.handleWebhook('id', { status: 'processing' });
            expect(mockTask.status).toBe('processing');
        });

        test('Nên cập nhật trạng thái failed và lưu lỗi', async () => {
            const mockTask = { status: 'pending', save: jest.fn().mockResolvedValue(true) };
            (Task.findById as jest.Mock).mockResolvedValue(mockTask);
            await taskService.handleWebhook('id', { status: 'failed', error: 'Internal Error' });
            expect(mockTask.status).toBe('failed');
            expect((mockTask as any).error).toBe('Internal Error');
        });

        test('Nên giữ nguyên trạng thái nếu AHV trả về status không xác định', async () => {
            const mockTask = { status: 'pending', save: jest.fn().mockResolvedValue(true) };
            (Task.findById as jest.Mock).mockResolvedValue(mockTask);
            await taskService.handleWebhook('id', { status: 'unknown_status' });
            expect(mockTask.status).toBe('unknown_status');
            expect(mockTask.save).toHaveBeenCalled();
        });
    });

    describe('queryTasks', () => {
        test('Nên trả về danh sách task phân trang', async () => {
            const mockTasks = [{ id: '1' }];
            const mockFind = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockTasks),
                then: jest.fn().mockImplementation((resolve) => resolve(mockTasks)),
            };
            (Task.find as jest.Mock).mockReturnValue(mockFind);
            (Task.countDocuments as jest.Mock).mockResolvedValue(1);

            const result = await taskService.queryTasks({}, { page: 1, limit: 10 });

            expect(result.data).toEqual(mockTasks);
            expect(result.meta.totalItems).toBe(1);
        });
    });
});
