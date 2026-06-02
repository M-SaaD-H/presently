/**
 * Shared error boundary for Next.js App Router route handlers.
 *
 * Supports both plain handlers (req only) and dynamic route handlers
 * (req + context with params), so all routes share one error-handling path.
 */

import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/utils/apiError";

type PlainHandler = (req: NextRequest) => Promise<NextResponse | Response>;
type ContextHandler<C> = (
  req: NextRequest,
  ctx: C
) => Promise<NextResponse | Response>;

/** Wrap a plain (no context) route handler */
export function asyncHandler(handler: PlainHandler): PlainHandler;
/** Wrap a dynamic route handler that receives a context object (e.g. { params }) */
export function asyncHandler<C>(handler: ContextHandler<C>): ContextHandler<C>;

export function asyncHandler<C>(
  handler: PlainHandler | ContextHandler<C>
): PlainHandler | ContextHandler<C> {
  return async function (req: NextRequest, ctx?: C) {
    try {
      if (ctx !== undefined) {
        return await (handler as ContextHandler<C>)(req, ctx);
      }
      return await (handler as PlainHandler)(req);
    } catch (error: unknown) {
      let apiError: ApiError;

      if (error instanceof ApiError) {
        apiError = error;
      } else if (error instanceof Error) {
        apiError = new ApiError(500, error.message);
      } else {
        apiError = new ApiError(500, "An unexpected error occurred");
      }

      return NextResponse.json(
        {
          success: false,
          message: apiError.message,
          data: null,
          errors: apiError.errors,
        },
        { status: apiError.statusCode }
      );
    }
  } as PlainHandler | ContextHandler<C>;
}
