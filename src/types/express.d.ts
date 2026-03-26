import { IUser } from '../modules/user/user.interface';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

declare module 'express' {
    interface Request {
        user?: IUser;
    }
}
