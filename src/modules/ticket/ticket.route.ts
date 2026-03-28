import express from 'express';
import { validate } from '../../common/middlewares/validate.middleware';
import { auth } from '../../common/middlewares/auth.middleware';
import * as ticketValidation from './ticket.validation';
import * as ticketController from './ticket.controller';

const router = express.Router();

router
    .route('/')
    .post(auth('user', 'admin', 'superadmin'), validate(ticketValidation.createTicket), ticketController.createTicket)
    .get(auth(), validate(ticketValidation.getTickets), ticketController.getTickets);

router
    .route('/:id')
    .get(auth(), validate(ticketValidation.getTicket), ticketController.getTicket)
    .delete(auth('admin', 'superadmin'), validate(ticketValidation.deleteTicket), ticketController.deleteTicket);

router.patch(
    '/:id/status',
    auth('admin', 'superadmin'),
    validate(ticketValidation.updateTicketStatus),
    ticketController.updateTicketStatus,
);

export default router;
