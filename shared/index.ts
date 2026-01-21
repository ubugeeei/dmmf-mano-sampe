/**
 * Shared utilities public API
 */

// Types
export type { newType, Result, Eff } from "./index.def";

// Implementations
export {
  unsafeCoerce,
  unwrap,
  ok,
  err,
  succeed,
  fail,
  m,
  fm,
  fromPromise,
  assertNever,
} from "./index.impl";
