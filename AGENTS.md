<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Collection tracking uses a separate browser client configured by `VITE_COLLECTION_SUPABASE_PUBLISHABLE_KEY`; never reuse the managed Cloud client or session because the collection belongs to a different external project.
- Collection field definitions and date/payload/search logic live in a browser-safe shared module, keeping the form and table aligned with the existing schema.
