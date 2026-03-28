import express from 'express';
import { IRequest } from '../../common/interfaces/request.interface';
import catchAsync from '../../common/utils/catchAsync';
import { ApiError } from '../../common/utils/ApiError';
import * as taskService from './task.service';

export const createTask = catchAsync(async (req: IRequest, res: express.Response) => {
    if (!(req as IRequest).user) throw new ApiError(401, 'Vui lòng xác thực');
    const { aiModelId, payload } = req.body;
    const task = await taskService.createTask((req as IRequest).user!.id, aiModelId, payload);
    res.status(201).send({ success: true, data: task });
});

export const getTasks = catchAsync(async (req: IRequest, res: express.Response) => {
    if (!req.user) throw new ApiError(401, 'Vui lòng xác thực');

    const { page, limit, sortBy, ...filter } = req.query;

    // Phân quyền: Nếu không phải Admin/SuperAdmin thì chỉ được xem Task của mình
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const finalFilter: Record<string, unknown> = { ...filter };
    if (!isAdmin) {
        finalFilter.user = req.user.id;
    }

    const result = await taskService.queryTasks(finalFilter, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string,
    });

    res.send({
        success: true,
        ...result,
    });
});

export const getTask = catchAsync(async (req: IRequest, res: express.Response) => {
    if (!(req as IRequest).user) throw new ApiError(401, 'Vui lòng xác thực');
    const task = await taskService.getTaskById(req.params.taskId as string, (req as IRequest).user!.id);
    res.send({ success: true, data: task });
});

export const handleWebhook = catchAsync(async (req: IRequest, res: express.Response) => {
    const taskId = req.params.taskId as string;
    const webhookPayload = req.body;
    
    // AHV Orchestrator gửi webhook
    await taskService.handleWebhook(taskId, webhookPayload);
    
    // Luôn trả về 200 OK để AHV Orchestrator biết đã nhận được, không gửi lại nữa
    res.status(200).send({ received: true });
});
