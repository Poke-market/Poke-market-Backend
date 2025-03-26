import { IS_PRODUCTION } from "./env";

export const corsOptions = {
  origin: IS_PRODUCTION
    ? [
        "https://poke-markt-webshop.vercel.app",
        "https://strong-ward-453503-f1.web.app/",
        "https://strong-ward-453503-f1.firebaseapp.com/",
        "http://localhost:3000",
      ]
    : true,
  credentials: true,
};
