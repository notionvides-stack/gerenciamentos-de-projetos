import { useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import { FolderKanban, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authErrorMessage, collectionAuth } from '@/lib/collection-client';

export function CollectionAuthGate({ children }: { children: (session: Session, signOut: () => Promise<void>) => ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = collectionAuth();
    let active = true;
    auth.getSession().then(({ data }) => { if (active) setSession(data.session); });
    const { data } = auth.onAuthStateChange((event, next) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') setSession(next);
      if (event === 'SIGNED_IN') void queryClient.invalidateQueries({ queryKey: ['external-collections'] });
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [queryClient]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    const { error: err } = await collectionAuth().signInWithPassword({ email: email.trim(), password });
    if (err) setError(authErrorMessage(err)); else setPassword('');
    setBusy(false);
  }
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.removeQueries({ queryKey: ['external-collections'] });
    await collectionAuth().signOut();
    setSession(null);
  }

  if (session === undefined) return <div role="status" className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground"><Loader2 className="size-5 animate-spin" /> Verificando sessão…</div>;
  if (session) return <>{children(session, signOut)}</>;
  return <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <form onSubmit={signIn} className="w-full max-w-sm rounded-lg border bg-card p-7 shadow-sm">
      <div className="mb-6 flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><FolderKanban className="size-5" /></span><div><h1 className="text-lg font-semibold">Entrar</h1><p className="text-xs text-muted-foreground">Acompanhamento de coleção</p></div></div>
      <fieldset disabled={busy} className="space-y-4">
        <label className="block text-xs font-medium" htmlFor="login-email">E-mail<Input id="login-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" /></label>
        <label className="block text-xs font-medium" htmlFor="login-password">Senha<Input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5" /></label>
      </fieldset>
      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <Button type="submit" className="mt-6 w-full" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <LogIn />}{busy ? 'Entrando…' : 'Entrar'}</Button>
      <p className="mt-4 text-xs text-muted-foreground">Não tem acesso? Peça ao administrador para criar sua conta.</p>
    </form>
  </div>;
}
