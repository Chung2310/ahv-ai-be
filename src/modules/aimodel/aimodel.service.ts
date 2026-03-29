import { IAiModel } from './aimodel.interface';
import AiModel from './aimodel.model';
import { ApiError } from '../../common/utils/ApiError';
import * as cacheUtil from '../../common/utils/cache.util';
import { IPaginatedResult } from '../../common/interfaces/pagination.interface';

export const createAiModel = async (body: Partial<IAiModel>): Promise<IAiModel> => {
    const aiModel = await AiModel.create(body);
    await cacheUtil.deleteCacheByPattern('aimodels_list');
    return aiModel;
};

export const getAiModels = async (
    filter: Record<string, unknown>,
    options: { limit?: number; page?: number; sortBy?: string },
): Promise<IPaginatedResult<IAiModel>> => {
    const { limit = 10, page = 1, sortBy = 'createdAt:desc' } = options;
    const skip = (page - 1) * limit;

    const cacheKey = `aimodels_list_${JSON.stringify(filter)}_${limit}_${page}_${sortBy}`;
    const cachedData = await cacheUtil.getCache<IPaginatedResult<IAiModel>>(cacheKey);
    if (cachedData) return cachedData;

    const [items, totalItems] = await Promise.all([
        AiModel.find(filter).sort(sortBy).skip(skip).limit(limit),
        AiModel.countDocuments(filter),
    ]);

    const result = {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
    };

    await cacheUtil.setCache(cacheKey, result, 300);
    return result;
};

export const getAiModelById = async (id: string) => {
    return AiModel.findById(id);
};

export const updateAiModelById = async (id: string, updateBody: Partial<IAiModel>) => {
    const model = await getAiModelById(id);
    if (!model) throw new ApiError(404, 'Không tìm thấy mô hình');
    Object.assign(model, updateBody);
    await model.save();
    await cacheUtil.deleteCacheByPattern('aimodels_list');
    return model;
};

export const deleteAiModelById = async (id: string) => {
    const model = await getAiModelById(id);
    if (!model) throw new ApiError(404, 'Không tìm thấy mô hình');
    await model.deleteOne();
    await cacheUtil.deleteCacheByPattern('aimodels_list');
    return model;
};
