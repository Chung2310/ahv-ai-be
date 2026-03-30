import ahvService from './ahv.service';
import axios from 'axios';
import ENVIRONMENT from '../../common/constants/environment.constant';

// Mock axios
jest.mock('axios', () => {
    return {
        create: jest.fn().mockReturnValue({
            post: jest.fn(),
            get: jest.fn(),
        }),
    };
});

describe('AhvService', () => {
    const mockClient = (axios.create as jest.Mock).mock.results[0].value;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        test('Nên gọi API tạo job thành công', async () => {
            const mockPayload = { input: 'test' };
            const mockResponse = { data: { job_id: 'job123', status: 'queued' } };
            mockClient.post.mockResolvedValue(mockResponse);

            const result = await ahvService.createTask(mockPayload);

            expect(mockClient.post).toHaveBeenCalledWith('/v1/jobs', mockPayload);
            expect(result).toEqual(mockResponse.data);
        });

        test('Nên ném lỗi nếu API lỗi', async () => {
            mockClient.post.mockRejectedValue(new Error('Network Error'));
            await expect(ahvService.createTask({})).rejects.toThrow('Network Error');
        });
    });

    describe('getTask', () => {
        test('Nên gọi API lấy thông tin job thành công', async () => {
            const jobId = 'job123';
            const mockResponse = { data: { job: { status: 'succeeded' } } };
            mockClient.get.mockResolvedValue(mockResponse);

            const result = await ahvService.getTask(jobId);

            expect(mockClient.get).toHaveBeenCalledWith('/v1/jobs/' + jobId);
            expect(result).toEqual(mockResponse.data);
        });

        test('Nên ném lỗi nếu API lấy job lỗi', async () => {
            mockClient.get.mockRejectedValue(new Error('Not Found'));
            await expect(ahvService.getTask('invalid')).rejects.toThrow('Not Found');
        });
    });
});
