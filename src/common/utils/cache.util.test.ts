import * as cacheUtil from './cache.util';
import redis from '../config/redis';

// Mock Redis client
jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    scanStream: jest.fn(),
    pipeline: jest.fn().mockReturnValue({
      del: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
  },
}));

describe('Cache Utils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('setCache', () => {
        test('Nên gọi redis.set với đối số chính xác', async () => {
            await cacheUtil.setCache('test_key', { a: 1 }, 100);
            expect(redis.set).toHaveBeenCalledWith('test_key', JSON.stringify({ a: 1 }), 'EX', 100);
        });
    });

    describe('getCache', () => {
        test('Nên trả về null nếu không có dữ liệu', async () => {
            (redis.get as jest.Mock).mockResolvedValue(null);
            const res = await cacheUtil.getCache('non_existent');
            expect(res).toBeNull();
        });

        test('Nên phân giải JSON và trả về dữ liệu nếu tồn tại', async () => {
            (redis.get as jest.Mock).mockResolvedValue(JSON.stringify({ data: 'ok' }));
            const res = await cacheUtil.getCache('existent');
            expect(res).toEqual({ data: 'ok' });
        });
    });

    describe('deleteCache', () => {
        test('Nên gọi redis.del với key chính xác', async () => {
            await cacheUtil.deleteCache('delete_me');
            expect(redis.del).toHaveBeenCalledWith('delete_me');
        });
    });

    describe('deleteCacheByPattern', () => {
        test('Nên xóa các key dựa trên logic quét SCAN', async () => {
            const mockStream: any = {
                on: jest.fn((event, cb) => {
                    if (event === 'data') {
                        cb(['key1', 'key2']);
                    }
                    if (event === 'end') {
                        cb();
                    }
                    return mockStream;
                }),
            };
            (redis.scanStream as jest.Mock).mockReturnValue(mockStream);

            await cacheUtil.deleteCacheByPattern('prefix');

            expect(redis.scanStream).toHaveBeenCalledWith({
                match: 'prefix*',
                count: 100,
            });
            expect(redis.pipeline).toHaveBeenCalled();
        });
    });
});
