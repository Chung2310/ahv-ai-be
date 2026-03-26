import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.join(process.cwd(), '.env') });


const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
        PORT: Joi.number().default(3000),
        MONGODB_URI: Joi.string().required().description('Mongo DB url'),
        JWT_SECRET: Joi.string().required().description('JWT secret key'),
        JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
        LINK_COR: Joi.string().default('*').description('CORS allowed origins'),
        ADMIN_EMAIL: Joi.string().required(),
        ADMIN_PASSWORD: Joi.string().required(),

        AHV_AI_API_BASE: Joi.string().default('https://api.ahvchat.com').description('AHV API Base URL'),
        AHV_AI_API_KEY: Joi.string().required().description('API Key for AHV Orchestrator'),
        WEBHOOK_BASE_URL: Joi.string().required().description('Base URL for Webhook callbacks (e.g., https://my-domain.com)'),
        REDIS_HOST: Joi.string().default('localhost').description('Redis host for BullMQ'),
        REDIS_PORT: Joi.number().default(6379).description('Redis port'),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export default {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongoose: {
        url: envVars.MONGODB_URI + (envVars.NODE_ENV === 'test' ? '-test' : ''),
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    },
    cors: {
        origin: envVars.LINK_COR === '*' ? '*' : envVars.LINK_COR.split(',').map((s: string) => s.trim()),
    },
    admin: {
        email: envVars.ADMIN_EMAIL,
        password: envVars.ADMIN_PASSWORD,
    },
    ahvAi: {
        apiBase: envVars.AHV_AI_API_BASE,
        apiKey: envVars.AHV_AI_API_KEY,
        webhookBaseUrl: envVars.WEBHOOK_BASE_URL,
    },
    redis: {
        host: envVars.REDIS_HOST,
        port: envVars.REDIS_PORT,
    },
};
