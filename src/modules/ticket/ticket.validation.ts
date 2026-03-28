import Joi from 'joi';
import { TicketPriority, TicketStatus } from './ticket.interface';

export const createTicket = {
    body: Joi.object().keys({
        category: Joi.string().required(),
        subject: Joi.string().required().max(100),
        message: Joi.string().required().max(1000),
        priority: Joi.string().valid(...Object.values(TicketPriority)),
    }),
};

export const getTickets = {
    query: Joi.object().keys({
        user: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
        status: Joi.string().valid(...Object.values(TicketStatus)),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export const getTicket = {
    params: Joi.object().keys({
        id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
};

export const updateTicketStatus = {
    params: Joi.object().keys({
        id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: Joi.object().keys({
        status: Joi.string()
            .required()
            .valid(...Object.values(TicketStatus)),
        response: Joi.string().max(1000),
    }),
};

export const deleteTicket = {
    params: Joi.object().keys({
        id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),
};
