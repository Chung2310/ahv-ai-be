import express from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { auth } from '../../common/middlewares/auth.middleware';
import * as authValidation from './auth.validation';
import * as authController from './auth.controller';

const router = express.Router();

/**
 * POST /api/v1/auth/register   - Đăng ký tài khoản mới
 * POST /api/v1/auth/login      - Đăng nhập
 * POST /api/v1/auth/logout     - Đăng xuất
 * GET  /api/v1/auth/me         - Lấy thông tin tài khoản hiện tại
 * POST /api/v1/auth/refresh    - Làm mới access token bằng refresh token
 */
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth(), authController.getMe);
router.post('/refresh', validate(authValidation.refreshToken), authController.refreshToken);

export default router;
