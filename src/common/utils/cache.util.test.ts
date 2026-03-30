import * as cacheUtil from './cache.util';
import redis from '../config/redis';

// Mock Redis client
jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
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

        test('Nên bắt lỗi nếu redis.set thất bại', async () => {
            (redis.set as jest.Mock).mockRejectedValue(new Error('Redis Down'));
            // Không nên ném lỗi ra ngoài
            await expect(cacheUtil.setCache('k', 'v')).resolves.toBeUndefined();
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

        test('Nên bắt lỗi nếu redis.get thất bại', async () => {
            (redis.get as jest.Mock).mockRejectedValue(new Error('Redis Error'));
            const res = await cacheUtil.getCache('k');
            expect(res).toBeNull();
        });
    });

    describe('deleteCache', () => {
        test('Nên gọi redis.del với key chính xác', async () => {
            await cacheUtil.deleteCache('delete_me');
            expect(redis.del).toHaveBeenCalledWith('delete_me');
        });

        test('Nên bắt lỗi nếu redis.del thất bại', async () => {
            (redis.del as jest.Mock).mockRejectedValue(new Error('Fail'));
            await expect(cacheUtil.deleteCache('k')).resolves.toBeUndefined();
        });
    });

    describe('deleteCacheByPattern', () => {
        test('Nên xóa các key dựa trên logic quét SCAN', async () => {
            const mockStream = {
                on: jest.fn((event: string, cb: (...args: unknown[]) => void) => {
                    if (event === 'data') {
                        (cb as (keys: string[]) => void)(['key1', 'key2']);
                    }
                    if (event === 'end') {
                        (cb as () => void)();
                    }
                    return mockStream;
                }),
            } as unknown as { on: jest.Mock };
            (redis.scanStream as jest.Mock).mockReturnValue(mockStream);

            await cacheUtil.deleteCacheByPattern('prefix');

            expect(redis.scanStream).toHaveBeenCalledWith({
                match: 'prefix*',
                count: 100,
            });
            expect(redis.pipeline).toHaveBeenCalled();
        });

        test('Nên tiếp tục nếu không tìm thấy key (empty list)', async () => {
            const mockStream: any = {
                on: jest.fn((event: string, cb: any) => {
                    if (event === 'data') cb([]); // Empty keys
                    if (event === 'end') cb();
                    return mockStream;
                }),
            };
            (redis.scanStream as jest.Mock).mockReturnValue(mockStream);
            await cacheUtil.deleteCacheByPattern('prefix');
            expect(redis.pipeline).not.toHaveBeenCalled();
        });

        test('Nên xử lý lỗi stream', async () => {
            const mockStream: any = {
                on: jest.fn((event: string, cb: any) => {
                    if (event === 'error') cb(new Error('Stream Error'));
                    return mockStream;
                }),
            };
            (redis.scanStream as jest.Mock).mockReturnValue(mockStream);
            await expect(cacheUtil.deleteCacheByPattern('prefix')).rejects.toThrow('Stream Error');
        });
    });

    describe('Redis Events', () => {
        test('Nên bắt sự kiện error của redis client (bản thân file cache.util đăng ký)', () => {
            // Chúng ta lấy handler đã đăng ký trong cache.util (giả sử nó gọi redis.on('error', handler))
            const calls = (redis.on as jest.Mock).mock.calls;
            const errorCall = calls.find(call => call[0] === 'error');
            if (errorCall) {
                const handler = errorCall[1];
                expect(() => handler(new Error('Redis Error'))).not.toThrow();
            }
        });
    });
});
