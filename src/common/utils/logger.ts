import winston from 'winston';

const isDev = process.env.NODE_ENV === 'development';

const transports: winston.transport[] = [new winston.transports.Console()];

// Chỉ ghi file log khi chạy ở development (không ghi trong Docker/production)
if (isDev) {
    transports.push(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
    transports.push(new winston.transports.File({ filename: 'logs/combined.log' }));
}

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Tự động bắt stack trace của Error object
    isDev ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(), // Cho phép log objects theo dạng %o hoặc truyền đối tượng kèm theo
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let logMessage = `${timestamp} [${level}]: ${message}`;
        
        // Thêm stack trace nếu có (đối với lỗi)
        if (stack) {
            logMessage += `\n${stack}`;
        }
        
        // Hiện metadata nếu không phải stack trace và có dữ liệu
        if (Object.keys(meta).length > 0) {
            const metaStr = JSON.stringify(meta, null, isDev ? 2 : 0);
            if (metaStr !== '{}') {
                logMessage += `\nMetadata: ${metaStr}`;
            }
        }
        
        return logMessage;
    }),
);

const logger = winston.createLogger({
    level: isDev ? 'debug' : 'info',
    format,
    transports,
});

export default logger;
