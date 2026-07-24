# Kingsxchange auth backend

A minimal, working signup/login backend for Kingsxchange. Handles account
creation, password hashing, sessions, and a `/me` check — nothing else yet
(no wallets, no trading, no real money).

## What it uses

- **Express** — the web server
- **bcryptjs** — password hashing (never stores plain-text passwords)
- **jsonwebtoken** — signs a session token stored in an httpOnly cookie
- **A JSON file (`data/users.json`)** as the database — this is fine for
  local development and testing, but **not for production**. Once you're
  ready to go live, swap `db.js` for a real database (Postgres via Railway
  or Supabase are both easy free-tier starting points) — the rest of the
  code doesn't need to change, just the four functions in `db.js`.

## Running it locally

```bash
npm install
cp .env.example .env
node server.js
```

The server starts on `http://localhost:4000`. Open `login.html` in a local
dev server (not by double-clicking the file — cookies need a real origin)
and it will talk to this backend automatically.

**Easiest way to serve the frontend locally:** if you have Python installed,
run this from the folder containing your HTML files:

```bash
python3 -m http.server 5500
```

Then visit `http://localhost:5500/kingsxchange.html`. This matches the
`FRONTEND_ORIGIN` already set in `.env.example`.

## Endpoints

| Method | Route          | Body                                              | Notes                          |
|--------|----------------|----------------------------------------------------|---------------------------------|
| POST   | `/api/signup`  | `{ fullName, email, phone, password }`             | Creates a user, logs them in   |
| POST   | `/api/login`   | `{ email, password }`                              | Verifies password, logs in     |
| POST   | `/api/logout`  | —                                                  | Clears the session cookie      |
| GET    | `/api/me`      | —                                                  | Returns the logged-in user     |
| GET    | `/api/health`  | —                                                  | Health check                   |

## Before this touches real users or money

- Move off the JSON file to a real database
- Set a strong, random `JWT_SECRET` in production (not the example value)
- Set `FRONTEND_ORIGIN` to your real domain, and `NODE_ENV=production`
- Add rate limiting on `/api/login` and `/api/signup` to slow down brute-force attempts
- Add email verification before an account can trade
- This backend does not touch crypto or NGN funds — that requires a
  licensed payment processor for NGN and either a custodial wallet
  provider or your own secured wallet infrastructure for crypto, plus
  regulatory review for operating as a VASP in Nigeria
