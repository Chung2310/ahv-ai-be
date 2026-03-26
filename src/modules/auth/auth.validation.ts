import Joi from 'joi';

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
        name: Joi.string().required().messages({ 'any.required': 'Tên là bắt buộc' }),
        email: Joi.string().required().email().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email là bắt buộc',
        }),
        password: Joi.string().required().custom(password),
    }),
};

export const login = {
    body: Joi.object().keys({
        email: Joi.string().required().email().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email là bắt buộc',
        }),
        password: Joi.string().required().messages({ 'any.required': 'Mật khẩu là bắt buộc' }),
    }),
};

export const refreshToken = {
    body: Joi.object().keys({
        refreshToken: Joi.string(),
    }),
};
