import Joi from 'joi';
import { objectId } from '../../common/middlewares/validate.middleware';

const password = (value: string, helpers: Joi.CustomHelpers) => {
    if (value.length < 8) {
        return helpers.message({ custom: 'Mật khẩu phải có ít nhất 8 ký tự' });
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        return helpers.message({ custom: 'Mật khẩu phải bao gồm cả chữ và số' });
    }
    return value;
};

export const register = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().custom(password),
        name: Joi.string().required(),
    }),
};

export const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

export const getUsers = {
    query: Joi.object().keys({
        role: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getUser = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId),
    }),
};

export const updateUser = {
    params: Joi.object().keys({
        userId: Joi.string().required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            email: Joi.string().email(),
            name: Joi.string(),
            role: Joi.string().valid('user', 'admin', 'superadmin'),
        })
        .min(1),
};

export const deleteUser = {
    params: Joi.object().keys({
        userId: Joi.string().required().custom(objectId),
    }),
};
