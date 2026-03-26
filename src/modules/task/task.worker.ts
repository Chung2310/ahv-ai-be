import { Worker } from 'bullmq';
import type { Job } from 'bullmq';
import config from '../../common/config/config';
import logger from '../../common/config/logger';
import Task from './task.model';
import { ITaskJobData } from './task.queue';
import connection from '../../common/config/redis';

export const taskWorker = new Worker(
    'AHV_AI_TaskProcess',
    async (job: Job<ITaskJobData>) => {
        const { taskId, aiModelName, payload } = job.data;
        
        logger.info(`[Worker] Processing Job ${job.id} for Task ${taskId}`);
        
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const webhookUrl = `${config.ahvAi.webhookBaseUrl}/api/v1/tasks/webhook/${task._id.toString()}`;
        const ahvApiUrl = `${config.ahvAi.apiBase}/v1/jobs`;
        
        const apiPayload = {
            task: aiModelName, 
            webhook_url: webhookUrl,
            payload: payload
        };

        try {
            const response = await fetch(ahvApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': config.ahvAi.apiKey
                },
                body: JSON.stringify(apiPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AHV API Error: ${errorText}`);
            }

            const data = await response.json();
            
            task.providerJobId = data.job_id;
            task.status = data.status || 'queued';
            await task.save();
            
            logger.info(`[Worker] Successfully called AHV API for Task ${taskId}, Provider Job ID: ${data.job_id}`);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            task.status = 'failed';
            task.error = errorMessage;
            await task.save();
            logger.error(`[Worker] Failed AHV API Call for Task ${taskId}: ${errorMessage}`);
            throw error; // Để BullMQ xử lý retry (nếu có cấu hình)
        }
    },
    { connection }
);

taskWorker.on('completed', (job) => {
    logger.info(`[Worker] Job ${job.id} has completed!`);
});

taskWorker.on('failed', (job, err) => {
    logger.error(`[Worker] Job ${job?.id} has failed with ${err.message}`);
});
