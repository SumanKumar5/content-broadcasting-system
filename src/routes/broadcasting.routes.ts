import { Router } from "express";
import { getLiveContent } from "../controllers/broadcasting.controller";

const router = Router();

/**
 * @swagger
 * /content/live/{teacherId}:
 *   get:
 *     summary: Get currently live content for a teacher (Public)
 *     tags: [Broadcasting]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: The teacher's user ID
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject (e.g. maths, science)
 *     responses:
 *       200:
 *         description: Live content fetched or no content available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Server error
 */
router.get("/live/:teacherId", getLiveContent);

export default router;
