import IORedis from 'ioredis';
import config from './config';
import logger from './logger';

const redis = new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null,
});

redis.on('connect', () => {
    logger.info('Connected to Redis');
});

redis.on('error', (err) => {
    logger.error('Redis connection error:', err);
});

export default redis;
