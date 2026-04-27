import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service";
import { sendError, sendSuccess } from "../utils/response";
import { loginSchema, registerSchema } from "../validations/auth.validation";

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, parsed.error.issues[0].message, 400);
  }

  try {
    const result = await registerUser(parsed.data);
    return sendSuccess(res, result, "User registered successfully", 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return sendError(res, message, 400);
  }
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, parsed.error.issues[0].message, 400);
  }

  try {
    const result = await loginUser(parsed.data);
    return sendSuccess(res, result, "Login successful");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return sendError(res, message, 401);
  }
};
