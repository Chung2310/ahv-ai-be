import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/ApiError';

export const validate = (schema: object) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = Joi.object(schema);
    const object = {
        params: req.params,
        query: req.query,
        body: req.body,
    };
    const { value, error } = validSchema.validate(object, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: true,
    });

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return next(new ApiError(400, errorMessage));
    }
    
    if (value.params) Object.assign(req.params, value.params);
    if (value.query) Object.assign(req.query, value.query);
    if (value.body) Object.assign(req.body, value.body);
    return next();
};

export const objectId = (value: string, helpers: Joi.CustomHelpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message({ custom: 'ID không hợp lệ' } as any);
    }
    return value;
};
