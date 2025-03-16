/**
 * Type utility to convert types to their query string representation
 */
export type QueryStringify<T> = {
  [K in keyof T]: T[K] extends number
    ? string
    : T[K] extends boolean
      ? "true" | "false" | "1" | "0"
      : T[K];
};

/**
 * Generic type for converting any object type to a query string compatible type
 */
export type RawQuery<T> = Partial<QueryStringify<T> | T>;
