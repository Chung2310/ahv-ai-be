/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Quản lý các task xử lý AI (Orchestrator generation)
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Tạo một task mới (ví dụ swap face, upscale, gen image tùy thuộc vào model)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aiModelId
 *               - payload
 *             properties:
 *               aiModelId:
 *                 type: string
 *                 description: ID của AiModel
 *               payload:
 *                 type: object
 *                 description: Các thông số tương ứng với model được cấu hình tại AHV
 *     responses:
 *       201:
 *         description: Đã tạo task và báo cho AHV xử lý
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation lỗi / Model bị khóa
 *       401:
 *         description: Chưa xác thực
 *       404:
 *         description: Model không tồn tại
 *       500:
 *         description: Lỗi từ phía server AHV
 *
 *   get:
 *     summary: Lấy danh sách tasks của user đang đăng nhập
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: aiModel
 *         schema:
 *           type: string
 *         description: Filter theo ID của AiModel
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, queued, processing, succeeded, failed]
 *         description: Filter theo trạng thái
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: OK
 *
 * /tasks/{id}:
 *   get:
 *     summary: Xem chi tiết trạng thái, kết quả của một task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của task
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *
 * /tasks/webhook/{taskId}:
 *   post:
 *     summary: (Webhook) Nhận kết quả từ AHV Orchestrator
 *     tags: [Tasks]
 *     description: Hệ thống AHV Orchestrator sẽ tự gọi API này khi job hoàn tất. Không dùng cho client.
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK (System received)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user:
 *           type: string
 *         aiModel:
 *           type: string
 *         providerJobId:
 *           type: string
 *         payload:
 *           type: object
 *         status:
 *           type: string
 *           enum: [pending, queued, processing, succeeded, failed]
 *         result:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             filename:
 *               type: string
 *             meta:
 *               type: object
 *         error:
 *           type: string
 *         price:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
