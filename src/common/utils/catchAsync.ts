import express from 'express';
import { IRequest } from '../interfaces/request.interface';

const catchAsync = (fn: (req: IRequest, res: express.Response, next: express.NextFunction) => unknown) => 
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
        Promise.resolve(fn(req as IRequest, res, next)).catch((err) => next(err));
    };

export default catchAsync;
