import jwt from "jsonwebtoken";
import { APIGatewayProxyEvent } from "aws-lambda";
import { AuthenticationError } from "./errors/authentication.error";
import { JwtUser, JwtDecodeOptions } from "./jwt.types";

/**
 * Extracts Bearer token from API Gateway headers
 */
function extractBearerToken(
  event: APIGatewayProxyEvent
): string | null {
  const headers = event.headers || {};

  const authHeader =
    headers.Authorization ||
    headers.authorization;

  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError(
      "Invalid authorization header format. Expected: Bearer <token>"
    );
  }

  return authHeader.substring(7);
}

/**
 * Decode + verify JWT from API Gateway event
 */
export function getCurrentUserFromEvent(
  event: APIGatewayProxyEvent,
  options: JwtDecodeOptions = {}
): JwtUser | null {
  const { required = true } = options;

  try {
    const token = extractBearerToken(event);

    if (!token) {
      if (required) {
        throw new AuthenticationError("Authorization token is required");
      }
      return null;
    }

    const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
    if (!secret || typeof secret !== "string") {
      throw new AuthenticationError("JWT verification not configured");
    }

    const decoded = jwt.verify(token, secret) as Record<string, unknown> & { id?: string; userId?: string; role?: string };

    const id = decoded?.id ?? decoded?.userId;
    if (!id || typeof id !== "string") {
      throw new AuthenticationError("Invalid token payload");
    }

    return {
      id,
      role: decoded.role,
    };
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof AuthenticationError
    ) {
      if (required) {
        throw new AuthenticationError("Invalid or expired token");
      }
      return null;
    }

    throw error;
  }
}

/**
 * Convenience helpers
 */
export function requireUser(
  event: APIGatewayProxyEvent
): JwtUser {
  const user = getCurrentUserFromEvent(event, { required: true });
  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }
  return user;
}

export function optionalUser(
  event: APIGatewayProxyEvent
): JwtUser | null {
  return getCurrentUserFromEvent(event, { required: false });
}
