import { Schema, model } from 'mongoose';
import { ITicket, TicketPriority, TicketStatus } from './ticket.interface';

const ticketSchema = new Schema<ITicket>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        category: { type: String, required: true, trim: true, index: true },
        subject: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: Object.values(TicketStatus),
            default: TicketStatus.PENDING,
            index: true,
        },
        priority: {
            type: String,
            enum: Object.values(TicketPriority),
            default: TicketPriority.MEDIUM,
            index: true,
        },
        response: { type: String, trim: true },
    },
    {
        timestamps: true,
    },
);

const Ticket = model<ITicket>('Ticket', ticketSchema);
export default Ticket;
