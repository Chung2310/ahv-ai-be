import express from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { auth } from '../../common/middlewares/auth.middleware';
import * as postValidation from './post.validation';
import * as postController from './post.controller';

const router = express.Router();

router.post('/', auth(), validate(postValidation.createPost), postController.createPost);
router.get('/', validate(postValidation.getPosts), postController.getPosts);
router.get('/:postId', validate(postValidation.getPost), postController.getPost);
router.patch('/:postId', auth(), validate(postValidation.updatePost), postController.updatePost);
router.delete('/:postId', auth('admin', 'superadmin'), validate(postValidation.deletePost), postController.deletePost);

export default router;
