import { Queue } from 'bullmq';
import connection from '../../common/config/redis';

// Interface cho Job Data
export interface ITaskJobData {
    taskId: string;
    aiModelId: string;
    aiModelName: string;
    payload: unknown;
}

// Tạo Queue sử dụng kết nối Redis dùng chung
export const taskQueue = new Queue('AHV_AI_TaskProcess', { connection });
