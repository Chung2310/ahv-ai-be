import { Schema, model } from 'mongoose';
import { IAiModel } from './aimodel.interface';

const aiModelSchema = new Schema<IAiModel>(
    {
        name: { type: String, required: true, trim: true, index: true },
        provider: { type: String, required: true, trim: true, index: true },
        description: { type: String, trim: true },
        isActive: { type: Boolean, default: true, index: true },
        price: { type: String, default: '0' },
        payload: { type: Schema.Types.Mixed },
        image: { type: String, trim: true },
    },
    {
        timestamps: true,
    },
);

const AiModel = model<IAiModel>('AiModel', aiModelSchema);
export default AiModel;
