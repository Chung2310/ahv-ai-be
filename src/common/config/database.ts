import mongoose from 'mongoose';
import config from './config';
import logger from './logger';

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        logger.info('MongoDB Connected...');
    } catch (err) {
        logger.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};
