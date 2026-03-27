import { Document, Model, Types } from 'mongoose';

export interface ITask {
    user: Types.ObjectId;
    aiModel: Types.ObjectId;
    providerJobId?: string; // ID trả về từ định dạng AHV Orchestrator (job_id)
    payload: unknown; // Chứa payload đầu vào (prompt, url, v.v)
    status: 'pending' | 'queued' | 'processing' | 'succeeded' | 'failed';
    result?: {
        url?: string;
        filename?: string;
        meta?: Record<string, unknown>;
    };
    error?: string;
    price: string;
}

export interface ITaskDoc extends ITask, Document {}

export type ITaskModel = Model<ITaskDoc>;
