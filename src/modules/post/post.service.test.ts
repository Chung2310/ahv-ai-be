import * as postService from './post.service';
import Post from './post.model';

// Mock Mongoose model
jest.mock('./post.model');

describe('Post Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPost', () => {
        test('Nên tạo bài viết thành công', async () => {
            const mockBody = { title: 'Dịch vụ AI mới', content: 'Nội dung chi tiết' };
            (Post.create as jest.Mock).mockResolvedValue(mockBody);

            const result = await postService.createPost(mockBody);

            expect(Post.create).toHaveBeenCalledWith(mockBody);
            expect(result).toEqual(mockBody);
        });
    });

    describe('getPosts', () => {
        test('Nên lấy danh sách bài viết phân trang thành công', async () => {
            const mockItems = [{ title: 'Bài viết 1' }];
            (Post.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockItems),
            });
            (Post.countDocuments as jest.Mock).mockResolvedValue(1);

            const result = await postService.getPosts({}, { limit: 10, page: 1 });

            expect(Post.find).toHaveBeenCalled();
            expect(result.items).toEqual(mockItems);
            expect(result.totalItems).toBe(1);
        });
    });

    describe('updatePostById', () => {
        test('Nên cập nhật bài viết thành công', async () => {
            const mockPost = { 
                title: 'Cũ', 
                save: jest.fn().mockResolvedValue(true) 
            };
            (Post.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockPost),
            });

            await postService.updatePostById('507f1f77bcf86cd799439011', { title: 'Mới' });

            expect(mockPost.title).toBe('Mới');
            expect(mockPost.save).toHaveBeenCalled();
        });

        test('Nên trả về null nếu không tìm thấy bài viết để cập nhật', async () => {
            (Post.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });
            const result = await postService.updatePostById('invalid', {});
            expect(result).toBeNull();
        });
    });

    describe('deletePostById', () => {
        test('Nên xóa bài viết thành công', async () => {
            const mockPost = { 
                deleteOne: jest.fn().mockResolvedValue(true) 
            };
            (Post.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockPost),
            });

            await postService.deletePostById('507f1f77bcf86cd799439011');

            expect(mockPost.deleteOne).toHaveBeenCalled();
        });

        test('Nên báo lỗi 404 nếu không tìm thấy bài viết để xóa', async () => {
            (Post.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });
            await expect(postService.deletePostById('invalid')).rejects.toThrow('Không tìm thấy bài viết');
        });
    });
});
