import { loginUserWithEmailAndPassword, createUser, getUserById } from '../user/user.service';
import * as tokenService from '../user/token.service';
import { verifyToken } from '../user/token.service';
import { ApiError } from '../../common/utils/ApiError';
import { IUser } from '../user/user.interface';

/**
 * Đăng ký tài khoản mới — trả về user và tokens
 */
export const register = async (body: Partial<IUser>) => {
    const user = await createUser(body);
    const tokens = await tokenService.generateAuthTokens(user);
    return { user, tokens };
};

/**
 * Đăng nhập — trả về user và tokens (refresh token được set cookie ở controller)
 */
export const login = async (email: string, password: string) => {
    const user = await loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    return { user, tokens };
};

/**
 * Làm mới access token từ refresh token (cookie hoặc body)
 */
export const refreshToken = async (token: string | undefined) => {
    if (!token) throw new ApiError(401, 'Refresh token không tồn tại');

    const tokenDoc = await verifyToken(token, 'refresh');
    const user = await getUserById(tokenDoc.user.toString());
    if (!user) throw new ApiError(401, 'Người dùng không tồn tại');

    const tokens = await tokenService.generateAuthTokens(user);
    return { tokens };
};
