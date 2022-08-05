import axios from "axios";
import { api } from "../services/apiClient";

const baseUrl = `${process.env.NEXT_PUBLIC_DOMAIN!}/api/user`;

class User {
  constructor() {}

  async fetch(walletAddress: string) {
    if (!walletAddress) {
      console.log("walletAddress is ", walletAddress);
      return null;
    }

    try {
      const response = await api.get(`${baseUrl}/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update() {}
}

export default new User();
