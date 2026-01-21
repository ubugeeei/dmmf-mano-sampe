/**
 * Async state machine implementation
 */

import type {
  Async,
  Initial,
  Loading,
  Success,
  Refreshing,
  Error,
  AsyncGuards,
  AsyncOps,
} from "./async.def";

/*
 *
 * Type Guards
 *
 */

export const asyncGuards = <T, E>(): AsyncGuards<T, E> => ({
  isInitial: (state: Async<T, E>) => state._tag === "Initial",
  isLoading: (state: Async<T, E>) => state._tag === "Loading",
  isSuccess: (state: Async<T, E>) => state._tag === "Success",
  isRefreshing: (state: Async<T, E>) => state._tag === "Refreshing",
  isError: (state: Async<T, E>) => state._tag === "Error",
  hasData: (state: Async<T, E>) => state._tag === "Success" || state._tag === "Refreshing",
  isPending: (state: Async<T, E>) => state._tag === "Loading" || state._tag === "Refreshing",
});

/*
 *
 * State Factories & Operations
 *
 */

export const asyncOps: AsyncOps = {
  initial: <T, E>(): Async<T, E> => ({ _tag: "Initial" }),

  loading: <T, E>(): Async<T, E> => ({ _tag: "Loading" }),

  success: <T, E>(data: T): Async<T, E> => ({
    _tag: "Success",
    data,
    fetchedAt: new Date(),
  }),

  error: <T, E>(error: E): Async<T, E> => ({ _tag: "Error", error }),

  map: <T, U, E>(state: Async<T, E>, f: (data: T) => U): Async<U, E> => {
    switch (state._tag) {
      case "Success":
        return { ...state, data: f(state.data) };
      case "Refreshing":
        return { ...state, data: f(state.data) };
      default:
        return state as Async<U, E>;
    }
  },

  getOrElse: <T, E>(state: Async<T, E>, defaultValue: T): T => {
    switch (state._tag) {
      case "Success":
      case "Refreshing":
        return state.data;
      default:
        return defaultValue;
    }
  },
};

/*
 *
 * State Transitions
 *
 */

export const toLoading = <_T, E>(_state: Initial | Error<E>): Loading => ({
  _tag: "Loading",
});

export const toRefreshing = <T, _E>(state: Success<T>): Refreshing<T> => ({
  _tag: "Refreshing",
  data: state.data,
  fetchedAt: state.fetchedAt,
});

export const toSuccess = <T, _E>(_state: Loading | Refreshing<T>, data: T): Success<T> => ({
  _tag: "Success",
  data,
  fetchedAt: new Date(),
});

export const toError = <T, E>(_state: Loading | Refreshing<T>, error: E): Error<E> => ({
  _tag: "Error",
  error,
});
