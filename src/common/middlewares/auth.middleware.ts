import express from 'express';
import { IRequest } from '../interfaces/request.interface';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { ApiError } from '../utils/ApiError';
import User from '../../modules/user/user.model';
import logger from '../utils/logger';
import { getPermissionsByRoleNames, getApisByPermissions, checkPermissionsPath } from '../utils/permission.util';

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

        // --- RBAC Động ---
        const permissions = getPermissionsByRoleNames(user.role);
        const allowedApis = getApisByPermissions(permissions);
        
        // Kiểm tra quyền đối với đường dẫn (URL) và phương thức (method) hiện tại
        const isAllowed = checkPermissionsPath(allowedApis, req.originalUrl, req.method);
        
        if (!isAllowed) {
            logger.warn(`403 Forbidden: User ${user.email} (${user.role}) is NOT allowed to access ${req.method} ${req.originalUrl}`);
            throw new ApiError(403, 'Bạn không có quyền thực hiện hành động này');
        }

        req.user = user;
        logger.info(`Authenticated and Authorized user: ${user.email} (${user.role}) for ${req.method} ${req.originalUrl}`);
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
