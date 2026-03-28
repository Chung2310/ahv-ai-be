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
    
    // Cập nhật giá trị sau khi validate (làm sạch các trường dư thừa)
    if (value.params) {
        const params = req.params as Record<string, unknown>;
        Object.keys(params).forEach((key) => delete params[key]);
        Object.assign(req.params, value.params);
    }
    if (value.query) {
        const query = req.query as Record<string, unknown>;
        Object.keys(query).forEach((key) => delete query[key]);
        Object.assign(req.query, value.query);
    }
    if (value.body) {
        const body = req.body as Record<string, unknown>;
        Object.keys(body).forEach((key) => delete body[key]);
        Object.assign(req.body, value.body);
    }
    return next();
};

export const objectId = (value: string, helpers: Joi.CustomHelpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message({ custom: 'ID không hợp lệ' });
    }
    return value;
};
