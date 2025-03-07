import { Types } from "mongoose";

export {};

export interface UserType {
  _id: string | Types.ObjectId;
  email: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    export interface Request {
      user?: UserType;
    }
  }
}
