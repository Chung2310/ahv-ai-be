import express from 'express';
import { IUser } from '../../modules/user/user.interface';

export interface IRequest extends express.Request {
    user?: IUser;
}
