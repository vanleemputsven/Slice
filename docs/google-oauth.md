# Google sign-in (Supabase)

Slice uses [Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google) for “Sign in with Google”. Secrets stay in the Supabase dashboard and Google Cloud Console, not in app code.

## Why this setup

- OAuth runs through Supabase; the app never handles Google client secrets.
- After Google confirms the user, Supabase redirects to `/auth/callback` with a one-time `code`; the route exchanges it for a session (PKCE), matching [server-side auth](https://supabase.com/docs/guides/auth/server-side/nextjs).

## Steps (Google Cloud)

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project.
2. Configure the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) (app name, support email, scopes). For production, add privacy policy and terms URLs.
3. Under **Data Access (Scopes)**, ensure at least: `openid`, `email`, `profile` (Supabase [documents](https://supabase.com/docs/guides/auth/social-login/auth-google) `userinfo.email` and `userinfo.profile`).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
5. **Authorized JavaScript origins**: your real site origins only (e.g. `https://yourdomain.com`, `http://localhost:3000` for local dev). Base URL only, no path.
6. **Authorized redirect URIs**: the Supabase callback URL from the Supabase dashboard (Authentication → Providers → Google), e.g. `https://<project-ref>.supabase.co/auth/v1/callback`.  
   **Do not** put `https://yourdomain.com/auth/callback` here—that is for Supabase’s redirect allow list, not Google’s.

## Steps (Supabase)

1. **Authentication → Providers → Google**: enable, paste **Client ID** and **Client Secret** from Google.
2. **Authentication → URL configuration**:
   - **Site URL**: production app URL (e.g. `https://yourdomain.com`).
   - **Redirect URLs**: add every URL that may complete OAuth, e.g.  
     `http://localhost:3000/auth/callback`,  
     `https://yourdomain.com/auth/callback`,  
     and preview hosts if you use them (e.g. `https://*.vercel.app/auth/callback` if your Supabase project allows wildcards—check current dashboard behavior).

Mismatch secrets, redirect allow list, or Google redirect URI are the usual causes of “redirect_uri_mismatch” or silent failures.

## Security notes

- Keep using the **anon** key in the browser; never expose the **service role** key client-side.
- The app only redirects to internal paths after login (`safeNextPath`); do not pass full URLs in `next`.
