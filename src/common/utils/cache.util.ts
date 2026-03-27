import redis from '../config/redis';
import logger from '../config/logger';

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
