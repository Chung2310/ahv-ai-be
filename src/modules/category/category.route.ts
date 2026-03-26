import express from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { auth } from '../../common/middlewares/auth.middleware';
import * as categoryValidation from './category.validation';
import * as categoryController from './category.controller';

const router = express.Router();

router.post('/', auth('admin', 'superadmin'), validate(categoryValidation.createCategory), categoryController.createCategory);
router.get('/', validate(categoryValidation.getCategories), categoryController.getCategories);
router.get('/:categoryId', validate(categoryValidation.getCategory), categoryController.getCategory);
router.patch('/:categoryId', auth('admin', 'superadmin'), validate(categoryValidation.updateCategory), categoryController.updateCategory);
router.delete('/:categoryId', auth('admin', 'superadmin'), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

export default router;
