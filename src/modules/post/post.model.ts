import { Schema, model } from 'mongoose';
import { IPost } from './post.interface';

const postSchema = new Schema<IPost>(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    },
    {
        timestamps: true,
    },
);

const Post = model<IPost>('Post', postSchema);
export default Post;
