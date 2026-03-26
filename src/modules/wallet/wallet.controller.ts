import express from 'express';
import { IRequest } from '../../common/interfaces/request.interface';
import catchAsync from '../../common/utils/catchAsync';
import * as walletService from './wallet.service';

export const getMyWallet = catchAsync(async (req: IRequest, res: express.Response) => {
    if (!req.user) {
        res.status(401).send({ success: false, message: 'Vui lòng xác thực' });
        return;
    }
    let wallet = await walletService.getWalletByUserId(req.user.id);
    if (!wallet) {
        wallet = await walletService.createWallet({ user: req.user.id });
    }
    res.send({ success: true, data: wallet });
});

export const updateBalance = catchAsync(async (req: IRequest, res: express.Response) => {
    const amount = Number(req.body.amount);
    const wallet = await walletService.updateBalance(req.params.userId as string, amount);
    res.send({ success: true, data: wallet });
});
