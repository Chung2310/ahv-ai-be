import express from 'express';
import { IRequest } from '../interfaces/request.interface';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { ApiError } from '../utils/ApiError';
import User from '../../modules/user/user.model';
import logger from '../utils/logger';

export const auth = (...requiredRoles: string[]) => async (req: IRequest, res: express.Response, next: express.NextFunction) => {
    try {
        logger.debug(`Incoming Authorization Header: ${req.headers.authorization}`);
        const token = req.headers.authorization?.replace('Bearer ', '');
        logger.debug(`Extracted Token: ${token}`);
        
        if (!token) {
            throw new ApiError(401, 'Vui lòng xác thực');
        }

        const payload = jwt.verify(token, config.jwt.secret) as { sub: string; type: string };
        
        if (payload.type !== 'access') {
            throw new ApiError(401, 'Token không hợp lệ cho yêu cầu này');
        }

        const user = await User.findById(payload.sub);

        if (!user) {
            throw new ApiError(401, 'Người dùng không tồn tại');
        }

        if (requiredRoles.length && !requiredRoles.includes(user.role)) {
            logger.warn(`403 Forbidden: User role '${user.role}' not in required roles [${requiredRoles.join(', ')}]`);
            throw new ApiError(403, 'Không có quyền truy cập');
        }

        req.user = user;
        logger.info(`Authenticated user: ${user.email} (${user.role})`);
        next();
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            return next(err);
        }
        const error = err as Error;
        const message = error.name === 'TokenExpiredError' ? 'Token đã hết hạn' : 'Xác thực thất bại';
        next(new ApiError(401, `${message}: ${error.message}`));
    }
};
