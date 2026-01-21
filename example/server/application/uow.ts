import type { TodoEvent } from "../domain/todo";
import type { EventBus } from "../infrastructure/eventBus";

export type UoW = {
  events: TodoEvent[];
  commit: () => void;
};

export const createUoW = (bus: EventBus): UoW => {
  const events: TodoEvent[] = [];
  return {
    events,
    commit: () => {
      events.forEach((e) => bus.publish(e));
      events.length = 0;
    },
  };
};
