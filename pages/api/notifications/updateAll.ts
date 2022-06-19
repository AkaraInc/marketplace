import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/lib/prisma";
import verifyToken from "../../../utils/middlewares/verifyToken";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  auth?: { user: string }
) => {
  const id: string = req.query.id as string;
  if (req.method === "PUT") {
    await prisma.user.update({
      where: {
        address: req.body.address,
      },
      data: {
        notifications: {
          updateMany: {
            where: {
              status: false,
            },
            data: {
              status: true,
            },
          },
        },
      },
    });
    res.status(200).json({ message: "Updated all notifications successfully" });
  }
};

export default verifyToken(handler);