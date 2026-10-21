export const COLLECTION_URL = 'https://lruksyyffipsxkkjpglb.supabase.co';
export const COLLECTION_TABLE = 'Acompanhamento de coleção';

export const collectionColumns = [
  { key: 'marca', label: 'MARCA' },
  { key: 'designer', label: 'DESIGNER' },
  { key: 'licenciadora', label: 'LICENCIADORA' },
  { key: 'data_de_envio', label: 'DATA DE ENVIO', date: true },
  { key: 'referencia', label: 'REFERÊNCIA' },
  { key: 'produto', label: 'PRODUTO' },
  { key: 'foto', label: 'FOTO' },
  { key: 'status', label: 'STATUS' },
  { key: 'fornecedor', label: 'FORNECEDOR' },
  { key: 'primeiro_envio', label: 'PRIMEIRO ENVIO', date: true },
  { key: 'deadline', label: 'DEADLINE', date: true },
  { key: 'etiqueta_interna_de_produto_oficial', label: 'ETIQUETA INTERNA DE PRODUTO OFICIAL' },
  { key: 'primeira_piloto', label: 'PRIMEIRA PILOTO', date: true },
  { key: 'remark_1', label: 'REMARK 1' },
  { key: 'remark_2', label: 'REMARK 2' },
  { key: 'remark_3', label: 'REMARK 3' },
  { key: 'piloto_final', label: 'PILOTO FINAL', date: true },
  { key: 'status_final', label: 'STATUS FINAL' },
  { key: 'observacoes', label: 'OBSERVAÇÕES' },
] as const;

export type CollectionKey = typeof collectionColumns[number]['key'];
export type CollectionDraft = Record<CollectionKey, string>;
export type CollectionRow = Record<CollectionKey, string | null> & { id: string | number; created_at: string };
export const isDateColumn = (key: CollectionKey) => collectionColumns.some(c => c.key === key && 'date' in c);
export const emptyDraft = (): CollectionDraft => Object.fromEntries(collectionColumns.map(c => [c.key, ''])) as CollectionDraft;
export function formatCollectionDate(value: string | null): string {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}
export function safePhotoUrl(value: string | null): string | undefined {
  if (!value) return undefined;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
export function collectionPayload(draft: CollectionDraft) {
  return Object.fromEntries(collectionColumns.map(c => [c.key, draft[c.key].trim() || null])) as Record<CollectionKey, string | null>;
}
export function matchesCollection(row: CollectionRow, search: string) {
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const query = normalize(search.trim());
  return collectionColumns.some(c => normalize(('date' in c ? formatCollectionDate(row[c.key]) : row[c.key]) ?? '').includes(query));
}