import { container } from "../../container";

export default defineEventHandler(async () => {
  const r = await container.getAllTodos(true).run();
  return r.ok ? r.value : [];
});
