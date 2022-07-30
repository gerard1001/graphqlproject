import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { Request } from "express";

export interface AuthTokenPayload {
  userId: number;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, process.env.SECRETE_WORD as jwt.Secret);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(
    token,
    process.env.SECRETE_WORD as jwt.Secret
  ) as AuthTokenPayload;
}

export function decodeAuthHeader(req: Request): AuthTokenPayload | null {
  let payload: AuthTokenPayload | null = null;
  const token = req.headers.authorization;

  if (token) {
    payload = verifyToken(token.split(" ")[1]);
  }

  return payload;
}

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

export const verifyPassword = (
  password: string,
  hashedPassword: string
): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
};
