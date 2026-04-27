import { Router } from "express";
import {
  handleApprove,
  handleGetAllContent,
  handleGetMyContent,
  handleGetPendingContent,
  handleReject,
  handleUpload,
} from "../controllers/content.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { cloudinaryUpload } from "../utils/cloudinaryUpload";

const router = Router();

/**
 * @swagger
 * /content/upload:
 *   post:
 *     summary: Upload new content (Teacher only)
 *     tags: [Content - Teacher]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, subject, file]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Algebra Basics
 *               subject:
 *                 type: string
 *                 example: maths
 *               description:
 *                 type: string
 *                 example: Introduction to algebra
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-27T00:00:00.000Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-28T23:59:00.000Z"
 *               duration:
 *                 type: integer
 *                 example: 5
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Content uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error or invalid file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/upload",
  authenticate,
  authorize("teacher"),
  cloudinaryUpload.single("file"),
  handleUpload,
);

/**
 * @swagger
 * /content/my-content:
 *   get:
 *     summary: Get teacher's own uploaded content
 *     tags: [Content - Teacher]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Content fetched successfully
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
  "/my-content",
  authenticate,
  authorize("teacher"),
  handleGetMyContent,
);

/**
 * @swagger
 * /content/all:
 *   get:
 *     summary: Get all content (Principal only)
 *     tags: [Content - Principal]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter by subject
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *         description: Filter by teacher ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: All content fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/all", authenticate, authorize("principal"), handleGetAllContent);

/**
 * @swagger
 * /content/pending:
 *   get:
 *     summary: Get all pending content (Principal only)
 *     tags: [Content - Principal]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Pending content fetched successfully
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
  "/pending",
  authenticate,
  authorize("principal"),
  handleGetPendingContent,
);

/**
 * @swagger
 * /content/{id}/approve:
 *   patch:
 *     summary: Approve content (Principal only)
 *     tags: [Content - Principal]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Content not found or not pending
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/:id/approve",
  authenticate,
  authorize("principal"),
  handleApprove,
);

/**
 * @swagger
 * /content/{id}/reject:
 *   patch:
 *     summary: Reject content with a reason (Principal only)
 *     tags: [Content - Principal]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectInput'
 *     responses:
 *       200:
 *         description: Content rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Content not found or not pending
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/reject", authenticate, authorize("principal"), handleReject);

export default router;
