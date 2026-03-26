/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Xác thực và quản lý phiên đăng nhập
 */

/**
 * @swagger
 * /auths/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Abc12345
 *     responses:
 *       "201":
 *         description: Đăng ký thành công
 *       "400":
 *         description: Dữ liệu không hợp lệ hoặc email đã tồn tại
 */

/**
 * @swagger
 * /auths/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       "200":
 *         description: Đăng nhập thành công, trả về access token và set refresh token cookie
 *       "401":
 *         description: Sai email hoặc mật khẩu
 */

/**
 * @swagger
 * /auths/logout:
 *   post:
 *     summary: Đăng xuất
 *     tags: [Auth]
 *     responses:
 *       "204":
 *         description: Đăng xuất thành công
 */

/**
 * @swagger
 * /auths/me:
 *   get:
 *     summary: Lấy thông tin tài khoản đang đăng nhập
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Thành công
 *       "401":
 *         description: Chưa xác thực
 */

/**
 * @swagger
 * /auths/refresh:
 *   post:
 *     summary: Làm mới access token bằng refresh token
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Nếu không truyền, hệ thống tự đọc từ cookie
 *     responses:
 *       "200":
 *         description: Trả về access token mới
 *       "401":
 *         description: Refresh token không hợp lệ hoặc đã hết hạn
 */
