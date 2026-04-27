import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import {
  approveContent,
  getAllContent,
  getMyContent,
  getPendingContent,
  rejectContent,
  uploadContent,
} from "../services/content.service";
import { sendError, sendSuccess } from "../utils/response";
import {
  rejectContentSchema,
  uploadContentSchema,
} from "../validations/content.validation";

export const handleUpload = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return sendError(res, "File is required", 400);
  }

  const parsed = uploadContentSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(
      res,
      parsed.error.errors.map((e) => e.message).join(", "),
      400,
    );
  }

  try {
    const content = await uploadContent(parsed.data, req.file, req.user!.id);
    return sendSuccess(res, content, "Content uploaded successfully", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return sendError(res, message, 400);
  }
};

export const handleGetMyContent = async (req: AuthRequest, res: Response) => {
  const { subject, status, page, limit } = req.query;

  try {
    const result = await getMyContent(req.user!.id, {
      subject: subject as string,
      status: status as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    return sendSuccess(res, result, "Content fetched successfully");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch content";
    return sendError(res, message, 500);
  }
};

export const handleGetAllContent = async (req: AuthRequest, res: Response) => {
  const { subject, teacherId, status, page, limit } = req.query;

  try {
    const result = await getAllContent({
      subject: subject as string,
      teacherId: teacherId as string,
      status: status as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    return sendSuccess(res, result, "All content fetched successfully");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch content";
    return sendError(res, message, 500);
  }
};

export const handleGetPendingContent = async (
  req: AuthRequest,
  res: Response,
) => {
  const { page, limit } = req.query;

  try {
    const result = await getPendingContent({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    return sendSuccess(res, result, "Pending content fetched successfully");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch content";
    return sendError(res, message, 500);
  }
};

export const handleApprove = async (req: AuthRequest, res: Response) => {
  try {
    const content = await approveContent(req.params.id, req.user!.id);
    return sendSuccess(res, content, "Content approved successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Approval failed";
    return sendError(res, message, 400);
  }
};

export const handleReject = async (req: AuthRequest, res: Response) => {
  const parsed = rejectContentSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, parsed.error.errors[0].message, 400);
  }

  try {
    const content = await rejectContent(
      req.params.id,
      req.user!.id,
      parsed.data,
    );
    return sendSuccess(res, content, "Content rejected successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rejection failed";
    return sendError(res, message, 400);
  }
};
