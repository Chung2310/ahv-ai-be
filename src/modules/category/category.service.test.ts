import * as categoryService from './category.service';
import Category from './category.model';
import * as cacheUtil from '../../common/utils/cache.util';
import { ApiError } from '../../common/utils/ApiError';

// Mock Mongoose model
jest.mock('./category.model');
// Mock Cache util
jest.mock('../../common/utils/cache.util');

describe('Category Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCategory', () => {
        test('Nên tạo danh mục thành công và xóa cache', async () => {
            const mockBody = { name: 'Công nghệ' };
            (Category.create as jest.Mock).mockResolvedValue(mockBody);

            const result = await categoryService.createCategory(mockBody);

            expect(Category.create).toHaveBeenCalledWith(mockBody);
            expect(cacheUtil.deleteCacheByPattern).toHaveBeenCalledWith('categories_list');
            expect(result).toEqual(mockBody);
        });
    });

    describe('getCategories', () => {
        test('Nên trả về dữ liệu từ cache nếu có', async () => {
            const mockCachedData = { items: [], totalItems: 0 };
            (cacheUtil.getCache as jest.Mock).mockResolvedValue(mockCachedData);

            const result = await categoryService.getCategories({}, {});

            expect(cacheUtil.getCache).toHaveBeenCalled();
            expect(Category.find).not.toHaveBeenCalled();
            expect(result).toEqual(mockCachedData);
        });

        test('Nên lấy từ DB nếu không có cache và sau đó lưu vào cache', async () => {
            (cacheUtil.getCache as jest.Mock).mockResolvedValue(null);
            const mockItems = [{ name: 'Test' }];
            (Category.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockItems),
            });
            (Category.countDocuments as jest.Mock).mockResolvedValue(1);

            const result = await categoryService.getCategories({}, { limit: 10, page: 1 });

            expect(Category.find).toHaveBeenCalled();
            expect(cacheUtil.setCache).toHaveBeenCalled();
            expect(result.items).toEqual(mockItems);
            expect(result.totalItems).toBe(1);
        });
    });

    describe('updateCategoryById', () => {
        test('Nên báo lỗi 404 nếu không tìm thấy danh mục để update', async () => {
            (Category.findById as jest.Mock).mockResolvedValue(null);

            await expect(categoryService.updateCategoryById('507f1f77bcf86cd799439011', {}))
                .rejects.toThrow(new ApiError(404, 'Không tìm thấy danh mục'));
        });

        test('Nên cập nhật thành công và xóa cache', async () => {
            const mockCategory = { 
                name: 'Cũ', 
                save: jest.fn().mockResolvedValue(true) 
            };
            (Category.findById as jest.Mock).mockResolvedValue(mockCategory);

            await categoryService.updateCategoryById('507f1f77bcf86cd799439011', { name: 'Mới' });

            expect(mockCategory.name).toBe('Mới');
            expect(mockCategory.save).toHaveBeenCalled();
            expect(cacheUtil.deleteCacheByPattern).toHaveBeenCalledWith('categories_list');
        });
    });

    describe('deleteCategoryById', () => {
        test('Nên xóa thành công và dọn dẹp cache', async () => {
            const mockCategory = { 
                name: 'Xóa', 
                deleteOne: jest.fn().mockResolvedValue(true) 
            };
            (Category.findById as jest.Mock).mockResolvedValue(mockCategory);

            await categoryService.deleteCategoryById('507f1f77bcf86cd799439011');

            expect(mockCategory.deleteOne).toHaveBeenCalled();
            expect(cacheUtil.deleteCacheByPattern).toHaveBeenCalledWith('categories_list');
        });

        test('Nên báo lỗi 404 nếu không tìm thấy danh mục để xóa', async () => {
            (Category.findById as jest.Mock).mockResolvedValue(null);
            await expect(categoryService.deleteCategoryById('invalid'))
                .rejects.toThrow(new ApiError(404, 'Không tìm thấy danh mục'));
        });
    });
});
