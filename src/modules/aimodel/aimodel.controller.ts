import { Response } from 'express';
import { IRequest } from '../../common/interfaces/request.interface';
import catchAsync from '../../common/utils/catchAsync';
import * as aiModelService from './aimodel.service';

export const createAiModel = catchAsync(async (req: IRequest, res: Response) => {
    const model = await aiModelService.createAiModel(req.body);
    res.status(201).send({ success: true, data: model });
});

export const getAiModels = catchAsync(async (req: IRequest, res: Response) => {
    const filter: Record<string, unknown> = {};
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
    };
    const result = await aiModelService.getAiModels(filter, options);
    res.send({
        success: true,
        data: result.items,
        meta: {
            totalItems: result.totalItems,
            itemCount: result.items.length,
            itemsPerPage: options.limit,
            totalPages: result.totalPages,
            currentPage: options.page,
        },
    });
});

export const getAiModel = catchAsync(async (req: IRequest, res: Response) => {
    const model = await aiModelService.getAiModelById(req.params.modelId as string);
    res.send({ success: true, data: model });
});

export const updateAiModel = catchAsync(async (req: IRequest, res: Response) => {
    const model = await aiModelService.updateAiModelById(req.params.modelId as string, req.body);
    res.send({ success: true, data: model });
});

export const deleteAiModel = catchAsync(async (req: IRequest, res: Response) => {
    await aiModelService.deleteAiModelById(req.params.modelId as string);
    res.status(204).send();
});
