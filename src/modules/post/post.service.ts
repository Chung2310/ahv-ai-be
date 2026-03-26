import { IPost } from './post.interface';
import Post from './post.model';
import { ApiError } from '../../common/utils/ApiError';

export const createPost = async (postBody: Partial<IPost>): Promise<IPost> => {
    return Post.create(postBody);
};

export const getPosts = async (filter: Record<string, unknown>, options: { limit?: number; page?: number }) => {
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
        Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('categoryId', 'name'),
        Post.countDocuments(filter),
    ]);

    return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
    };
};

export const getPostById = async (id: string): Promise<IPost | null> => {
    return Post.findById(id).populate('categoryId', 'name');
};

export const updatePostById = async (id: string, updateBody: Partial<IPost>): Promise<IPost | null> => {
    const post = await getPostById(id);
    if (!post) return null;
    Object.assign(post, updateBody);
    await post.save();
    return post;
};

export const deletePostById = async (id: string) => {
    const post = await getPostById(id);
    if (!post) throw new ApiError(404, 'Không tìm thấy bài viết');
    await post.deleteOne();
    return post;
};
