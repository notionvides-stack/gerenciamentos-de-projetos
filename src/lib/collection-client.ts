import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { COLLECTION_URL, COLLECTION_TABLE, collectionColumns, collectionPayload, type CollectionDraft, type CollectionRow } from './collection';

// Separate client: never reuse the managed Cloud key/session for the external project.
let client: SupabaseClient | undefined;
// Public (publishable) key of the external collection project; safe to ship in the browser bundle.
const DEFAULT_COLLECTION_PUBLISHABLE_KEY = 'sb_publishable_HvY0eLzzSCajNz6gjfESNQ_PHV75Q07';
function collectionKey(): string {
  return (import.meta.env['VITE_COLLECTION_SUPABASE_PUBLISHABLE_KEY']?.trim() || DEFAULT_COLLECTION_PUBLISHABLE_KEY).trim();
}
export function hasCollectionConnection() {
  return Boolean(collectionKey());
}
function getClient() {
  const key = collectionKey();
  if (!key) throw new Error('Falta a chave pública (anon ou publishable) do projeto externo. Configure VITE_COLLECTION_SUPABASE_PUBLISHABLE_KEY para conectar esta tabela. A conexão atual pertence a outro projeto e não foi utilizada.');
  if (!client) client = createClient(COLLECTION_URL, key, {
    auth: { storageKey: 'collection-external-auth', persistSession: true, autoRefreshToken: true },
    global: { fetch: (input, init) => {
      const headers = new Headers(input instanceof Request ? input.headers : undefined);
      new Headers(init?.headers).forEach((v, k) => headers.set(k, v));
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
  return client;
}
function requestError(error: { message: string; code?: string }) {
  if (error.code === '42501' || /permission|row-level|jwt|api key/i.test(error.message)) {
    return new Error(`Acesso negado pelo projeto externo. Verifique a chave pública, a sessão de login externa e as permissões SELECT, INSERT e UPDATE da tabela. Detalhe: ${error.message}`);
  }
  return new Error(`Não foi possível acessar a tabela externa: ${error.message}`);
}
export async function readCollections(): Promise<CollectionRow[]> {
  const connection = getClient();
  const rows: CollectionRow[] = [];
  const select = ['id', 'created_at', ...collectionColumns.map(c => c.key)].join(',');
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await connection.from(COLLECTION_TABLE).select(select).order('created_at', { ascending: false }).order('id').range(offset, offset + 499);
    if (error) throw requestError(error);
    const batch = data as unknown as CollectionRow[];
    rows.push(...batch);
    if (batch.length < 500) return rows;
  }
}
export async function saveCollection(draft: CollectionDraft, id?: CollectionRow['id']): Promise<CollectionRow> {
  const table = getClient().from(COLLECTION_TABLE);
  const payload = collectionPayload(draft);
  const query = id === undefined ? table.insert(payload) : table.update(payload).eq('id', id);
  const { data, error } = await query.select().single();
  if (error) throw requestError(error);
  if (!data) throw new Error('Nenhum registro retornado. Verifique as permissões de leitura após salvar.');
  return data as CollectionRow;
}// Auth on the external collection project (same isolated client; never the Cloud session).
export function collectionAuth() {
  return getClient().auth;
}
export function authErrorMessage(error: { message: string; code?: string; status?: number }) {
  const m = error.message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'E-mail ainda não confirmado. Confirme pelo link enviado ou peça ao administrador.';
  if (m.includes('rate limit') || error.status === 429) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão com o servidor de coleções. Verifique sua internet.';
  return `Não foi possível entrar: ${error.message}`;
}
