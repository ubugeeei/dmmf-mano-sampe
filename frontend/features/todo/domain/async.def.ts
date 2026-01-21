/**
 * Async operation state representation
 *
 * State Transitions:
 *   Initial -[fetch]-> Loading
 *   Loading -[success]-> Success
 *   Loading -[error]-> Error
 *   Error -[retry]-> Loading
 *   Success -[refetch]-> Refreshing
 *   Refreshing -[success]-> Success
 *   Refreshing -[error]-> Error
 */

/*
 *
 * Async States
 *
 */

export type Initial = {
  _tag: "Initial";
};

export type Loading = {
  _tag: "Loading";
};

export type Success<T> = {
  _tag: "Success";
  data: T;
  fetchedAt: Date;
};

export type Refreshing<T> = {
  _tag: "Refreshing";
  data: T; // stale data while refreshing
  fetchedAt: Date;
};

export type Error<E> = {
  _tag: "Error";
  error: E;
};

export type Async<T, E = string> = Initial | Loading | Success<T> | Refreshing<T> | Error<E>;

/*
 *
 * Type Guards
 *
 */

export type AsyncGuards<T, E> = {
  isInitial: (state: Async<T, E>) => boolean;
  isLoading: (state: Async<T, E>) => boolean;
  isSuccess: (state: Async<T, E>) => boolean;
  isRefreshing: (state: Async<T, E>) => boolean;
  isError: (state: Async<T, E>) => boolean;
  hasData: (state: Async<T, E>) => boolean;
  isPending: (state: Async<T, E>) => boolean;
};

/*
 *
 * State Transitions
 *
 */

export type AsyncTransitions<T, E> = {
  load: (state: Initial | Error<E>) => Loading;
  refresh: (state: Success<T>) => Refreshing<T>;
  succeed: (state: Loading | Refreshing<T>, data: T) => Success<T>;
  fail: (state: Loading | Refreshing<T>, error: E) => Error<E>;
};

/*
 *
 * Utilities
 *
 */

export type AsyncOps = {
  initial: <T, E>() => Async<T, E>;
  loading: <T, E>() => Async<T, E>;
  success: <T, E>(data: T) => Async<T, E>;
  error: <T, E>(error: E) => Async<T, E>;
  map: <T, U, E>(state: Async<T, E>, f: (data: T) => U) => Async<U, E>;
  getOrElse: <T, E>(state: Async<T, E>, defaultValue: T) => T;
};
