import Joi from 'joi';

export const createCategory = {
    body: Joi.object().keys({
        name: Joi.string().required().messages({ 'any.required': 'Tên danh mục là bắt buộc' }),
        description: Joi.string().allow(''),
    }),
};

export const getCategories = {
    query: Joi.object().keys({
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'ID danh mục không hợp lệ' }),
    }),
};

export const updateCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: Joi.object().keys({
        name: Joi.string(),
        description: Joi.string().allow(''),
    }).min(1),
};

export const deleteCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
};
