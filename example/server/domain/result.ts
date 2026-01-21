/**
 * Result型 - エラーを明示的に扱う（本書 第10章）
 */

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const map = <T, U, E>(result: Result<T, E>, fn: (v: T) => U): Result<U, E> =>
  result.ok ? ok(fn(result.value)) : result;

export const flatMap = <T, U, E>(result: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> =>
  result.ok ? fn(result.value) : result;
