import express from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { auth } from '../../common/middlewares/auth.middleware';
import * as walletValidation from './wallet.validation';
import * as walletController from './wallet.controller';

const router = express.Router();

router.get('/me', auth(), walletController.getMyWallet);
router.patch('/balance/:userId', auth('superadmin'), validate(walletValidation.updateBalance), walletController.updateBalance);

export default router;
