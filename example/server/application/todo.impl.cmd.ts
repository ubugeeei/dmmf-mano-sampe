import type { Create, Complete, Reopen, Archive } from './todo.def'
import { eff } from '../../shared/index.impl'
import {
  TodoId,
  TodoTitle,
  TodoDescription,
  Priority,
  createTodo,
  completeTodo,
  reopenTodo,
  archiveTodo,
  toDTO,
  TodoEvent,
} from '../domain/todo.impl'

export type { CommandError, CreateInput, Create, Complete, Reopen, Archive } from './todo.def'

/*
 *
 * Commands
 *
 */

export const create: Create = repo => uow => (input) => {
  const title = TodoTitle.create(input.title)
  const desc = TodoDescription.create(input.description)
  const prio = Priority.create(input.priority)

  if (!title.ok || !desc.ok || !prio.ok) {
    const errs = [
      !title.ok && { field: 'title', message: title.error },
      !desc.ok && { field: 'description', message: desc.error },
      !prio.ok && { field: 'priority', message: prio.error },
    ].filter((e): e is { field: string, message: string } => !!e)
    return eff.fail(Err.validation(errs))
  }

  const todo = createTodo(TodoId.generate(), title.value, desc.value, prio.value)
  return eff.map(repo.save(todo), (t) => {
    uow.events.push(TodoEvent.created(t.id))
    return toDTO(t)
  })
}

export const complete: Complete = repo => uow => (todoId) => {
  const id = TodoId.parse(todoId)
  if (!id.ok) return eff.fail(Err.invalidId(id.error))

  return eff.flatMap(repo.findById(id.value), (t) => {
    if (!t) return eff.fail(Err.notFound())
    if (t._tag !== 'Active') return eff.fail(Err.invalidState('Active', t._tag))
    return eff.map(repo.save(completeTodo(t)), (s) => {
      uow.events.push(TodoEvent.completed(s.id))
      return toDTO(s)
    })
  })
}

export const reopen: Reopen = repo => uow => (todoId) => {
  const id = TodoId.parse(todoId)
  if (!id.ok) return eff.fail(Err.invalidId(id.error))

  return eff.flatMap(repo.findById(id.value), (t) => {
    if (!t) return eff.fail(Err.notFound())
    if (t._tag !== 'Completed') return eff.fail(Err.invalidState('Completed', t._tag))
    return eff.map(repo.save(reopenTodo(t)), (s) => {
      uow.events.push(TodoEvent.reopened(s.id))
      return toDTO(s)
    })
  })
}

export const archive: Archive = repo => uow => (todoId) => {
  const id = TodoId.parse(todoId)
  if (!id.ok) return eff.fail(Err.invalidId(id.error))

  return eff.flatMap(repo.findById(id.value), (t) => {
    if (!t) return eff.fail(Err.notFound())
    if (t._tag === 'Archived') return eff.fail(Err.invalidState('Active|Completed', t._tag))
    return eff.map(repo.save(archiveTodo(t)), (s) => {
      uow.events.push(TodoEvent.archived(s.id))
      return toDTO(s)
    })
  })
}

/*
 *
 * Error Constructors
 *
 */

const Err = {
  validation: (errors: { field: string, message: string }[]) => ({
    _tag: 'Validation' as const,
    errors,
  }),
  invalidId: (message: string) => ({
    _tag: 'InvalidId' as const,
    message,
  }),
  notFound: () => ({
    _tag: 'NotFound' as const,
  }),
  invalidState: (expected: string, actual: string) => ({
    _tag: 'InvalidState' as const,
    expected,
    actual,
  }),
}
