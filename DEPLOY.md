# Deploying Myso Nails Studio

The app is now on **PostgreSQL** and ready for Vercel (app) + a hosted Postgres (Neon / Railway / Supabase).

---

## 1. Create a PostgreSQL database (pick one)

**Neon** (recommended — free, serverless, works great with Vercel)
1. Go to https://neon.tech → sign up → **Create project**.
2. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`).

**Railway** (alternative)
1. https://railway.app → **New Project → Provision PostgreSQL**.
2. Open the Postgres service → **Connect** tab → copy the `DATABASE_URL`.

**Supabase** (alternative)
1. https://supabase.com → **New project**.
2. Settings → Database → **Connection string (URI)**. Use the one on port `5432`.

---

## 2. Point the app at the database + load data (run locally once)

Edit `.env` and set `DATABASE_URL` to the string from step 1. Then:

```bash
npm install
npm run db:push     # creates all tables in your new Postgres DB
npm run seed        # loads categories, products, admin login, demo data
npm run dev         # test locally against Postgres
```

- Admin login (change the password after first sign-in): **admin@mysonails.pk / miso786**
- Everything (products, prices, homepage text, WhatsApp templates) is editable from `/admin`.

---

## 3. File uploads (payment screenshots + product images)

Vercel's filesystem is read-only, so uploads must go to **Vercel Blob** (the app already supports this automatically):

1. In your Vercel project → **Storage → Create → Blob**.
2. Vercel adds a `BLOB_READ_WRITE_TOKEN` env var automatically.
3. That's it — when the token is present, uploads go to Blob; locally (no token) they save to disk.

> Without this, admin image uploads and customer payment screenshots will fail on Vercel.

---

## 4. Deploy the app to Vercel

1. Push this project to a GitHub repo.
2. https://vercel.com → **Add New → Project** → import the repo.
3. Add **Environment Variables** (Settings → Environment Variables):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | your Postgres connection string |
   | `SESSION_SECRET` | a long random string (e.g. run `openssl rand -hex 32`) |
   | `NEXT_PUBLIC_WHATSAPP` | `923020909786` |
   | `ADMIN_WHATSAPP` | `923020909786` |
   | `RESEND_API_KEY` | your Resend key (optional — for confirmation emails) |
   | `EMAIL_FROM` | `orders@mysonails.pk` |
   | `CALLMEBOT_APIKEY` | your CallMeBot key (optional — admin WhatsApp alerts) |
   | `BLOB_READ_WRITE_TOKEN` | auto-added when you create the Blob store (step 3) |

4. Click **Deploy**. Vercel runs `prisma generate && next build` automatically.

> The database schema is pushed in step 2 (`npm run db:push`) against the **same** `DATABASE_URL` you give Vercel — so the tables already exist when the site goes live. Re-run `npm run db:push` locally whenever you change `schema.prisma`, then redeploy.

---

## 5. After deploy — checklist

- [ ] Visit the site → sign in at `/admin` → **change the admin password**.
- [ ] Upload a real product image in admin → confirm it appears (verifies Blob works).
- [ ] Place a test order with a screenshot → confirm it shows in admin (verifies uploads + DB).
- [ ] Replace `public/assets/jazzcash-qr.png` if the QR ever changes.
- [ ] Set your real Instagram post links in **Admin → Homepage → Instagram feed**.
- [ ] (Optional) Point a custom domain at Vercel and update `EMAIL_FROM` / any `mysonails.pk` links.

---

## Notes on Netlify

Netlify also works for Next.js, but **Vercel is recommended** here because Blob storage and Prisma/serverless integration are first-class. If you use Netlify, you'll need a different file-storage provider (e.g. Cloudinary or AWS S3) instead of Vercel Blob — tell me and I'll wire it up.

## Connection pooling (only if you see "too many connections")

Serverless functions can open many DB connections. If you hit connection limits:
- **Neon**: use the **pooled** connection string (has `-pooler` in the host) for `DATABASE_URL`.
- **Supabase**: use the connection string on port **6543** (Transaction pooler) for `DATABASE_URL`.
