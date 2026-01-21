import type { TodoEvent } from "../domain/todo";

export type EventBus = {
  publish: (e: TodoEvent) => void;
  subscribe: (h: (e: TodoEvent) => void) => () => void;
};

export const createEventBus = (): EventBus => {
  const handlers = new Set<(e: TodoEvent) => void>();
  return {
    publish: (e) => handlers.forEach((h) => h(e)),
    subscribe: (h) => {
      handlers.add(h);
      return () => handlers.delete(h);
    },
  };
};
