import { Schema, model } from 'mongoose';
import { ICategory } from './category.interface';

const categorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, trim: true, index: true },
        description: { type: String, trim: true },
    },
    {
        timestamps: true,
    },
);

const Category = model<ICategory>('Category', categorySchema);
export default Category;
