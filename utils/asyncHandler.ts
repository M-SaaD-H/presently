import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/utils/apiError";

export function asyncHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
	return async function (req: NextRequest) {
		try {
			return await handler(req);
		} catch (error: any) {
			console.error("E :", error);

			if (!(error instanceof ApiError)) {
				error = new ApiError(
					error.statusCode || 500,
					error.message || "Something went wrong",
					error.errors
				)
			}

			return NextResponse.json(
				{
					success: false,
					message: error.message,
					data: null,
					errors: error.errors
				},
				{ status: error.statusCode }
			);
		}
	};
}
