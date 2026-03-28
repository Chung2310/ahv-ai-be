import Joi from 'joi';

export const updateBalance = {
    params: Joi.object().keys({
        userId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: Joi.object().keys({
        amount: Joi.number().required(),
    }),
};

export const getWallets = {
    query: Joi.object().keys({
        user: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getWalletByUserId = {
    params: Joi.object().keys({
        userId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
};
