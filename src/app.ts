import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './common/config/config';
import { errorHandler } from './common/middlewares/error.middleware';
import routesV1 from './routes/v1';
import { ApiError } from './common/utils/ApiError';
import logger from './common/utils/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();

if (config.env !== 'test') {
    // Luồng stream để Morgan đẩy log vào Winston thay vì stdout/stderr trực tiếp
    const morganStream = {
        write: (message: string) => logger.info(message.trim()),
    };

    // Định dạng HTTP log: [METHOD] URL STATUS - RESPONSE_TIME ms
    const morganFormat = '[:method] :url :status :res[content-length] - :response-time ms';

    app.use(morgan(morganFormat, { stream: morganStream }));
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json({ limit: config.payloadLimit }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: config.payloadLimit, extended: true }));

// parse cookies
app.use(cookieParser());

// gzip compression
app.use(compression());

// enable cors
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
}));

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AI CMS API Documentation',
            version: '1.0.0',
            description: 'API for AI CMS with User, Post, Category, Wallet, and AI Model management',
        },
        servers: [{ url: `http://localhost:${config.port}/api/v1` }],
    },
    apis: ['./src/modules/**/*.swagger.ts'],
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// v1 api routes
app.use('/api/v1', routesV1);

// send back a 404 error for any unknown api request
app.use((_req: express.Request, _res: express.Response, _next: express.NextFunction) => {
    _next(new ApiError(404, 'Không tìm thấy trang yêu cầu'));
});

// handle error
app.use(errorHandler);

export default app;
