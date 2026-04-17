# GitHub sign-in (Supabase)

Slice uses [Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-github) for “Sign in with GitHub”. Client ID and secret live in the Supabase dashboard and [GitHub Developer Settings](https://github.com/settings/developers), not in app code.

## Why this setup

- OAuth runs through Supabase; the app never handles the GitHub client secret.
- After GitHub confirms the user, Supabase redirects to `/auth/callback` with a one-time `code`; the route exchanges it for a session (PKCE), matching [server-side auth](https://supabase.com/docs/guides/auth/server-side/nextjs) and the same flow as Google (`docs/google-oauth.md`).

## Steps (GitHub)

1. Open [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers) (or your org’s equivalent).
2. **Register a new application** (or **New OAuth App**).
3. **Application name**: your product name (shown on the consent screen).
4. **Homepage URL**: your app’s public origin (e.g. `https://yourdomain.com`, `http://localhost:3000` for local dev).
5. **Authorization callback URL**: the Supabase Auth callback from the dashboard (**Authentication → Providers → GitHub**), e.g. `https://<project-ref>.supabase.co/auth/v1/callback`.  
   **Do not** use `https://yourdomain.com/auth/callback` here—that URL belongs in Supabase’s **Redirect URLs** allow list, not in GitHub’s OAuth app callback field.
6. Leave **Enable Device Flow** unchecked unless you have a specific device-flow use case.
7. Save, then copy **Client ID** and generate a **Client secret**.

## Steps (Supabase)

1. **Authentication → Providers → GitHub**: enable, paste **Client ID** and **Client secret** from GitHub.
2. **Authentication → URL configuration** (same as for Google):
   - **Site URL**: production app URL.
   - **Redirect URLs**: every origin that may finish OAuth, e.g.  
     `http://localhost:3000/auth/callback`,  
     `https://yourdomain.com/auth/callback`,  
     and preview hosts if you use them (match what your hosting actually uses).

Misaligned callback URL on the GitHub app, missing redirect allow list entries in Supabase, or disabled provider are the usual causes of failed redirects.

## Local development

If you use the [Supabase CLI](https://supabase.com/docs/guides/cli) with local Auth, register GitHub’s callback as `http://127.0.0.1:54321/auth/v1/callback` (or the URL shown in your local dashboard) in the GitHub OAuth app, and point local env at that project. See Supabase [local development](https://supabase.com/docs/guides/local-development) for current ports and behavior.

## Security notes

- Keep using the **anon / publishable** key in the browser; never expose the **service role** key client-side.
- The app only redirects to internal paths after login (`safeNextPath`); do not pass full URLs in `next`.
