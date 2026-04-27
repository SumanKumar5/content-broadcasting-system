import { Request, Response } from "express";
import prisma from "../models/prisma";
import { getLiveContentForTeacher } from "../services/scheduling.service";
import { sendError, sendSuccess } from "../utils/response";

export const getLiveContent = async (req: Request, res: Response) => {
  const teacherId = req.params.teacherId as string;
  const rawSubject = req.query.subject;
  const subject: string | undefined =
    typeof rawSubject === "string" ? rawSubject : undefined;

  try {
    const teacher = await prisma.user.findFirst({
      where: { id: teacherId, role: "teacher" },
    });

    if (!teacher) {
      return sendSuccess(res, null, "No content available");
    }

    const content = await getLiveContentForTeacher(teacherId, subject);

    if (!content) {
      return sendSuccess(res, null, "No content available");
    }

    return sendSuccess(res, content, "Live content fetched successfully");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch live content";
    return sendError(res, message, 500);
  }
};
