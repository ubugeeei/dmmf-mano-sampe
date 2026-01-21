// NewType Type
declare const brand: unique symbol;
export type NewType<T, B extends string> = T & { readonly [brand]: B };
export const unsafeCoerce = <T, B extends string>(v: T): NewType<T, B> =>
  v as NewType<T, B>;
export const unwrap = <T, B extends string>(v: NewType<T, B>): T => v as T;

// Result
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Eff
export type Eff<T, E> = { run: () => Promise<Result<T, E>> };

export const Eff = {
  succeed: <T>(v: T): Eff<T, never> => ({ run: async () => ok(v) }),
  fail: <E>(e: E): Eff<never, E> => ({ run: async () => err(e) }),
  map: <T, U, E>(eff: Eff<T, E>, f: (v: T) => U): Eff<U, E> => ({
    run: async () => {
      const r = await eff.run();
      return r.ok ? ok(f(r.value)) : r;
    },
  }),
  flatMap: <T, U, E>(eff: Eff<T, E>, f: (v: T) => Eff<U, E>): Eff<U, E> => ({
    run: async () => {
      const r = await eff.run();
      return r.ok ? f(r.value).run() : r;
    },
  }),
  fromPromise: <T, E>(
    p: () => Promise<T>,
    onErr: (e: unknown) => E,
  ): Eff<T, E> => ({
    run: async () => {
      try {
        return ok(await p());
      } catch (e) {
        return err(onErr(e));
      }
    },
  }),
} as const;
