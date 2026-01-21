/**
 * GET /api/todos - Todo一覧取得
 */

import { storage } from '../../utils/storage';

export default defineEventHandler(() => {
  const todos = storage.getAll();
  // アーカイブ以外を返す、新しい順
  return todos
    .filter((t) => t.status !== 'Archived')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});
