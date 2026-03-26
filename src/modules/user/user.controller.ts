import { Response } from 'express';
import { IRequest } from '../../common/interfaces/request.interface';
import catchAsync from '../../common/utils/catchAsync';
import { ApiError } from '../../common/utils/ApiError';
import * as userService from './user.service';

// Controllers dành cho quản lý user (Admin panel)
// Auth controllers  đã chuyển sang src/modules/auth/auth.controller.ts

export const getUsers = catchAsync(async (req: IRequest, res: Response) => {
    const filter: Record<string, any> = {};
    if (req.query.role) filter.role = req.query.role;
    
    const options = {
        limit: Number(req.query.limit) || 10,
        page: Number(req.query.page) || 1,
        sortBy: (req.query.sortBy as string) || 'createdAt:desc',
    };
    
    const result = await userService.queryUsers(filter, options);
    res.send({ 
        success: true, 
        data: result.items,
        meta: {
            totalItems: result.totalItems,
            itemCount: result.items.length,
            itemsPerPage: options.limit,
            totalPages: result.totalPages,
            currentPage: options.page,
        }
    });
});

export const getUser = catchAsync(async (req: IRequest, res: Response) => {
    const user = await userService.getUserById(req.params.userId as string);
    if (!user) throw new ApiError(404, 'Người dùng không tồn tại');
    res.send({ success: true, data: user });
});

export const updateUser = catchAsync(async (req: IRequest, res: Response) => {
    const user = await userService.updateUserById(req.params.userId as string, req.body);
    res.send({ success: true, data: user });
});

export const deleteUser = catchAsync(async (req: IRequest, res: Response) => {
    await userService.deleteUserById(req.params.userId as string);
    res.status(204).send();
});
