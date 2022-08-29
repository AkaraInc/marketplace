import { NextApiRequest, NextApiResponse } from "next";
import { Actions, TriggerAction } from "../../../services/action.service";
import prisma from "../../../utils/lib/prisma";

export default async function profile(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { profile, user } = req.body;

    try {
      const data = await prisma.userFollower.create({
        data: {
          followerId: user.id,
          followingId: profile.id,
        },
      });
      console.log(data);

      console.log("user followed");

      await TriggerAction({
        action: Actions.Follow,
        user,
        profile,
      });
      res.status(200).send(data);
    } catch (error) {
      console.log(error);
      res.json({
        error: "There was an error",
      });
    }
  }
}
