export interface JSendError {
  code?: number;
  data?: null | object;
  message: string;
  status: "error";
}
export interface JSendFail {
  data: null | object;
  status: "fail";
}

export type JSendResponse = JSendError | JSendFail | JSendSuccess;
export type JSendStatus = "error" | "fail" | "success";

export interface JSendSuccess {
  data: null | object;
  status: "success";
}
