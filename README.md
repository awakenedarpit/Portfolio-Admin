# Arpit Portfolio Admin

A private, admin-only dashboard extracted from the Arpit portfolio project. It uses Supabase Auth for protected access and Supabase tables/storage for portfolio project, gallery, and hackathon content.

## Local setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`. Create the first account from the login screen, then use the dashboard to edit authenticated content.

## Included capabilities

- Supabase email/password sign-in, account creation, and password reset
- Project content editing and saving
- Project image upload, replacement, ordering, thumbnail selection, and deletion
- Hackathon/showcase row editing and ordering
- Clear overview of database-backed versus source-backed portfolio areas

The repository is intentionally private because it contains the administration surface for the public portfolio.
