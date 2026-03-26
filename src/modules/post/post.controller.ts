import { Response } from 'express';
import { IRequest } from '../../common/interfaces/request.interface';
import catchAsync from '../../common/utils/catchAsync';
import { ApiError } from '../../common/utils/ApiError';
import * as postService from './post.service';

export const createPost = catchAsync(async (req: IRequest, res: Response) => {
    if (!(req as IRequest).user) throw new ApiError(401, 'Vui lòng xác thực');
    const post = await postService.createPost({
        ...req.body,
        author: (req as IRequest).user!.id,
    });
    res.status(201).send({ success: true, data: post });
});
export const getPosts = catchAsync(async (req: IRequest, res: Response) => {
    const filter: Record<string, unknown> = {};
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;
    if (req.query.status) filter.status = req.query.status;
    
    const options = {
        limit: Number(req.query.limit) || 10,
        page: Number(req.query.page) || 1,
    };
    const result = await postService.getPosts(filter, options);
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

export const getPost = catchAsync(async (req: IRequest, res: Response) => {
    const post = await postService.getPostById(req.params.postId as string);
    if (!post) {
        throw new ApiError(404, 'Không tìm thấy bài viết');
    }
    res.send({ success: true, data: post });
});

export const updatePost = catchAsync(async (req: IRequest, res: Response) => {
    const post = await postService.updatePostById(req.params.postId as string, req.body);
    res.send({ success: true, data: post });
});

export const deletePost = catchAsync(async (req: IRequest, res: Response) => {
    await postService.deletePostById(req.params.postId as string);
    res.status(204).send();
});
