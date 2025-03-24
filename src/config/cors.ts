import { IS_PRODUCTION } from "./env";

export const corsOptions = {
  origin: IS_PRODUCTION ? ["https://poke-markt-webshop.vercel.app"] : true,
  credentials: true,
};
