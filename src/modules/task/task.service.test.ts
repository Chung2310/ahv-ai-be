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

            // Kiểm tra các bước logic
            expect(walletService.updateBalance).toHaveBeenCalledWith(userId, -100, expect.any(String));
            expect(Task.create).toHaveBeenCalled();
            expect(taskQueue.add).toHaveBeenCalledWith(
                'process_task',
                expect.objectContaining({ taskId: '507f1f77bcf86cd799439012', aiModelId: '507f1f77bcf86cd799439011' }),
                expect.any(Object)
            );
            expect(result).toEqual(mockTask);
        });
    });

    describe('handleWebhook', () => {
        test('Nên cập nhật trạng thái task thành công từ webhook', async () => {
            const mockTask = { 
                status: 'pending', 
                save: jest.fn().mockResolvedValue(true) 
            };
            (Task.findById as jest.Mock).mockResolvedValue(mockTask);

            const payload = { status: 'succeeded', result: { url: 'http://img.png' } };
            await taskService.handleWebhook('507f1f77bcf86cd799439012', payload);

            expect(mockTask.status).toBe('succeeded');
            expect(mockTask.save).toHaveBeenCalled();
        });
    });
});
