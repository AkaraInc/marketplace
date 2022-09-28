import { IUser } from "./user.interface";
import { IItem } from "./item.interface";
import { IContributor } from "./contributors.interface";
import { IBeneficiary } from "./beneficiary.interface";

export interface ICollectionType {
  id: number | string;
  name: string;
  minOwners: number;
  maxOwners: number;
  minItems: number;
  maxItems: number;
  typeId: string;
}
export interface ICollection {
  id: number;
  title: string;
  tokenId: string;
  collectionTypeId: number;
  items: IItem[];
  description: string;
  createdAt: string;
  updatedAt: string;
  revenue: number;
  author: IUser;
  images: string[];
  videos: string[];
  ratings: any[];
  type: ICollectionType;
  owners: IUser[];
  visible: boolean;
  lunchTime: string;
  status: CollectionStatus;
  contributors: IContributor[];
  beneficiaries: IBeneficiary[];
}
type CollectionStatus =
  | "DRAFT"
  | "CREATED"
  | "VERIFIED"
  | "READY"
  | "PUBLISHED";
