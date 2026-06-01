import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/utils/apiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";

export const POST = asyncHandler(async (req: NextRequest) => {
	const url = await req.json();

	if (!url || url === "") {
		throw new ApiError(404, "Missing url to generate video.");
	}

	console.log(url);

	return NextResponse.json(
		new ApiResponse(
			200,
			{ videoUrl: url },
			"Video is generated successfully."
		),
		{ status: 200 }
	)
})