import express from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { auth } from '../../common/middlewares/auth.middleware';
import * as aiModelValidation from './aimodel.validation';
import * as aiModelController from './aimodel.controller';

const router = express.Router();

router.post('/', auth('admin', 'superadmin'), validate(aiModelValidation.createAiModel), aiModelController.createAiModel);
router.get('/', validate(aiModelValidation.getAiModels), aiModelController.getAiModels);
router.get('/:modelId', validate(aiModelValidation.getAiModel), aiModelController.getAiModel);
router.patch('/:modelId', auth('admin', 'superadmin'), validate(aiModelValidation.updateAiModel), aiModelController.updateAiModel);
router.delete('/:modelId', auth('admin', 'superadmin'), validate(aiModelValidation.deleteAiModel), aiModelController.deleteAiModel);

export default router;
