import { ICategory } from './category.interface';
import Category from './category.model';
import { ApiError } from '../../common/utils/ApiError';
import * as cacheUtil from '../../common/utils/cache.util';

export const createCategory = async (body: Partial<ICategory>): Promise<ICategory> => {
    const category = await Category.create(body);
    await cacheUtil.deleteCache('categories_list');
    return category;
};

export const getCategories = async (filter: Record<string, unknown>, options: { limit?: number; page?: number; sortBy?: string }) => {
    const { limit = 10, page = 1, sortBy = 'createdAt:desc' } = options;
    const skip = (page - 1) * limit;

    // Cache key dựa trên filter và options (đơn giản hóa bằng stringify)
    const cacheKey = `categories_list_${JSON.stringify(filter)}_${limit}_${page}_${sortBy}`;
    const cachedData = await cacheUtil.getCache<any>(cacheKey);
    if (cachedData) return cachedData;

    const [items, totalItems] = await Promise.all([
        Category.find(filter).sort(sortBy).skip(skip).limit(limit),
        Category.countDocuments(filter),
    ]);

    const result = {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
    };

    await cacheUtil.setCache(cacheKey, result, 300); // Cache trong 5 phút
    return result;
};

export const getCategoryById = async (id: string) => {
    return Category.findById(id);
};

export const updateCategoryById = async (id: string, updateBody: Partial<ICategory>) => {
    const category = await getCategoryById(id);
    if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
    Object.assign(category, updateBody);
    await category.save();
    await cacheUtil.deleteCache('categories_list');
    return category;
};

export const deleteCategoryById = async (id: string) => {
    const category = await getCategoryById(id);
    if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
    await category.deleteOne();
    await cacheUtil.deleteCache('categories_list');
    return category;
};
