import { Worker } from 'bullmq';
import type { Job } from 'bullmq';
import config from '../../common/config/config';
import logger from '../../common/utils/logger';
import Task from './task.model';
import { ITaskJobData } from './task.queue';
import connection from '../../common/config/redis';
import ahvService from './ahv.service';
import { sleep } from '../../common/utils/sleep.util';

export const processTaskJob = async (job: Job<ITaskJobData>) => {
        const { taskId, payload } = job.data;
        
        logger.info(`[Worker] Processing Job ${job.id} for Task ${taskId}`);
        
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const baseUrl = config.ahvAi.webhookBaseUrl;
        const webhookUrl = `${baseUrl}/api/v1/tasks/webhook/${task._id.toString()}`;
        
        // Khởi tạo payload API
        const apiPayload: Record<string, unknown> = {
            ...(payload as Record<string, unknown>),
        };

        // Chỉ gắn webhook_url nếu domain đã được cấu hình thật
        if (baseUrl && !baseUrl.includes('your-domain.com')) {
            apiPayload.webhook_url = webhookUrl;
            logger.info(`[Worker] Webhook enabled: ${webhookUrl}`);
        } else {
            logger.warn(`[Worker] Webhook skipped (invalid base URL: ${baseUrl})`);
        }

        try {
            // 1. Gửi yêu cầu tạo job
            logger.info('[Worker] Sending API Payload:', apiPayload);
            const createData = await ahvService.createTask(apiPayload);
            const providerJobId = createData.job_id;
            
            task.providerJobId = providerJobId;
            task.status = createData.status || 'queued';
            await task.save();
            
            logger.info(`[Worker] Created AHV Job ${providerJobId}. Starting polling...`);

            // 2. Vòng lặp Polling trạng thái (3 giây/lần, tối đa 100 lần ~ 5 phút)
            let attempts = 0;
            const maxAttempts = 100;
            let isDone = false;

            while (attempts < maxAttempts && !isDone) {
                await sleep(3000);
                attempts++;

                try {
                    const pollData = await ahvService.getTask(providerJobId);
                    const jobInfo = pollData.job;

                    if (!jobInfo) {
                        logger.warn(`[Worker] No job info found for ${providerJobId} (Attempt ${attempts})`);
                        continue;
                    }

                    const currentStatus = jobInfo.status;
                    logger.debug(`[Worker] Job ${providerJobId} status: ${currentStatus} (Attempt ${attempts})`);

                    if (currentStatus === 'succeeded') {
                        task.status = 'succeeded';
                        task.result = jobInfo.result;
                        await task.save();
                        isDone = true;
                        logger.info(`[Worker] Task ${taskId} succeeded!`);
                    } else if (currentStatus === 'failed') {
                        task.status = 'failed';
                        task.error = jobInfo.error || 'AHV API reported failure';
                        await task.save();
                        isDone = true;
                        logger.error(`[Worker] Task ${taskId} failed: ${task.error}`);
                    } else {
                        // Cập nhật trạng thái trung gian nếu có thay đổi
                        if (task.status !== currentStatus) {
                            task.status = currentStatus;
                            await task.save();
                        }
                    }
                } catch (pollError) {
                    logger.warn(`[Worker] Polling error for task ${taskId}: ${(pollError as Error).message}`);
                }
            }

            if (!isDone) {
                throw new Error('Polling timeout: Task took too long to complete');
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            task.status = 'failed';
            task.error = errorMessage;
            await task.save();
            logger.error(`[Worker] Critical failure for Task ${taskId}: ${errorMessage}`);
            throw error;
        }
};

export const taskWorker = new Worker(
    'AHV_AI_TaskProcess',
    processTaskJob,
    { connection }
);

taskWorker.on('completed', (job) => {
    logger.info(`[Worker] Job ${job.id} has completed loop!`);
});

taskWorker.on('failed', (job, err) => {
    logger.error(`[Worker] Job ${job?.id} has failed with error: ${err.message}`);
});
