/**
 * Type for a function that takes an input of type I and returns an output of type O
 */
type UnaryFunction<I, O> = (input: I) => O;

/**
 * Creates a new function that pipes its input through a series of functions.
 *
 * @example
 * // Simple example
 * const addOne = (x: number) => x + 1;
 * const double = (x: number) => x * 2;
 * const addOneAndDouble = pipe(addOne, double);
 * addOneAndDouble(3); // Returns 8: (3 + 1) * 2
 *
 * @example
 * // Example with different types
 * const toString = (x: number) => `${x}`;
 * const appendExclamation = (x: string) => `${x}!`;
 * const numberToExclamation = pipe(toString, appendExclamation);
 * numberToExclamation(42); // Returns "42!"
 */
export function pipe<A, B>(ab: UnaryFunction<A, B>): UnaryFunction<A, B>;
export function pipe<A, B, C>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
): UnaryFunction<A, C>;
export function pipe<A, B, C, D>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
): UnaryFunction<A, D>;
export function pipe<A, B, C, D, E>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
): UnaryFunction<A, E>;
export function pipe<A, B, C, D, E, F>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
  ef: UnaryFunction<E, F>,
): UnaryFunction<A, F>;
export function pipe<A, B, C, D, E, F, G>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
  ef: UnaryFunction<E, F>,
  fg: UnaryFunction<F, G>,
): UnaryFunction<A, G>;
export function pipe<A, B, C, D, E, F, G, H>(
  ab: UnaryFunction<A, B>,
  bc: UnaryFunction<B, C>,
  cd: UnaryFunction<C, D>,
  de: UnaryFunction<D, E>,
  ef: UnaryFunction<E, F>,
  fg: UnaryFunction<F, G>,
  gh: UnaryFunction<G, H>,
): UnaryFunction<A, H>;
export function pipe(
  ...fns: UnaryFunction<unknown, unknown>[]
): UnaryFunction<unknown, unknown> {
  return (value: unknown): unknown => fns.reduce((acc, fn) => fn(acc), value);
}
