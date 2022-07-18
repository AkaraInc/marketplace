import { IUser } from "./user.interface";
import { IItem } from "./item.interface";

export interface IBid {
  id: number | string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  itemId: number;
  bidderId: number;
  bidder: IUser;
  item: IItem;
}