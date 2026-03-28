import axios from 'axios';
import ENVIRONMENT from '../../common/constants/environment.constant';
import logger from '../../common/utils/logger';

const ahvClient = axios.create({
    baseURL: ENVIRONMENT.AHV_API_URL,
    timeout: Number(ENVIRONMENT.TIME_OUT),
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENVIRONMENT.X_API_KEY,
    },
});

class AhvService {
    async createTask(payload: Record<string, unknown>) {
        try {
            const result = await ahvClient.post('/v1/jobs', payload);
            logger.info(`AHV Task created`, { payload });
            return result.data;
        } catch (error) {
            logger.error(`Failed to create AHV Task for: ${(error as Error).message}`, {
                error,
            });
            throw error;
        }
    }

    async getTask(job_id: string) {
        try {
            const result = await ahvClient.get('/v1/jobs/' + job_id);
            return result.data;
        } catch (error) {
            logger.error(`Failed to get AHV Task for : ${(error as Error).message}`, {
                error,
            });
            throw error;
        }
    }
}

export default new AhvService();
