const today = new Date();
const date =
  today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

export interface IUser {
  id: number | string;
  walletAddress: string;
  email: string;
  accessToken: string;
  joined: string;
  isVerified: boolean;
}

export const initialState: IUser = {
  id: 0,
  email: "",
  accessToken: "",
  walletAddress: "",
  joined: date,
  isVerified: false,
};