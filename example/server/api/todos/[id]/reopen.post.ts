import { container } from "../../../container";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const uow = container.createUoW();
  const r = await container.reopenTodo(id, uow).run();
  if (!r.ok)
    throw createError({
      statusCode: r.error.type === "NotFound" ? 404 : 400,
      message: r.error.message,
    });
  uow.commit();
  return r.value;
});
