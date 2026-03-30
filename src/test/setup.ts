// Thiết lập các biến môi trường dummy để vượt qua validator của config.ts
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/ahv-ai-test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.JWT_SECRET = 'test_secret_key_long_enough_to_pass_validation_12345';
process.env.JWT_ACCESS_EXPIRATION_MINUTES = '30';
process.env.JWT_REFRESH_EXPIRATION_DAYS = '30';
process.env.ADMIN_EMAIL = 'admin@ahv-test.com';
process.env.ADMIN_PASSWORD = 'password123';
process.env.AHV_AI_API_BASE = 'https://api.ahvchat.com';
process.env.AHV_AI_API_KEY = 'test_ahv_api_key';
process.env.WEBHOOK_BASE_URL = 'https://webhook.test.com';
process.env.INITIAL_WALLET_BALANCE = '1000';
process.env.LOG_LEVEL = 'error'; // Giảm nhiễu log khi chạy test

// Mock Redis toàn cục để tránh lỗi kết nối trong các bộ test khác
jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        set: jest.fn().mockResolvedValue('OK'),
        get: jest.fn().mockResolvedValue(null),
        del: jest.fn().mockResolvedValue(1),
        scanStream: jest.fn(),
        pipeline: jest.fn().mockReturnValue({
            del: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([]),
        }),
    }));
});

// Mock BullMQ toàn cục để tránh open handles từ các Worker/Queue ẩn
jest.mock('bullmq', () => {
    return {
        Queue: jest.fn().mockImplementation(() => ({
            add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
            on: jest.fn(),
        })),
        Worker: jest.fn().mockImplementation(() => ({
            on: jest.fn(),
            close: jest.fn().mockResolvedValue(undefined),
        })),
        Scheduler: jest.fn().mockImplementation(() => ({
            close: jest.fn().mockResolvedValue(undefined),
        })),
    };
});
