import type { newType, Result, Eff } from "./index.def";

export type { newType, Result, Eff } from "./index.def";

/*
 *
 * newType
 *
 */

export const unsafeCoerce = <T, B extends string>(v: T): newType<T, B> => v as newType<T, B>;

export const unwrap = <T, B extends string>(v: newType<T, B>): T => v as T;

/*
 *
 * Result
 *
 */

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/*
 *
 * Eff
 *
 */

export const succeed = <T>(v: T): Eff<T, never> => ({ run: async () => ok(v) });

export const fail = <E>(e: E): Eff<never, E> => ({ run: async () => err(e) });

/** Short for map */
export const m = <T, U, E>(eff: Eff<T, E>, f: (v: T) => U): Eff<U, E> => ({
  run: async () => {
    const r = await eff.run();
    return r.ok ? ok(f(r.value)) : r;
  },
});

/** Short for flatMap */
export const fm = <T, U, E1, E2>(eff: Eff<T, E1>, f: (v: T) => Eff<U, E2>): Eff<U, E1 | E2> => ({
  run: async () => {
    const r = await eff.run();
    return r.ok ? f(r.value).run() : r;
  },
});

export const fromPromise = <T, E>(p: () => Promise<T>, onErr: (e: unknown) => E): Eff<T, E> => ({
  run: async () => {
    try {
      return ok(await p());
    } catch (e) {
      return err(onErr(e));
    }
  },
});

/*
 *
 * Exhaustive Check
 *
 */

/** Throws if called, used for exhaustive switch checks */
export const assertNever = (x: never, error?: Error): never => {
  throw error ?? new Error(`Unexpected value: ${x}`);
};
