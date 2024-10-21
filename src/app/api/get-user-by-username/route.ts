import dbConnect from "@/lib/dbConnect";
import User from "@/models/User.model";

export const GET = async (req: Request): Promise<Response> => {
  try {
    // Get username from params.
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    // Connect to db.
    await dbConnect();

    const user = await User.findOne({ username }).select("_id");

    // If user not found.
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Could Not Find User.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User Found.",
        userId: user._id,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error : Error while getting user.", error);
    return Response.json(
      {
        success: false,
        message: "Could Not Find User.",
      },
      {
        status: 500,
      }
    );
  }
};
