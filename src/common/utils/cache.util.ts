import redis from '../config/redis';
import logger from './logger';

export const setCache = async (key: string, value: unknown, ttlSeconds = 3600) => {
    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
        logger.error(`Error setting cache for key ${key}:`, error);
    }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
    try {
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch (error) {
        logger.error(`Error getting cache for key ${key}:`, error);
        return null;
    }
};

export const deleteCache = async (key: string) => {
    try {
        await redis.del(key);
    } catch (error) {
        logger.error(`Error deleting cache for key ${key}:`, error);
    }
};

/**
 * Xóa cache theo pattern (ví dụ: categories_list_*)
 * Sử dụng SCAN thay vì KEYS để tránh làm treo Redis trên production
 */
export const deleteCacheByPattern = async (pattern: string) => {
    try {
        const stream = redis.scanStream({
            match: `${pattern}*`,
            count: 100,
        });

        const promises: Promise<unknown>[] = [];

        stream.on('data', (keys: string[]) => {
            if (keys.length) {
                const pipeline = redis.pipeline();
                keys.forEach((key) => {
                    pipeline.del(key);
                });
                promises.push(pipeline.exec());
            }
        });

        return new Promise((resolve, reject) => {
            stream.on('end', () => Promise.all(promises).then(resolve).catch(reject));
            stream.on('error', reject);
        });
    } catch (error) {
        logger.error(`Error deleting cache by pattern ${pattern}:`, error);
    }
};
