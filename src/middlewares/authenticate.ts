import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/response";

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
  file?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
};
