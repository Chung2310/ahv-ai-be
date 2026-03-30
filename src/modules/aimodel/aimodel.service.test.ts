import * as aiModelService from './aimodel.service';
import AiModel from './aimodel.model';
import * as cacheUtil from '../../common/utils/cache.util';
import { ApiError } from '../../common/utils/ApiError';

// Mock Mongoose model
jest.mock('./aimodel.model');
// Mock Cache util
jest.mock('../../common/utils/cache.util');

describe('AI Model Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createAiModel', () => {
        test('Nên tạo mô hình AI thành công và dọn dẹp cache', async () => {
            const mockBody = { name: 'Chat GPT-4', provider: 'OpenAI' };
            (AiModel.create as jest.Mock).mockResolvedValue(mockBody);

            const result = await aiModelService.createAiModel(mockBody);

            expect(AiModel.create).toHaveBeenCalledWith(mockBody);
            expect(cacheUtil.deleteCacheByPattern).toHaveBeenCalledWith('aimodels_list');
            expect(result).toEqual(mockBody);
        });
    });

    describe('getAiModels', () => {
        test('Nên trả về dữ liệu từ cache nếu có', async () => {
            const mockCachedData = { items: [], totalItems: 0 };
            (cacheUtil.getCache as jest.Mock).mockResolvedValue(mockCachedData);

            const result = await aiModelService.getAiModels({}, {});

            expect(cacheUtil.getCache).toHaveBeenCalled();
            expect(AiModel.find).not.toHaveBeenCalled();
            expect(result).toEqual(mockCachedData);
        });

        test('Nên lấy từ DB nếu không có cache', async () => {
            (cacheUtil.getCache as jest.Mock).mockResolvedValue(null);
            const mockItems = [{ name: 'GPT-4' }];
            (AiModel.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockItems),
            });
            (AiModel.countDocuments as jest.Mock).mockResolvedValue(1);

            const result = await aiModelService.getAiModels({}, { limit: 10, page: 1 });

            expect(AiModel.find).toHaveBeenCalled();
            expect(cacheUtil.setCache).toHaveBeenCalled();
            expect(result.items).toEqual(mockItems);
        });
    });

    describe('updateAiModelById', () => {
        test('Nên ném lỗi nếu không tìm thấy mô hình', async () => {
            (AiModel.findById as jest.Mock).mockResolvedValue(null);
            await expect(aiModelService.updateAiModelById('507f1f77bcf86cd799439011', {})).rejects.toThrow(ApiError);
        });

        test('Nên cập nhật thành công và xóa cache', async () => {
            const mockModel = { 
                name: 'Cũ', 
                save: jest.fn().mockResolvedValue(true) 
            };
            (AiModel.findById as jest.Mock).mockResolvedValue(mockModel);

            await aiModelService.updateAiModelById('507f1f77bcf86cd799439011', { name: 'Mới' });

            expect(mockModel.name).toBe('Mới');
            expect(mockModel.save).toHaveBeenCalled();
            expect(cacheUtil.deleteCacheByPattern).toHaveBeenCalledWith('aimodels_list');
        });
    });

    describe('deleteAiModelById', () => {
        test('Nên xóa thành công và xóa cache', async () => {
            const mockModel = { 
                deleteOne: jest.fn().mockResolvedValue(true) 
            };
            (AiModel.findById as jest.Mock).mockResolvedValue(mockModel);

            await aiModelService.deleteAiModelById('507f1f77bcf86cd799439011');

            expect(mockModel.deleteOne).toHaveBeenCalled();
            expect(cacheUtil.deleteCacheByPattern).toHaveBeenCalledWith('aimodels_list');
        });

        test('Nên ném lỗi 404 nếu không tìm thấy mô hình để xóa', async () => {
            (AiModel.findById as jest.Mock).mockResolvedValue(null);
            await expect(aiModelService.deleteAiModelById('invalid')).rejects.toThrow('Không tìm thấy mô hình');
        });
    });
});
