import { Response as ExpressResponse } from "express";
import { JSendResponse } from "./jSend";

export interface Response extends ExpressResponse {
  json: (body: JSendResponse) => this;
}
