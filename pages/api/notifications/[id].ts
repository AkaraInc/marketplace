import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/lib/prisma";
import verifyToken from "../../../utils/middlewares/verifyToken";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  auth?: string
) => {
  const id: number = parseInt(req.query.id as string);
  if (req.method === "GET") {
    const data = await prisma.notification.findMany({
      where: {
        receiverId: id,
        read: false,
      },
      include: {
        receiver: {
          include: {
            profile: true,
          },
        },
        item: true,
      },
    });

    res.status(200).json({ data });
  }

  if (req.method === "PUT") {
    await prisma.notification.update({
      where: {
        id: id,
      },
      data: {
        read: true,
      },
    });
    res.status(200).json({ message: "Updated successfully" });
  }

  if (req.method === "DELETE") {
    const item = await prisma.notification.findFirst({
      where: {
        id: id,
      },
    });
    if (!item) {
      return res.status(404).json({
        error: new Error("Notification does not exist"),
      });
    }

    await prisma.notification.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json({ message: "Deleted successfully" });
  }
};

export default verifyToken(handler);
