import * as ticketService from './ticket.service';
import Ticket from './ticket.model';
import { ApiError } from '../../common/utils/ApiError';

// Mock Mongoose model
jest.mock('./ticket.model');

describe('Ticket Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTicket', () => {
        test('Nên tạo ticket thành công', async () => {
            const mockBody = { subject: 'Lỗi nạp tiền', message: 'Tôi không nạp được tiền' };
            (Ticket.create as jest.Mock).mockResolvedValue({ ...mockBody, user: 'user123' });

            const result = await ticketService.createTicket('user123', mockBody as any);

            expect(Ticket.create).toHaveBeenCalled();
            expect(result.user).toBe('user123');
        });
    });

    describe('getTicketById', () => {
        test('Nên tìm thấy ticket nếu user sở hữu hoặc là admin', async () => {
            const mockTicket = { id: '507f1f77bcf86cd799439011', user: '507f1f77bcf86cd799439012' };
            (Ticket.findOne as any).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockTicket),
            });

            const result = await ticketService.getTicketById('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012');
            expect(result).toEqual(mockTicket);
        });

        test('Nên báo lỗi 404 nếu không tìm thấy ticket', async () => {
            (Ticket.findOne as any).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });
            await expect(ticketService.getTicketById('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012')).rejects.toThrow(ApiError);
        });
    });

    describe('updateTicketStatus', () => {
        test('Nên cập nhật trạng thái ticket và phản hồi thành công', async () => {
            const mockTicket = { 
                status: 'open', 
                save: jest.fn().mockResolvedValue(true) 
            };
            (Ticket.findById as jest.Mock).mockResolvedValue(mockTicket);

            await ticketService.updateTicketStatus('507f1f77bcf86cd799439011', 'resolved' as any, 'Đã xử lý xong');

            expect(mockTicket.status).toBe('resolved');
            expect((mockTicket as any).response).toBe('Đã xử lý xong');
            expect(mockTicket.save).toHaveBeenCalled();
        });
    });
});
