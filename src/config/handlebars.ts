import { create } from "express-handlebars";
import type { Engine } from "express-handlebars/types";

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
    price: (price: number) => `€ ${price}`,
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
