import Joi from 'joi';

export const updateBalance = {
    params: Joi.object().keys({
        userId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: Joi.object().keys({
        amount: Joi.number().required(),
    }),
};
