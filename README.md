# Miso Nails Studio

Hand-painted press-on nail storefront with a full admin panel — built with **Next.js 16**, **Prisma**, and **SQLite**.

## Chalane ka tareeqa (Run)

```bash
npm install          # sirf pehli baar
npm run dev          # website chalao -> http://localhost:3000
```

Pehli baar database set karna ho to:

```bash
npx prisma migrate dev   # database + tables banao
npm run seed             # asli shuruati data daalo
```

## Logins

- **Admin panel:** http://localhost:3000/admin
  - Email: `admin@misonails.pk`
  - Password: `miso786`
- **Demo customer:** `areeba.k@gmail.com` / `password`

Admin panel se products, orders, customers, coupons aur homepage — sab edit/delete ho sakta hai.

## Structure

- `app/(store)/` — storefront (home, shop, product, cart/checkout, account, about, contact, login)
- `app/admin/` — admin dashboard
- `app/api/` — backend (orders, auth, upload, admin CRUD, coupons)
- `prisma/schema.prisma` — database schema · `prisma/seed.js` — starting data
- `components/` — UI · `lib/` — prisma client, auth session, helpers
- `public/assets/` — product & studio images

## Deploy karne se pehle (Production)

SQLite local development ke liye hai. Live karte waqt:

1. `prisma/schema.prisma` mein `provider = "postgresql"` karo
2. `.env` mein `DATABASE_URL` ko Postgres (Supabase / Neon — free) pe set karo
3. `SESSION_SECRET` ko lamba random string banao
4. Uploads (JazzCash screenshots) ke liye cloud storage use karo — Vercel pe local files persist nahi hote
5. Vercel pe deploy karo

## Payments

- **JazzCash:** customer screenshot upload karta hai → admin verify karta hai
- **Cash on Delivery:** Rs 100 handling
- **WhatsApp:** har jagah direct order button (0302 090 9786)
