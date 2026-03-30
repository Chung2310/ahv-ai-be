import { processTaskJob } from './task.worker';
import Task from './task.model';
import ahvService from './ahv.service';
import { sleep } from '../../common/utils/sleep.util';

// Mock everything
jest.mock('./task.model');
jest.mock('./ahv.service');
jest.mock('../../common/utils/sleep.util', () => ({
    sleep: jest.fn().mockResolvedValue(undefined)
}));
jest.mock('../../common/utils/logger'); // Giảm nhiễu console

describe('Task Worker Processor', () => {
    interface MockTask {
        _id: string;
        status: string;
        error?: string;
        save: jest.Mock;
    }

    const mockJob = {
        id: 'job123',
        data: {
            taskId: '507f1f77bcf86cd799439011',
            payload: { prompt: 'test' }
        }
    } as unknown;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Nên xử lý task thành công qua polling', async () => {
        const mockTask: MockTask = { 
            _id: '507f1f77bcf86cd799439011', 
            status: 'pending',
            save: jest.fn().mockResolvedValue(true)
        };
        (Task.findById as jest.Mock).mockResolvedValue(mockTask);
        (ahvService.createTask as jest.Mock).mockResolvedValue({ job_id: 'ahv-job-1', status: 'queued' });
        
        // Polling mock: lần 1 processing, lần 2 succeeded
        (ahvService.getTask as jest.Mock)
            .mockResolvedValueOnce({ job: { status: 'processing' } })
            .mockResolvedValueOnce({ job: { status: 'succeeded', result: { url: 'http://done.com' } } });

        await processTaskJob(mockJob as unknown as never);

        expect(ahvService.createTask).toHaveBeenCalled();
        expect(mockTask.save).toHaveBeenCalled();
        expect(mockTask.status).toBe('succeeded');
        expect(sleep).toHaveBeenCalledTimes(2); // Đợi 2 lần polling
    });

    test('Nên xử lý lỗi khi AHV báo failed', async () => {
        const mockTask: MockTask = { 
            _id: '507f1f77bcf86cd799439011', 
            status: 'pending',
            save: jest.fn().mockResolvedValue(true)
        };
        (Task.findById as jest.Mock).mockResolvedValue(mockTask);
        (ahvService.createTask as jest.Mock).mockResolvedValue({ job_id: 'ahv-job-1' });
        (ahvService.getTask as jest.Mock).mockResolvedValue({ job: { status: 'failed', error: 'Internal Error' } });

        await expect(processTaskJob(mockJob as unknown as never)).resolves.toBeUndefined(); // Worker catches internally and updates task status

        expect(mockTask.status).toBe('failed');
        expect(mockTask.error).toBe('Internal Error');
    });

    test('Nên ném lỗi nếu không tìm thấy task', async () => {
        (Task.findById as jest.Mock).mockResolvedValue(null);
        await expect(processTaskJob(mockJob as unknown as never)).rejects.toThrow('Task 507f1f77bcf86cd799439011 not found');
    });

    test('Nên ném lỗi timeout nếu không hoàn thành sau maxAttempts', async () => {
        const mockTask = { _id: 't1', save: jest.fn().mockResolvedValue(true) };
        (Task.findById as jest.Mock).mockResolvedValue(mockTask);
        (ahvService.createTask as jest.Mock).mockResolvedValue({ job_id: 'ahv1' });
        // Luôn trả về processing cho đến khi hết attempts
        (ahvService.getTask as jest.Mock).mockResolvedValue({ job: { status: 'processing' } });

        await expect(processTaskJob(mockJob as unknown as never)).rejects.toThrow('Polling timeout');
    });

    test('Nên xử lý lỗi nghiêm trọng trong try-catch chính', async () => {
        (Task.findById as jest.Mock).mockRejectedValue(new Error('DB Error'));
        // Không ném lỗi ra ngoài vì catch nội bộ đẩy error lên job? 
        // Thực tế code re-throw error: throw error; (Line 104)
        await expect(processTaskJob(mockJob as unknown as never)).rejects.toThrow('DB Error');
    });

    test('Nên xử lý khi jobInfo bị thiếu trong quá trình polling', async () => {
        const mockTask = { _id: 't1', save: jest.fn().mockResolvedValue(true) };
        (Task.findById as jest.Mock).mockResolvedValue(mockTask);
        (ahvService.createTask as jest.Mock).mockResolvedValue({ job_id: 'ahv1' });
        
        // Mock getTask trả về data rỗng 1 lần, sau đó succeeded
        (ahvService.getTask as jest.Mock)
            .mockResolvedValueOnce({}) // Missing jobInfo
            .mockResolvedValueOnce({ job: { status: 'succeeded' } });

        await processTaskJob(mockJob as unknown as never);
        expect(ahvService.getTask).toHaveBeenCalledTimes(2);
    });
});
