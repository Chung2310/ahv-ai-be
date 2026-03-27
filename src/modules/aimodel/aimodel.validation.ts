import Joi from 'joi';

export const createAiModel = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        provider: Joi.string().required(),
        description: Joi.string(),
        isActive: Joi.boolean(),
        price: Joi.string(),
        payload: Joi.string(),
        image: Joi.string(),
    }),
};

export const getAiModels = {
    query: Joi.object().keys({
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getAiModel = {
    params: Joi.object().keys({
        modelId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
};

export const updateAiModel = {
    params: Joi.object().keys({
        modelId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: Joi.object().keys({
        name: Joi.string(),
        provider: Joi.string(),
        description: Joi.string(),
        isActive: Joi.boolean(),
        price: Joi.string(),
        payload: Joi.string(),
        image: Joi.string(),
    }).min(1),
};

export const deleteAiModel = {
    params: Joi.object().keys({
        modelId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
};
