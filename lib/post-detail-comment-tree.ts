import type { ReadCommentDto } from '@/types/comments';

export type CommentNode = ReadCommentDto & { children: CommentNode[] };

function uniqueCommentsById(flat: ReadCommentDto[]): ReadCommentDto[] {
  const map = new Map<number, ReadCommentDto>();
  flat.forEach((c) => map.set(c.id, c));
  return [...map.values()];
}

export function buildCommentTree(flat: ReadCommentDto[]): CommentNode[] {
  const unique = uniqueCommentsById(flat);
  const nodes = new Map<number, CommentNode>();
  unique.forEach((c) => nodes.set(c.id, { ...c, children: [] }));
  const roots: CommentNode[] = [];
  unique.forEach((c) => {
    const node = nodes.get(c.id)!;
    const pid = c.parent?.id ?? null;
    if (pid === null) {
      roots.push(node);
    } else {
      const parent = nodes.get(pid);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  });
  const sortRec = (list: CommentNode[]): CommentNode[] =>
    [...list]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((n) => ({ ...n, children: sortRec(n.children) }));
  return sortRec(roots);
}
