import express from 'express';
import { IRequest } from '../../common/interfaces/request.interface';
import catchAsync from '../../common/utils/catchAsync';
import * as ticketService from './ticket.service';
import { TicketStatus } from './ticket.interface';

export const createTicket = catchAsync(async (req: IRequest, res: express.Response) => {
    const ticket = await ticketService.createTicket(req.user!.id, req.body);
    res.status(201).send({ success: true, data: ticket });
});

export const getTickets = catchAsync(async (req: IRequest, res: express.Response) => {
    const filter: Record<string, unknown> = {};
    const isAdmin = ['admin', 'superadmin'].includes(req.user!.role);

    if (!isAdmin) {
        filter.user = req.user!.id;
    } else if (req.query.user) {
        filter.user = req.query.user as string;
    }

    if (req.query.status) {
        filter.status = req.query.status as string;
    }

    const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        sortBy: req.query.sortBy as string,
    };

    const result = await ticketService.queryTickets(filter, options);
    res.send({
        success: true,
        data: result.items,
        meta: {
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
        },
    });
});

export const getTicket = catchAsync(async (req: IRequest, res: express.Response) => {
    const isAdmin = ['admin', 'superadmin'].includes(req.user!.role);
    const ticket = await ticketService.getTicketById(req.params.id as string, req.user!.id, isAdmin);
    res.send({ success: true, data: ticket });
});

export const updateTicketStatus = catchAsync(async (req: IRequest, res: express.Response) => {
    const { status, response } = req.body;
    const ticket = await ticketService.updateTicketStatus(req.params.id as string, status as TicketStatus, response);
    res.send({ success: true, data: ticket });
});

export const deleteTicket = catchAsync(async (req: IRequest, res: express.Response) => {
    await ticketService.deleteTicket(req.params.id as string);
    res.status(204).send();
});
