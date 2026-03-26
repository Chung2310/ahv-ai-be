import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../../common/config/config';
import Token from './token.model';
import { Types } from 'mongoose';
import { IUser } from './user.interface';

const generateToken = (userId: Types.ObjectId | string, expires: moment.Moment, type: string, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

const saveToken = async (token: string, userId: Types.ObjectId | string, expires: moment.Moment, type: 'refresh' | 'access', blacklisted = false) => {
    const tokenDoc = await Token.create({
        token,
        user: userId,
        expires: expires.toDate(),
        type,
        blacklisted,
    });
    return tokenDoc;
};

export const verifyToken = async (token: string, type: 'refresh' | 'access') => {
    const payload = jwt.verify(token, config.jwt.secret) as { sub: string };
    const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
    if (!tokenDoc) {
        throw new Error('Token not found');
    }
    return tokenDoc;
};

export const generateAuthTokens = async (user: IUser) => {
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(user.id, accessTokenExpires, 'access');

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(user.id, refreshTokenExpires, 'refresh');
    await saveToken(refreshToken, user.id, refreshTokenExpires, 'refresh');

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};
