import { Router } from "express";
import {
  handleSubjectAnalytics,
  handleTeacherAnalytics,
} from "../controllers/analytics.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";

const router = Router();

/**
 * @swagger
 * /analytics/subjects:
 *   get:
 *     summary: Get subject-wise analytics (Principal only)
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/subjects",
  authenticate,
  authorize("principal"),
  handleSubjectAnalytics,
);

/**
 * @swagger
 * /analytics/my-stats:
 *   get:
 *     summary: Get teacher's own upload statistics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher analytics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/my-stats",
  authenticate,
  authorize("teacher"),
  handleTeacherAnalytics,
);

export default router;
