import { ApiError } from '../../common/utils/ApiError';
import AiModel from '../aimodel/aimodel.model';
import Task from './task.model';
import { taskQueue } from './task.queue';
import { ITask } from './task.interface';
import * as walletService from '../wallet/wallet.service';

export const createTask = async (userId: string, aiModelId: string, payload: unknown) => {
    // 1. Kiểm tra AiModel
    const aiModel = await AiModel.findById(aiModelId);
    if (!aiModel) {
        throw new ApiError(404, 'AiModel không tồn tại');
    }
    if (!aiModel.isActive) {
        throw new ApiError(400, 'AiModel hiện đang bị vô hiệu hóa');
    }

    // 2. Chuyển đổi giá và trừ tiền
    const price = Number(aiModel.price || 0);
    // updateBalance sẽ tự động kiểm tra số dư và trừ tiền nguyên tử
    // Nếu thiếu tiền sẽ ném ApiError(400, 'Số dư không đủ')
    await walletService.updateBalance(userId, -price, `Phí thực hiện tác vụ AI: ${aiModel.name}`);

    // 3. Tạo Task khởi tạo trong DB
    const task = await Task.create({
        user: userId,
        aiModel: aiModel._id,
        payload,
        status: 'pending',
        price: price.toString(),
    });

    // 3. Đưa job vào hàng đợi BullMQ
    await taskQueue.add(
        'process_task',
        {
            taskId: task._id.toString(),
            aiModelId: aiModel._id.toString(),
            aiModelName: aiModel.name,
            payload,
        },
        {
            removeOnComplete: true, // Tự động xóa khỏi Redis khi thành công
            removeOnFail: true,     // Tự động xóa khỏi Redis khi thất bại sau lần thử cuối
        }
    );

    return task;
};

export const handleWebhook = async (taskId: string, webhookPayload: { status?: string; result?: unknown; error?: string }) => {
    const task = await Task.findById(taskId);
    if (!task) {
        // Có thể AHV gọi webhook trùng lặp, return 200 để báo nhận rồi nhưng không xử lý (hoặc throw error nếu cần)
        return null;
    }

    if (webhookPayload.status === 'succeeded') {
        task.status = 'succeeded';
        task.result = webhookPayload.result as { url?: string; filename?: string; meta?: Record<string, unknown> };
    } else if (webhookPayload.status === 'failed' || webhookPayload.error) {
        task.status = 'failed';
        task.error = webhookPayload.error || 'Webook reported failure';
    } else {
        // processing...
        task.status = (webhookPayload.status as ITask['status']) || 'processing';
    }

    await task.save();
    return task;
};

export const queryTasks = async (
    filter: Record<string, unknown>,
    options: { page?: number | string; limit?: number | string; sortBy?: string },
) => {
    const page = options.page ? parseInt(options.page.toString(), 10) : 1;
    const limit = options.limit ? parseInt(options.limit.toString(), 10) : 10;
    const skip = (page - 1) * limit;

    const [tasks, totalItems] = await Promise.all([
        Task.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('aiModel', 'name provider')
            .populate('user', 'name email'),
        Task.countDocuments(filter),
    ]);

    return {
        data: tasks,
        meta: {
            totalItems,
            itemCount: tasks.length,
            itemsPerPage: limit,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        },
    };
};

export const getTaskById = async (taskId: string, userId: string) => {
    const task = await Task.findOne({ _id: taskId, user: userId }).populate('aiModel', 'name provider');
    if (!task) {
        throw new ApiError(404, 'Task không tồn tại hoặc không thuộc quyền truy cập');
    }
    return task;
};
