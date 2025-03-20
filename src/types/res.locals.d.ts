import "express";
import { JSendFail, JSendError } from "./jSend";

declare global {
  namespace Express {
    interface Locals {
      processedError: JSendError | JSendFail;
    }
  }
}
