import mongoose from 'mongoose';
import { ITaskDoc, ITaskModel } from './task.interface';

const taskSchema = new mongoose.Schema<ITaskDoc, ITaskModel>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        aiModel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AiModel',
            required: true,
            index: true,
        },
        providerJobId: {
            type: String,
            index: true, // index cho webhook lookup
        },
        payload: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'queued', 'processing', 'succeeded', 'failed'],
            default: 'pending',
            index: true,
        },
        result: {
            url: String,
            filename: String,
            meta: mongoose.Schema.Types.Mixed,
        },
        error: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model<ITaskDoc, ITaskModel>('Task', taskSchema);
export default Task;
