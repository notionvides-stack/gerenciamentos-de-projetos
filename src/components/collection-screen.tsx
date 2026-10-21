import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowUpRight, Check, ChevronRight, FolderKanban, ImageIcon, Layers, Loader2, LogOut, Menu, Plus, RefreshCw, Search, Table2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { collectionColumns, emptyDraft, formatCollectionDate, isDateColumn, matchesCollection, safePhotoUrl, type CollectionDraft, type CollectionRow } from '@/lib/collection';
import { CollectionAuthGate } from '@/components/collection-auth-gate';
import type { Session } from '@supabase/supabase-js';
import { hasCollectionConnection, readCollections, saveCollection } from '@/lib/collection-client';

function Photo({ value }: { value: string | null }) {
  const [failed, setFailed] = useState(false);
  const url = safePhotoUrl(value);
  if (!url) return <span className="text-muted-foreground">{value || '—'}</span>;
  return <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary" aria-label="Abrir foto">{failed ? <><ImageIcon className="size-4" /> URL <ArrowUpRight className="size-3" /></> : <img src={url} alt="Foto do produto" loading="lazy" className="h-10 w-12 rounded border object-contain bg-background" onError={() => setFailed(true)} />}</a>;
}

export function CollectionScreen() {
  return <CollectionAuthGate>{(session, signOut) => <CollectionContent session={session} signOut={signOut} />}</CollectionAuthGate>;
}

function CollectionContent({ session, signOut }: { session: Session; signOut: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['external-collections'], queryFn: readCollections, retry: false });
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionRow>();
  const [draft, setDraft] = useState<CollectionDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const rows = query.data ?? [];
  const filtered = rows.filter(row => matchesCollection(row, search));
  function startEdit(row?: CollectionRow) {
    setEditing(row);
    setDraft(row ? Object.fromEntries(collectionColumns.map(c => [c.key, row[c.key] ?? ''])) as CollectionDraft : emptyDraft());
    setSaveError(''); setOpen(true); setNotice('');
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setSaveError('');
    try {
      const saved = await saveCollection(draft, editing?.id);
      queryClient.setQueryData<CollectionRow[]>(['external-collections'], current => editing ? (current ?? []).map(r => r.id === saved.id ? saved : r) : [saved, ...(current ?? [])]);
      setOpen(false); setNotice(editing ? 'Coleção atualizada.' : 'Coleção adicionada.');
      await queryClient.invalidateQueries({ queryKey: ['external-collections'] });
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.'); }
    finally { setSaving(false); }
  }
  return <div className="collection-app flex min-h-screen bg-background">
    <aside className={`collection-sidebar ${mobileNav ? 'is-open' : ''}`}>
      <a href="/" className="flex items-center gap-3 px-5 py-7"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FolderKanban className="size-5" /></span><span className="text-sm font-semibold leading-5">Gerenciador<br /><span className="font-normal text-muted-foreground">de projetos</span></span></a>
      <div className="mx-4 mb-6 border-y py-4 text-xs font-medium text-muted-foreground">ÁREA DE TRABALHO</div>
      <nav aria-label="Navegação principal" className="px-3"><Button variant="ghost" className="h-auto w-full justify-start whitespace-normal bg-accent px-3 py-3 text-left text-primary" onClick={() => setMobileNav(false)}><Layers className="size-4 shrink-0" /><span>Acompanhamento<br />de coleção</span></Button></nav>
      <div className="mt-auto flex items-center gap-2 border-t p-5 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-primary" /> Gerenciador de Projeto</div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="flex h-16 items-center gap-3 border-b px-5 md:px-8"><Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir navegação" onClick={() => setMobileNav(!mobileNav)}><Menu /></Button><span className="text-sm text-muted-foreground">Área de trabalho</span><ChevronRight className="size-3 text-muted-foreground" /><span className="text-sm font-medium">Coleção</span><span className="ml-auto hidden text-xs text-muted-foreground sm:inline">{session.user.email}</span><Button variant="outline" size="sm" onClick={() => void signOut()}><LogOut /> Sair</Button></header>
      <main className="px-5 py-7 md:px-8 md:py-9">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Layers className="size-4" /> COLEÇÕES</div><h1 className="text-2xl font-semibold md:text-3xl">Acompanhamento de coleção</h1></div><Button onClick={() => startEdit()}><Plus /> Adicionar coleção</Button></div>
        <div className="mb-5 flex items-center gap-2 border-b"><span className="inline-flex items-center gap-2 border-b-2 border-primary px-1 pb-3 text-sm font-medium text-primary"><Table2 className="size-4" /> Tabela de coleção</span></div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="relative w-full max-w-sm"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Pesquisar coleções" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar na coleção…" className="h-10 pl-9 pr-9" />{search && <Button variant="ghost" size="icon" aria-label="Limpar pesquisa" className="absolute right-0 top-0 h-10" onClick={() => setSearch('')}><X /></Button>}</div><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{query.isPending || query.isError ? '— registros' : `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`}</span><Button variant="outline" size="icon" aria-label="Atualizar coleções" title="Atualizar coleções" disabled={query.isFetching} onClick={() => { setNotice(''); void query.refetch(); }}><RefreshCw className={query.isFetching ? 'animate-spin' : ''} /></Button></div></div>
        {notice && <div role="status" className="mb-4 flex items-center gap-2 text-sm text-primary"><Check className="size-4" />{notice}</div>}
        {query.isError && <div role="alert" className="mb-4 flex gap-3 rounded-md border border-destructive/25 bg-destructive/5 p-4"><AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" /><div><p className="text-sm font-semibold">{hasCollectionConnection() ? 'Não foi possível carregar a coleção' : 'Conexão externa pendente'}</p><p className="mt-1 max-w-3xl break-words text-sm text-muted-foreground">{query.error.message}</p></div></div>}
        <div className="collection-grid overflow-auto rounded-md border" tabIndex={0} aria-label="Tabela de acompanhamento de coleção rolável">
          <table className="w-full table-fixed border-collapse text-xs"><colgroup>{collectionColumns.map(c => <col key={c.key} className={c.key === 'foto' ? 'collection-col-photo' : c.key === 'etiqueta_interna_de_produto_oficial' || c.key === 'observacoes' ? 'collection-col-wide' : 'collection-col'} />)}</colgroup><thead><tr>{collectionColumns.map(c => <th key={c.key} scope="col" className="collection-heading border-r border-primary-foreground/20 px-3 py-4 text-left font-semibold leading-4">{c.label}</th>)}</tr></thead><tbody>
            {query.isPending ? <tr><td colSpan={19} className="h-64"><div role="status" className="collection-state flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="size-5 animate-spin" /> Carregando coleção…</div></td></tr> : filtered.length ? filtered.map(row => <tr key={row.id} className="group border-b last:border-0 hover:bg-accent/40">{collectionColumns.map(c => <td key={c.key} className="h-14 border-r px-3 py-2 align-middle last:border-r-0">{c.key === 'marca' ? <Button variant="link" className="h-auto max-w-full justify-start whitespace-normal p-0 text-left text-xs font-medium" onClick={() => startEdit(row)} title="Editar coleção">{row.marca || 'Editar registro'}</Button> : c.key === 'foto' ? <Photo value={row.foto} /> : <span className={`block break-words ${row[c.key] ? '' : 'text-muted-foreground'}`}>{isDateColumn(c.key) ? formatCollectionDate(row[c.key]) : row[c.key] || '—'}</span>}</td>)}</tr>) : <tr><td colSpan={19} className="h-72 align-top"><div className="collection-state flex h-72 flex-col items-center justify-center gap-3 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><Layers className="size-6" /></span><p className="text-sm font-semibold">{query.isError ? 'Coleção indisponível' : search ? 'Nenhum resultado encontrado' : 'Nenhuma coleção cadastrada'}</p><p className="text-xs text-muted-foreground">{query.isError ? 'Os registros serão exibidos após a conexão ser autorizada.' : search ? 'Não há registros correspondentes à pesquisa.' : 'Seus registros aparecerão aqui.'}</p>{!query.isError && !search && <Button variant="outline" size="sm" onClick={() => startEdit()}><Plus /> Adicionar coleção</Button>}</div></td></tr>}
          </tbody></table>
        </div>
        <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{query.isError ? 'Nenhum dado carregado' : query.isPending ? 'Consultando registros' : `${filtered.length} de ${rows.length} registros`}</span><span>19 colunas</span></div>
      </main>
    </div>
    <Dialog open={open} onOpenChange={v => { if (!saving) setOpen(v); }}><DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Editar coleção' : 'Adicionar coleção'}</DialogTitle><DialogDescription>{editing ? 'Dados do registro selecionado.' : 'Novo registro de acompanhamento de coleção.'}</DialogDescription></DialogHeader><form onSubmit={submit}><fieldset disabled={saving} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{collectionColumns.map(c => <label key={c.key} className={`text-xs font-medium ${c.key === 'observacoes' ? 'sm:col-span-2 lg:col-span-3' : ''}`} htmlFor={`field-${c.key}`}>{c.label}<div className="mt-1.5">{c.key === 'observacoes' ? <Textarea id={`field-${c.key}`} value={draft[c.key]} onChange={e => setDraft(d => ({ ...d, [c.key]: e.target.value }))} /> : <Input id={`field-${c.key}`} type={isDateColumn(c.key) ? 'date' : c.key === 'foto' ? 'url' : 'text'} value={draft[c.key]} placeholder={c.key === 'foto' ? 'https://…' : undefined} onChange={e => setDraft(d => ({ ...d, [c.key]: e.target.value }))} />}</div></label>)}</fieldset>{!hasCollectionConnection() && <p role="alert" className="mt-5 text-sm text-destructive">O cadastro só poderá ser salvo após configurar a chave pública do projeto externo.</p>}{saveError && <p role="alert" className="mt-5 break-words text-sm text-destructive">{saveError}</p>}<div className="mt-6 flex justify-end gap-2 border-t pt-4"><Button variant="outline" type="button" disabled={saving} onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving || !hasCollectionConnection()}>{saving ? <Loader2 className="animate-spin" /> : <Check />}{saving ? 'Salvando…' : 'Salvar coleção'}</Button></div></form></DialogContent></Dialog>
  </div>;
}