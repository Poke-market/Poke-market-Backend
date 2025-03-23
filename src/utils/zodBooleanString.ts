import { z } from "zod";

export const zBooleanString = z.union([
  z.literal("true").transform(() => true),
  z.literal("false").transform(() => false),
  z.boolean(),
]);
