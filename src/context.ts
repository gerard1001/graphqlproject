import { PrismaClient } from "@prisma/client";
import { Request } from "express";
import { decodeAuthHeader } from "./utils/auth.util";

export const prisma = new PrismaClient();

export interface Context {
  userId?: number;
  prisma: PrismaClient;
}

export const context = function ({ req }: { req: Request }): Context {
  const user = decodeAuthHeader(req as Request);

  return { prisma, userId: user?.userId };
};
