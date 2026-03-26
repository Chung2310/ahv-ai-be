import express from 'express';
import { IRequest } from '../../common/interfaces/request.interface';
import catchAsync from '../../common/utils/catchAsync';
import * as categoryService from './category.service';

export const createCategory = catchAsync(async (req: IRequest, res: express.Response) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).send({ success: true, data: category });
});

export const getCategories = catchAsync(async (req: IRequest, res: express.Response) => {
    const filter: Record<string, unknown> = {}; // Expand filter if needed
    const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
    };
    const result = await categoryService.getCategories(filter, options);
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

export const getCategory = catchAsync(async (req: IRequest, res: express.Response) => {
    const category = await categoryService.getCategoryById(req.params.categoryId as string);
    res.send({ success: true, data: category });
});

export const updateCategory = catchAsync(async (req: IRequest, res: express.Response) => {
    const category = await categoryService.updateCategoryById(req.params.categoryId as string, req.body);
    res.send({ success: true, data: category });
});

export const deleteCategory = catchAsync(async (req: IRequest, res: express.Response) => {
    await categoryService.deleteCategoryById(req.params.categoryId as string);
    res.status(204).send();
});
