import { SortOrder } from "mongoose";

export const buildNestedPropSorter =
  <S, U extends number = number>(selector: (state: S) => U, order: SortOrder) =>
  (items: S[]): void => {
    const orderNumber =
      order && ["desc", "descending", "-1"].includes(String(order)) ? -1 : 1;
    items.sort((a, b) => {
      const aValue = selector(a);
      const bValue = selector(b);
      return (aValue - bValue) * orderNumber;
    });
  };

export type NestedPropSorter<S> = ReturnType<typeof buildNestedPropSorter<S>>;
