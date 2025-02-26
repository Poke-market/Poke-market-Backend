import { NotFoundError } from "../errors";

export const notFound = () => {
  throw new NotFoundError("The requested endpoint doesn't exist");
};
