import app from './app';
import config from './common/config/config';
import { connectDB } from './common/config/database';
import { seedAdmin } from './common/config/seedAdmin';
import logger from './common/utils/logger';

// Bật các background worker
import './modules/task/task.worker';

import { Server } from 'http';

let server: Server;

connectDB().then(async () => {
    await seedAdmin();
    server = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
    });
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: unknown) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
