import { Document, Types } from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    categoryId: Types.ObjectId | string;
    author: Types.ObjectId | string;
    status: 'draft' | 'published';
}
