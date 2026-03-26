import Joi from 'joi';

const objectId = (value: string, helpers: Joi.CustomHelpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message({ custom: 'ID không hợp lệ' });
    }
    return value;
};

export const createPost = {
    body: Joi.object().keys({
        title: Joi.string().required().messages({ 'any.required': 'Tiêu đề là bắt buộc' }),
        content: Joi.string().required().messages({ 'any.required': 'Nội dung là bắt buộc' }),
        categoryId: Joi.string().required().custom(objectId).messages({ 'any.required': 'Danh mục là bắt buộc' }),
        status: Joi.string().valid('draft', 'published'),
    }),
};

export const getPosts = {
    query: Joi.object().keys({
        categoryId: Joi.string().custom(objectId),
        status: Joi.string().valid('draft', 'published'),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getPost = {
    params: Joi.object().keys({
        postId: Joi.string().required().custom(objectId),
    }),
};

export const updatePost = {
    params: Joi.object().keys({
        postId: Joi.string().required().custom(objectId),
    }),
    body: Joi.object().keys({
        title: Joi.string(),
        content: Joi.string(),
        categoryId: Joi.string().custom(objectId),
        status: Joi.string().valid('draft', 'published'),
    }).min(1),
};

export const deletePost = {
    params: Joi.object().keys({
        postId: Joi.string().required().custom(objectId),
    }),
};
