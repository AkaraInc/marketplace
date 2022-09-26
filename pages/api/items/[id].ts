import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const id: number = parseInt(req.query.id as string);

    try {
      const items = await prisma.item.findFirst({
        where: {
          id: id,
        },
        include: {
          auction: true,
          owner: {
            include: {
              profile: true,
            },
          },
          auction: true,
          bids: {
            include: {
              user: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
          likes: true,
        },
      });
      return res.status(200).json(items);
    } catch (error) {
      console.log(error);
    }
  }
};

export default handler;
