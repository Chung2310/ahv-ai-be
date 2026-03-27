import { IUser } from './user.interface';
import User from './user.model';
import { ApiError } from '../../common/utils/ApiError';

export const createUser = async (userBody: Partial<IUser>): Promise<IUser> => {
    if (userBody.email && await User.findOne({ email: userBody.email })) {
        throw new ApiError(400, 'Email đã tồn tại');
    }
    return User.create(userBody);
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
    return User.findOne({ email });
};

export const getUserById = async (id: string): Promise<IUser | null> => {
    return User.findById(id);
};

export const loginUserWithEmailAndPassword = async (email: string, password: string): Promise<IUser> => {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(401, 'Email hoặc mật khẩu không chính xác');
    }
    return user;
};

export const queryUsers = async (filter: Record<string, unknown>, options: { limit?: number; page?: number; sortBy?: string }) => {
    const { limit = 10, page = 1, sortBy = 'createdAt:desc' } = options;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
        User.find(filter).sort(sortBy).skip(skip).limit(limit),
        User.countDocuments(filter),
    ]);

    return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
    };
};

export const updateUserById = async (userId: string, updateBody: Partial<IUser>) => {
    const user = await getUserById(userId);
    if (!user) throw new ApiError(404, 'Người dùng không tồn tại');
    if (updateBody.email && (await User.findOne({ email: updateBody.email, _id: { $ne: userId } }))) {
        throw new ApiError(400, 'Email đã tồn tại');
    }
    Object.assign(user, updateBody);
    await user.save();
    return user;
};

export const deleteUserById = async (userId: string) => {
    const user = await getUserById(userId);
    if (!user) throw new ApiError(404, 'Người dùng không tồn tại');
    await user.deleteOne();
    return user;
};
