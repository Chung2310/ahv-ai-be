import express from 'express';
import { IRequest } from '../../common/interfaces/request.interface';
import catchAsync from '../../common/utils/catchAsync';
import * as walletService from './wallet.service';
import config from '../../common/config/config';
import { ApiError } from '../../common/utils/ApiError';

export const getMyWallet = catchAsync(async (req: IRequest, res: express.Response) => {
    if (!req.user) {
        res.status(401).send({ success: false, message: 'Vui lòng xác thực' });
        return;
    }
    let wallet = await walletService.getWalletByUserId(req.user.id);
    if (!wallet) {
        wallet = await walletService.createWallet({ 
            user: req.user.id, 
            balance: config.initialWalletBalance 
        });
    }
    res.send({ success: true, data: wallet });
});

export const updateBalance = catchAsync(async (req: IRequest, res: express.Response) => {
    const amount = Number(req.body.amount);
    const wallet = await walletService.updateBalance(req.params.userId as string, amount);
    res.send({ success: true, data: wallet });
});

export const getWallets = catchAsync(async (req: IRequest, res: express.Response) => {
    const filter: Record<string, unknown> = {};
    if (req.query.user) {
        Object.assign(filter, { user: req.query.user });
    }
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        sortBy: req.query.sortBy as string,
    };
    const result = await walletService.queryWallets(filter, options);
    res.send({ success: true, data: result.items, meta: { totalItems: result.totalItems, totalPages: result.totalPages, currentPage: result.currentPage } });
});

export const getWalletByUserId = catchAsync(async (req: IRequest, res: express.Response) => {
    const wallet = await walletService.getWalletByUserId(req.params.userId as string);
    if (!wallet) {
        throw new ApiError(404, 'Không tìm thấy ví của người dùng này');
    }
    res.send({ success: true, data: wallet });
});
