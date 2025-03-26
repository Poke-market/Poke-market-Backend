import "dotenv/config";

const env = (name: string, defaultValue?: string): string => {
  const value = process.env[name] ?? defaultValue;

  if (value === undefined)
    throw new Error(`Missing '${name}' environment variable`);

  return value;
};

export const PORT = env("PORT", "3000");
export const MONGO_URI = env("MONGO_URI");
export const JWT_SECRET = env("JWT_SECRET");
export const ARCJET_KEY = env("ARCJET_KEY");
export const SENDGRID_API_KEY = env("SENDGRID_API_KEY");
export const SENDGRID_TEMPLATE_ID_VERIFY = env("SENDGRID_TEMPLATE_ID_VERIFY");
export const SENDGRID_TEMPLATE_ID_RESET = env("SENDGRID_TEMPLATE_ID_RESET");
export const FROM_EMAIL = env("FROM_EMAIL");
export const BASE_URL = env("BASE_URL");
export const CLOUDINARY_CLOUD_NAME = env("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = env("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = env("CLOUDINARY_API_SECRET");

// External Links
export const FRONTEND_LIVE_URL = env("FRONTEND_LIVE_URL");
export const FRONTEND_DEV_URL = env("FRONTEND_DEV_URL");
export const BACKEND_REPO_URL = env("BACKEND_REPO_URL");
export const FRONTEND_REPO_URL = env("FRONTEND_REPO_URL");

const NODE_ENV = env("NODE_ENV", "development");
export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_DEVELOPMENT = NODE_ENV === "development";
