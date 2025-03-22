import { create } from "express-handlebars";
import type { Engine } from "express-handlebars/types";
import { getFirstLevelDirNamesSync } from "../utils/getFistLevelDirNames";

// Handlebars logical helpers factory, compares two or more values
const compareOp =
  <T>(comparer: (a: T, b: T) => boolean) =>
  (...args: T[]) => {
    args.pop(); // => options
    return args.slice(1).every((_, i) => comparer(args[i], args[++i]));
  };

// Handlebars setup
const hbs = create({
  defaultLayout: "main",
  layoutsDir: "src/views/layouts",
  partialsDir: "src/views/partials",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
  },
  helpers: {
    printIf: (condition: boolean, str: string) => (condition ? str : ""),
    selectedIf: (condition: boolean) => (condition ? "selected" : ""),
    checkedIf: (condition: boolean) => (condition ? "checked" : ""),
    not: (condition: boolean) => !condition,
    eq: compareOp<unknown>((a, b) => a === b),
    ne: compareOp<unknown>((a, b) => a !== b),
    lt: compareOp<number>((a, b) => a < b),
    gt: compareOp<number>((a, b) => a > b),
    lte: compareOp<number>((a, b) => a <= b),
    gte: compareOp<number>((a, b) => a >= b),
    and: compareOp<boolean>((a, b) => a && b),
    or: compareOp<boolean>((a, b) => a || b),
    includes: <T>(array: T[], value: T): boolean =>
      Array.isArray(array) && array.includes(value),
    price: (price: number) => `€ ${price}`,
    formatDate: (date: Date) =>
      date.toLocaleDateString("nl-NL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    section: function (
      this: { _sections?: Record<string, string> },
      name: string,
      options: { fn: (context: unknown) => string },
    ) {
      this._sections ??= {};
      if (!options.fn) {
        // render section
        return this._sections[name] ?? "";
      } else {
        // register section
        this._sections[name] = options.fn(this);
      }
    },
  },
});

// Create a wrapper function to overwrite engine return type
const voidEngine = (...args: Parameters<Engine>) => {
  void hbs.engine(...args);
};

export default {
  ...hbs,
  engine: voidEngine,
};

export const getViewPaths = (path: string) => {
  const views = getFirstLevelDirNamesSync(path);
  return [path, ...views.map((view) => `${path}/${view}`)];
};
