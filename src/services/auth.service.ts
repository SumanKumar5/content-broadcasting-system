import bcrypt from "bcrypt";
import prisma from "../models/prisma";
import { signToken } from "../utils/jwt";
import { LoginInput, RegisterInput } from "../validations/auth.validation";

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
  });

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
