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

const asString = (val: unknown): string | undefined => {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0] as string;
  return undefined;
};

export const handleUpload = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return sendError(res, "File is required", 400);
  }

  const parsed = uploadContentSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(
      res,
      parsed.error.issues.map((e) => e.message).join(", "),
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
  try {
    const result = await getMyContent(req.user!.id, {
      subject: asString(req.query.subject),
      status: asString(req.query.status),
      page: req.query.page
        ? parseInt(asString(req.query.page) as string)
        : undefined,
      limit: req.query.limit
        ? parseInt(asString(req.query.limit) as string)
        : undefined,
    });
    return sendSuccess(res, result, "Content fetched successfully");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch content";
    return sendError(res, message, 500);
  }
};

export const handleGetAllContent = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getAllContent({
      subject: asString(req.query.subject),
      teacherId: asString(req.query.teacherId),
      status: asString(req.query.status),
      page: req.query.page
        ? parseInt(asString(req.query.page) as string)
        : undefined,
      limit: req.query.limit
        ? parseInt(asString(req.query.limit) as string)
        : undefined,
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
  try {
    const result = await getPendingContent({
      page: req.query.page
        ? parseInt(asString(req.query.page) as string)
        : undefined,
      limit: req.query.limit
        ? parseInt(asString(req.query.limit) as string)
        : undefined,
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
    const contentId = req.params.id as string;
    const content = await approveContent(contentId, req.user!.id);
    return sendSuccess(res, content, "Content approved successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Approval failed";
    return sendError(res, message, 400);
  }
};

export const handleReject = async (req: AuthRequest, res: Response) => {
  const parsed = rejectContentSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, parsed.error.issues[0].message, 400);
  }

  try {
    const contentId = req.params.id as string;
    const content = await rejectContent(contentId, req.user!.id, parsed.data);
    return sendSuccess(res, content, "Content rejected successfully");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rejection failed";
    return sendError(res, message, 400);
  }
};
