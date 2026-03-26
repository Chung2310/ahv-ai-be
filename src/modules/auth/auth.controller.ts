import { Response } from 'express';
import { IRequest } from '../../common/interfaces/request.interface';
import catchAsync from '../../common/utils/catchAsync';
import * as authService from './auth.service';

export const register = catchAsync(async (req: IRequest, res: Response) => {
    const { user, tokens } = await authService.register(req.body);
    res.cookie('refreshToken', tokens.refresh.token, {
        httpOnly: true,
        expires: tokens.refresh.expires,
    });
    res.status(201).send({ 
        success: true, 
        data: { 
            user, 
            token: tokens.access.token,
            tokens: { access: tokens.access } 
        } 
    });
});

export const login = catchAsync(async (req: IRequest, res: Response) => {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);
    res.cookie('refreshToken', tokens.refresh.token, {
        httpOnly: true,
        expires: tokens.refresh.expires,
    });
    res.send({ 
        success: true, 
        data: { 
            user, 
            token: tokens.access.token,
            tokens: { access: tokens.access } 
        } 
    });
});

export const logout = catchAsync(async (_req: IRequest, res: Response) => {
    res.clearCookie('refreshToken');
    res.status(204).send();
});

export const getMe = catchAsync(async (req: IRequest, res: Response) => {
    res.send({ success: true, data: { user: (req as IRequest).user } });
});

export const refreshToken = catchAsync(async (req: IRequest, res: Response) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const { tokens } = await authService.refreshToken(token);
    res.cookie('refreshToken', tokens.refresh.token, {
        httpOnly: true,
        expires: tokens.refresh.expires,
    });
    res.send({ success: true, data: { tokens: { access: tokens.access } } });
});
