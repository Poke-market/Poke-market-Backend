import "express";
import { JSendFail, JSendError } from "./jSend";
import { User } from "../models/userModel";
declare global {
  namespace Express {
    interface Locals {
      processedError?: JSendError | JSendFail;
      user?: InstanceType<typeof User>;
    }
  }
}
