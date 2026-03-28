import express from 'express';
import authRoute from '../../modules/auth/auth.route';
import userRoute from '../../modules/user/user.route';
import categoryRoute from '../../modules/category/category.route';
import postRoute from '../../modules/post/post.route';
import aiModelRoute from '../../modules/aimodel/aimodel.route';
import walletRoute from '../../modules/wallet/wallet.route';
import taskRoute from '../../modules/task/task.route';
import ticketRoute from '../../modules/ticket/ticket.route';
import mongoose from 'mongoose';

const router = express.Router();

const defaultRoutes = [
    { path: '/auths', route: authRoute },
    { path: '/users', route: userRoute },
    { path: '/categories', route: categoryRoute },
    { path: '/posts', route: postRoute },
    { path: '/aimodels', route: aiModelRoute },
    { path: '/wallets', route: walletRoute },
    { path: '/tasks', route: taskRoute },
    { path: '/tickets', route: ticketRoute },
];

router.get('/health', (req: express.Request, res: express.Response) => {
    res.send({
        status: 'UP',
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
        timestamp: new Date().toISOString(),
    });
});

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
