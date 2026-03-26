import winston from 'winston';

const isDev = process.env.NODE_ENV === 'development';

const transports: winston.transport[] = [new winston.transports.Console()];

// Chỉ ghi file log khi chạy ở development (không ghi trong Docker/production)
if (isDev) {
    transports.push(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
    transports.push(new winston.transports.File({ filename: 'logs/combined.log' }));
}

const logger = winston.createLogger({
    level: isDev ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        isDev ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`),
    ),
    transports,
});

export default logger;
