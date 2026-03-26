import { Schema, model, Document, Types } from 'mongoose';

export interface IToken extends Document {
    token: string;
    user: Types.ObjectId;
    type: 'refresh' | 'access';
    expires: Date;
    blacklisted: boolean;
}

const tokenSchema = new Schema<IToken>(
    {
        token: { type: String, required: true, index: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['refresh', 'access'], required: true },
        expires: { type: Date, required: true },
        blacklisted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

const Token = model<IToken>('Token', tokenSchema);

export default Token;
