import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthPayload extends JwtPayload {
  userId: string;
  role: "brand" | "creator";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication token required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    res.status(401).json({
      success: false,
      message: "Invalid authentication configuration or token",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      !["brand", "creator"].includes(decoded.role as string)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
      return;
    }

    req.user = decoded as AuthPayload;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

export function authorize(...roles: Array<"brand" | "creator">) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };
}