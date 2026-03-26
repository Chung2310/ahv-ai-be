import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../../common/config/config';
import logger from '../../common/config/logger';

// Kết nối Redis
const connection = new IORedis({
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
    logger.error(`[Redis] Lỗi kết nối: ${err.message}`);
});

connection.on('connect', () => {
    logger.info(`[Redis] Đã kết nối thành công đến ${config.redis.host}:${config.redis.port}`);
});

// Tạo Queue
export const taskQueue = new Queue('AHV_AI_TaskProcess', { connection });

// Interface cho Job Data
export interface ITaskJobData {
    taskId: string;
    aiModelId: string;
    aiModelName: string;
    payload: unknown;
}
