import express from 'express';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';

export const errorHandler = (err: Error & { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message;
    if (!(err instanceof ApiError)) {
        statusCode = 500;
        message = 'Lỗi hệ thống';
    }

    res.locals.errorMessage = err.message;

    const response = {
        success: false,
        status: statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    if (process.env.NODE_ENV === 'development') {
        logger.error(err);
    }

    res.status(statusCode).send(response);
};
