import express from 'express';
import { auth } from '../../common/middlewares/auth.middleware';
import { validate } from '../../common/middlewares/validate.middleware';
import * as taskValidation from './task.validation';
import * as taskController from './task.controller';

const router = express.Router();

// Webhook từ AHV API - Endpoint này public
router.post('/webhook/:taskId', taskController.handleWebhook);

// Các endpoint có xác thực
router
    .route('/')
    .post(auth(), validate(taskValidation.createTask), taskController.createTask)
    .get(auth(), validate(taskValidation.getTasks), taskController.getTasks);

router
    .route('/:taskId')
    .get(auth(), validate(taskValidation.getTask), taskController.getTask);

export default router;
