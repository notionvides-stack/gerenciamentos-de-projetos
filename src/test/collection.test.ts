import { describe, expect, it } from 'vitest';
import { COLLECTION_TABLE, COLLECTION_URL, collectionPayload, emptyDraft, formatCollectionDate, matchesCollection, safePhotoUrl, type CollectionRow } from '@/lib/collection';

describe('External collection rules', () => {
  it('targets only the supplied external table', () => {
    expect(COLLECTION_URL).toBe('https://lruksyyffipsxkkjpglb.supabase.co');
    expect(COLLECTION_TABLE).toBe('Acompanhamento de coleção');
  });
  it('formats dates as dd/MM/yyyy without timezone shifts', () => {
    expect(formatCollectionDate('2026-10-21')).toBe('21/10/2026');
  });
  it('does not fabricate values for blank fields', () => {
    expect(Object.values(collectionPayload(emptyDraft())).every(value => value === null)).toBe(true);
  });
  it('preserves supplied fields when saving', () => {
    const payload = collectionPayload({ ...emptyDraft(), marca: ' Minha marca ', deadline: '2026-10-21' });
    expect(payload.marca).toBe('Minha marca');
    expect(payload.deadline).toBe('2026-10-21');
    expect(payload).not.toHaveProperty('id');
  });
  it('searches text and dates in Brazilian format', () => {
    const row = { ...emptyDraft(), id: 1, created_at: '', marca: 'Coleção', deadline: '2026-10-21' } satisfies CollectionRow;
    expect(matchesCollection(row, 'colecao')).toBe(true);
    expect(matchesCollection(row, '21/10/2026')).toBe(true);
    expect(matchesCollection(row, 'inexistente')).toBe(false);
  });
  it('rejects executable photo URLs', () => {
    expect(safePhotoUrl('javascript:alert(1)')).toBeUndefined();
    expect(safePhotoUrl('https://example.com/foto.jpg')).toBe('https://example.com/foto.jpg');
  });
});