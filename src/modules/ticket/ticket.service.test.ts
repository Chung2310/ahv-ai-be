import * as ticketService from './ticket.service';
import Ticket from './ticket.model';
import { ApiError } from '../../common/utils/ApiError';
import { TicketStatus } from './ticket.interface';

// Mock Mongoose model
jest.mock('./ticket.model');

describe('Ticket Service', () => {
    interface MockTicket {
        status: string;
        response?: string;
        save: jest.Mock;
        deleteOne?: jest.Mock;
    }

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTicket', () => {
        test('Nên tạo ticket thành công', async () => {
            const mockBody = { subject: 'Lỗi nạp tiền', message: 'Tôi không nạp được tiền' };
            (Ticket.create as jest.Mock).mockResolvedValue({ ...mockBody, user: 'user123' });

            const result = await ticketService.createTicket('user123', mockBody as unknown as { subject: string; message: string });

            expect(Ticket.create).toHaveBeenCalled();
            expect(result.user).toBe('user123');
        });
    });

    describe('getTicketById', () => {
        test('Nên tìm thấy ticket nếu user sở hữu hoặc là admin', async () => {
            const mockTicket = { id: '507f1f77bcf86cd799439011', user: '507f1f77bcf86cd799439012' };
            (Ticket.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockTicket),
            });

            const result = await ticketService.getTicketById('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012');
            expect(result).toEqual(mockTicket);
        });

        test('Nên báo lỗi 404 nếu không tìm thấy ticket', async () => {
            (Ticket.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });
            await expect(ticketService.getTicketById('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012')).rejects.toThrow(ApiError);
        });

        test('Nên tìm thấy ticket nếu là admin (không cần userId)', async () => {
            const mockTicket = { id: 't1' };
            (Ticket.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockTicket),
            });
            const result = await ticketService.getTicketById('507f1f77bcf86cd799439011', undefined, true);
            expect(result).toEqual(mockTicket);
        });
    });

    describe('updateTicketStatus', () => {
        test('Nên cập trạng thái ticket và phản hồi thành công', async () => {
            const mockTicket: MockTicket = { 
                status: TicketStatus.PENDING, 
                save: jest.fn().mockResolvedValue(true) 
            };
            (Ticket.findById as jest.Mock).mockResolvedValue(mockTicket);

            await ticketService.updateTicketStatus('507f1f77bcf86cd799439011', TicketStatus.RESOLVED, 'Đã xử lý xong');

            expect(mockTicket.status).toBe(TicketStatus.RESOLVED);
            expect(mockTicket.response).toBe('Đã xử lý xong');
            expect(mockTicket.save).toHaveBeenCalled();
        });

        test('Nên ném lỗi 404 nếu cập nhật ticket không tồn tại', async () => {
            (Ticket.findById as jest.Mock).mockResolvedValue(null);
            await expect(ticketService.updateTicketStatus('507f1f77bcf86cd799439011', TicketStatus.RESOLVED))
                .rejects.toThrow(ApiError);
        });

        test('Nên cập nhật trạng thái thành công mà không có phản hồi', async () => {
            const mockTicket: MockTicket = { status: TicketStatus.PENDING, save: jest.fn().mockResolvedValue(true) };
            (Ticket.findById as jest.Mock).mockResolvedValue(mockTicket);
            await ticketService.updateTicketStatus('id', TicketStatus.PENDING);
            expect(mockTicket.status).toBe(TicketStatus.PENDING);
            expect(mockTicket.response).toBeUndefined();
        });
    });

    describe('deleteTicket', () => {
        test('Nên xóa ticket thành công', async () => {
            const mockTicket = { deleteOne: jest.fn().mockResolvedValue(true) };
            (Ticket.findById as jest.Mock).mockResolvedValue(mockTicket);

            const result = await ticketService.deleteTicket('507f1f77bcf86cd799439011');
            expect(result).toBe(mockTicket);
            expect(mockTicket.deleteOne).toHaveBeenCalled();
        });

        test('Nên ném lỗi 404 nếu xóa ticket không tồn tại', async () => {
            (Ticket.findById as jest.Mock).mockResolvedValue(null);
            await expect(ticketService.deleteTicket('invalid')).rejects.toThrow(ApiError);
        });
    });

    describe('queryTickets', () => {
        test('Nên trả về danh sách ticket phân trang', async () => {
            const mockItems = [{ subject: 'Test' }];
            const mockFind = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockItems)
            };
            (Ticket.find as jest.Mock).mockReturnValue(mockFind);
            (Ticket.countDocuments as jest.Mock).mockResolvedValue(1);

            const result = await ticketService.queryTickets({}, { limit: 10, page: 1 });
            expect(result.items).toEqual(mockItems);
            expect(result.totalItems).toBe(1);
        });
    });
});
