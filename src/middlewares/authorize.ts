import { NextFunction, Response } from "express";
import { sendError } from "../utils/response";
import { AuthRequest } from "./authenticate";

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Forbidden", 403);
    }
    next();
  };
};
