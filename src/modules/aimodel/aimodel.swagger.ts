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
 *               - version
 *               - provider
 *             properties:
 *               name:
 *                 type: string
 *               version:
 *                 type: string
 *               provider:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 */
