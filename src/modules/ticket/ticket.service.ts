import Ticket from './ticket.model';
import { ITicket, TicketStatus } from './ticket.interface';
import { ApiError } from '../../common/utils/ApiError';
import { Types } from 'mongoose';

export const createTicket = async (userId: string, body: Partial<ITicket>) => {
    return Ticket.create({
        ...body,
        user: userId,
    });
};

export const queryTickets = async (
    filter: Record<string, unknown>,
    options: { limit?: number; page?: number; sortBy?: string },
) => {
    const { limit = 10, page = 1, sortBy = 'createdAt:desc' } = options;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
        Ticket.find(filter).sort(sortBy).skip(skip).limit(limit).populate('user', 'name email'),
        Ticket.countDocuments(filter),
    ]);

    return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
    };
};

export const getTicketById = async (id: string, userId?: string, isAdmin = false) => {
    const filter: Record<string, unknown> = { _id: new Types.ObjectId(id) };
    if (!isAdmin && userId) {
        filter.user = userId;
    }

    const ticket = await Ticket.findOne(filter).populate('user', 'name email');
    if (!ticket) {
        throw new ApiError(404, 'Không tìm thấy yêu cầu hỗ trợ');
    }
    return ticket;
};

export const updateTicketStatus = async (id: string, status: TicketStatus, response?: string) => {
    const ticket = await Ticket.findById(id);
    if (!ticket) {
        throw new ApiError(404, 'Không tìm thấy yêu cầu hỗ trợ');
    }

    ticket.status = status;
    if (response) {
        ticket.response = response;
    }

    await ticket.save();
    return ticket;
};

export const deleteTicket = async (id: string) => {
    const ticket = await Ticket.findById(id);
    if (!ticket) {
        throw new ApiError(404, 'Không tìm thấy yêu cầu hỗ trợ');
    }
    await ticket.deleteOne();
    return ticket;
};
