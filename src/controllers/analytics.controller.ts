import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import {
  getSubjectAnalytics,
  getTeacherAnalytics,
} from "../services/analytics.service";
import { sendError, sendSuccess } from "../utils/response";

export const handleSubjectAnalytics = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const data = await getSubjectAnalytics();
    return sendSuccess(res, data, "Analytics fetched successfully");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch analytics";
    return sendError(res, message, 500);
  }
};

export const handleTeacherAnalytics = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const data = await getTeacherAnalytics(req.user!.id);
    return sendSuccess(res, data, "Teacher analytics fetched successfully");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch analytics";
    return sendError(res, message, 500);
  }
};
