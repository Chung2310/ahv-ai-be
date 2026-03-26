import express from 'express';

const router = express.Router();

/**
 * Route quản lý User (chỉ dành cho Admin/SuperAdmin)
 * Các route xác thực (login, register, getMe...) đã được chuyển sang /auth
 */

import { auth } from '../../common/middlewares/auth.middleware';
import { validate } from '../../common/middlewares/validate.middleware';
import * as userController from './user.controller';
import * as userValidation from './user.validation';

router
    .route('/')
    .get(auth('admin', 'superadmin'), validate(userValidation.getUsers), userController.getUsers);

router
    .route('/:userId')
    .get(auth('admin', 'superadmin'), validate(userValidation.getUser), userController.getUser)
    .patch(auth('superadmin'), validate(userValidation.updateUser), userController.updateUser)
    .delete(auth('superadmin'), validate(userValidation.deleteUser), userController.deleteUser);

export default router;
