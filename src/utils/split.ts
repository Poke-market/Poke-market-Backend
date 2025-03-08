export const splitOn = (splitPattern: string | RegExp) => (val?: string) =>
  val?.split(splitPattern).filter(Boolean) ?? [];
export type SplitFunc = ReturnType<typeof splitOn>;

export const splitOnComma = splitOn(/\s*,\s*/);
export const splitOnSpace = splitOn(/\s+/);
