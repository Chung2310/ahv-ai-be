/**
 * @swagger
 * tags:
 *   name: AiModels
 *   description: AI Model management
 */

/**
 * @swagger
 * /aimodels:
 *   get:
 *     summary: Get all AI models
 *     tags: [AiModels]
 *     responses:
 *       "200":
 *         description: OK
 *   post:
 *     summary: Create an AI model
 *     tags: [AiModels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - provider
 *             properties:
 *               name:
 *                 type: string
 *               provider:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: string
 *               payload:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 */
