import { Document, Types } from 'mongoose';

export enum TicketStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export interface ITicket extends Document {
    user: Types.ObjectId | string;
    category: string;
    subject: string;
    message: string;
    status: TicketStatus;
    priority: TicketPriority;
    response?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
