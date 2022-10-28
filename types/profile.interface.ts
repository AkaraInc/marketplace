import { ICollection } from "./collection.interface";
import { IItem } from "./item.interface";
import { ILike } from "./like.interface";

export interface IProfile {
  profile?: any;
  id: number;
  avatar?: string;
  bio?: string;
  name?: string;
  walletAddress?: string;
  createdAt?: string;
  items?: IItem[];
  likes?: ILike[];
  collections?: ICollection[];
  following?: {
    followerId: number;
    followingId: number;
  }[];
  followers?: {
    followerId: number;
    followingId: number;
  }[];
}

export const profileInitialState: IProfile = {
  id: 0,
  name: "John Snow",
  avatar: "",
};
