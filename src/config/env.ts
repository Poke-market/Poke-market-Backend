import "dotenv/config";

const env = (name: string, defaultValue?: string): string => {
  const value = process.env[name] ?? defaultValue;

  if (value === undefined)
    throw new Error(`Missing '${name}' environment variable`);

  return value;
};

export const PORT = env("PORT", "5001");
export const MONGO_URI = env("MONGO_URI");
export const JWT_SECRET = env("JWT_SECRET");
export const NODE_ENV = env("NODE_ENV", "development");
