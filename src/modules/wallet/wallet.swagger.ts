/**
 * @swagger
 * tags:
 *   name: Wallets
 *   description: Wallet management
 */

/**
 * @swagger
 * /wallets:
 *   get:
 *     summary: Get all wallets (Admin/SuperAdmin)
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of wallets
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *
 * /wallets/me:
 *   get:
 *     summary: Get my wallet info
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /wallets/balance/{userId}:
 *   put:
 *     summary: Update user balance (SuperAdmin only)
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       "200":
 *         description: OK
 */
