import { NextApiRequest, NextApiResponse } from "next";
import {
  Actions,
  ItemType,
  TriggerAction,
} from "../../../services/action.service";
import { randStr } from "../../../utils/helpers/randomStr";
import prisma from "../../../utils/lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const data = await prisma.collection.findMany({
        include: {
          author: {
            include: {
              profile: true,
            },
          },
          items: true,
          ratings: true,
        },
      });
      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
    }
  }
  if (req.method === "POST") {
    const { data, user } = req.body;

    try {
      const response = await prisma.collection.create({
        data: {
          title: data.title,
          description: data.description,
          tokenId: randStr(10),
          images: data.image,
          visible: data.visible,
          type: {
            connect: {
              id: parseInt(data.type),
            },
          },
          videos: data.videos,
          updatedAt: new Date(),
          author: {
            connect: {
              id: user.id,
            },
          },
          items: {
            connect: data.items.map((item: { id: number }) => ({
              id: item.id,
            })),
          },
          contributors: {
            create: data.owners.map((user: { id: number }) => ({
              user: {
                connect: {
                  id: user.id,
                },
              },
            })),
          },
        },
      });

      await TriggerAction({
        action: Actions.CreateCollection,
        user,
        collection: data,
      });

      res.status(201).json({ id: response.id, message: "Collection created" });
    } catch (error) {
      console.log(error);

      res.json({ error });
    }
  }
  if (req.method === "PATCH") {
    try {
      await prisma.collection.update({
        where: {
          id: req.body.id,
        },
        data: {
          images: req.body.images,
          videos: req.body.videos,
        },
      });
      res.status(201).json({ message: "Collection images updated" });
    } catch (error) {
      console.log(error);
      res.json({ error });
    }
  }
};
export default handler;
