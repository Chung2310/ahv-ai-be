import express from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { auth } from '../../common/middlewares/auth.middleware';
import * as walletValidation from './wallet.validation';
import * as walletController from './wallet.controller';

const router = express.Router();

router.get('/', auth('admin', 'superadmin'), validate(walletValidation.getWallets), walletController.getWallets);
router.get('/me', auth(), walletController.getMyWallet);
router.get('/:userId', auth('admin', 'superadmin'), validate(walletValidation.getWalletByUserId), walletController.getWalletByUserId);
router.put('/balance/:userId', auth('superadmin'), validate(walletValidation.updateBalance), walletController.updateBalance);

export default router;
