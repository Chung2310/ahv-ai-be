import Joi from 'joi';

const objectId = Joi.string().custom((value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message({ custom: '"{{#label}}" must be a valid mongo id' });
    }
    return value;
});

export const createTask = {
    body: Joi.object().keys({
        aiModelId: objectId.required(),
        payload: Joi.object().required().description('Payload tương ứng với model (prompt, urls, etc.)'),
    }),
};

export const getTasks = {
    query: Joi.object().keys({
        aiModel: objectId,
        status: Joi.string().valid('pending', 'queued', 'processing', 'succeeded', 'failed'),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getTask = {
    params: Joi.object().keys({
        taskId: objectId.required(),
    }),
};
