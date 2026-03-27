import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from './user.interface';

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'superadmin'],
            default: 'user',
            index: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret: Record<string, unknown>) {
                delete ret.password;
                delete ret.__v;
                return ret;
            },
        },
    },
);

userSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
    const user = this as IUser;
    return bcrypt.compare(password, user.password as string);
};

userSchema.pre('save', async function (this: IUser) {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

const User = model<IUser>('User', userSchema);

export default User;
