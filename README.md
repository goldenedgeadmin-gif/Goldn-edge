# Golden Edge — E-commerce Website

Fast delivery, easy shopping: cars, mobile phones, home & kitchen
appliances, bikes, laptops, and tablets — with instant sign-in, a Paystack
checkout in Naira, order tracking, and a hidden admin dashboard with an
editable shipping fee.

## What's inside

```
golden-edge/
├── public/                   Everything shoppers see
│   ├── index.html            Home page (splash → header → categories → featured goods)
│   ├── products.html         Full catalogue, category rail, search
│   ├── product.html          Product detail page
│   ├── cart.html             Shopping cart (with Remove buttons)
│   ├── checkout.html         Country → Email → State → Local Government → Address → Phone/WhatsApp, then Paystack
│   ├── order-success.html    Post-payment page
│   ├── orders.html           "My orders"
│   ├── notifications.html    Announcements sent by the admin
│   ├── account.html          My account
│   ├── about.html            About — floating WhatsApp button lives here
│   ├── help.html             Help & FAQ — floating WhatsApp button lives here too
│   ├── login.html            Sign-in page (Google only — see "How sign-in works")
│   ├── css/style.css         All styling
│   ├── assets/               Logo + splash image
│   ├── js/config.js          Paystack fallback key, admin username/password, WhatsApp number
│   ├── js/countries.js       Countries, calling codes, states, Nigerian LGAs
│   ├── js/store.js           Data layer (products, orders, cart, settings)
│   ├── js/auth.js            Google sign-in
│   ├── js/main.js            Shared header, footer, toast, splash screen
│   └── README.md
└── server/                   Not seen by shoppers
    └── admin.html            The whole admin dashboard — markup, styling and
                               logic in one self-contained file, not linked
                               from anywhere in the shop
```

Serve the **top-level `golden-edge` folder** (e.g. `npx serve golden-edge`)
so both folders share one origin — the admin reads and writes the same
data the shop uses. Shop: `/public/index.html`. Admin: `/server/admin.html`
(username **Golden Edge**).

## How sign-in works

**Browsing never requires an account.** The home page, shop, and product
pages are all open to guests — no forced sign-in. A shopper only signs
in when they reach a page that needs an account: the **cart**,
**checkout**, **My Orders**, **Notifications**, and the **Account** page
all send a guest to `login.html` first. Adding items to the cart from a
product card still works while browsing as a guest — opening the cart
page itself is what requires signing in.

`login.html` signs shoppers in with **Google only** — there's no manual
email fallback. Two things happen together when the page loads:

- **Google's official "Sign in with Google" button** (the black pill
  button, rendered by Google's own widget — `google.accounts.id.renderButton()`)
  is always shown, so there's always a visible, tappable way to sign in.
- At the same time, **Google's automatic silent sign-in (One Tap)** runs
  in the background and can sign a returning shopper straight back in
  on its own, using whichever Google account their browser already
  remembers — no tap needed at all
  (`GOLDENEDGE_CONFIG.GOOGLE_CLIENT_ID` in `js/config.js` — see setup
  steps below). If One Tap can't run — a browser with third-party
  sign-in blocked, an incognito window, or an in-app browser like
  WhatsApp's that can't run Google Sign-In at all are common reasons —
  a short explanation appears, and the button (always visible either
  way) is how the shopper signs in instead.

Both paths go through the same place, `Auth.startGoogleSignIn()` in
`js/auth.js`, with Google's newer FedCM sign-in flow turned on
(`use_fedcm_for_button` / `use_fedcm_for_prompt`). That's specifically
to avoid a known issue — not unique to this site — where, on some
mobile browsers, tapping the button and picking an account leads to a
blank `accounts.google.com` page that never returns to the site. It's
caused by Google's older sign-in flow and browsers that restrict
third-party cookies; FedCM is Google's own fix for it, supported on
Chrome and other Chromium-based browsers (Edge, Brave, newer Samsung
Internet). If a shopper still hits that blank page, it means their
specific browser doesn't support FedCM yet — going back and trying
again in Chrome is the reliable fix on their end.

There is no onboarding step: the site signs the shopper in right away
using the **real name and profile picture from their Google account**,
greets them by that name (e.g. "Hi, Ada" on the Account page, and their
name is pre-filled at checkout), and sends them straight to the page
they wanted. Country and date of birth are optional — checkout asks
for the delivery country itself. Anything they later change under
Account → Edit profile is remembered for that email address (in
`js/store.js`) across sign-outs. Because every session is keyed by the
real, Google-verified email address, two different Google accounts
never share a profile.

### Editing your profile later

On the **Account** page, **Edit profile** lets a shopper change their
photo and full name, and optionally add a date of birth (if given, it
must work out to **15 years or older**) and country. This updates both
the active session and the saved profile for that Gmail address, so the
change sticks across sign-outs and sign-ins.

When you're ready to point this at a real backend, `Auth.handleGoogleCredential`
and `Auth.completeProfile` (in `js/auth.js`) are the two functions to
swap out; the rest of the site only ever reads `Auth.currentUser()`.

## The Admin dashboard never goes online — it only runs on your computer

The admin dashboard is a single self-contained file,
`server/admin.html` — its markup, styling and logic (what used to be a
separate `admin.js`) are all in that one file now, so `server/` holds
nothing else. It's deliberately kept in its own `server/` folder,
separate from everything in `public/`. **Only `public/` gets uploaded
to your live host — `server/` never does.** That way the admin
dashboard, and its password, simply aren't reachable from the internet
at all; the only way to open it is on your own computer.

Because `server/admin.html` and the shopfront in `public/` are both
wired to the same Neon database (see "Connecting a real database
(Neon)" below), this still works exactly like a normal admin panel —
changes you make locally show up on the live site within moments,
because both sides are just reading and writing the same Neon tables.
Nothing about your live site needs to know the admin dashboard exists.

**To run it:**
1. Keep the whole `golden-edge` folder (both `public/` and `server/`)
   on your computer — don't delete `server/` after uploading `public/`.
2. Make sure `NEON_DATA_API_URL` in `public/js/config.js` points at
   your real project (the admin dashboard loads that same file, so one
   URL powers both sides).
3. Serve the folder locally and open the admin page over `http://`,
   not by double-clicking the file:
   ```
   npx serve golden-edge
   ```
   then visit `http://localhost:3000/server/admin.html` (serving it,
   rather than opening the file directly, avoids browser quirks with
   `fetch()` calls to Neon from a `file://` page).
4. Sign in with the username/password below, same as always:

```js
// in js/config.js
ADMIN_USERNAME: "Golden Edge",
ADMIN_PASSWORD: "1gete112",
```

Change these to whatever you like. The unlock lasts for the current
browser tab/session; a new tab or a closed browser asks again.

⚠️ **Security note:** this check runs in the browser's JavaScript, same
as before — it keeps casual visitors out, but the real protection here
is that the admin page is never uploaded anywhere in the first place.

## Payments are in Naira

Every price, the cart, the checkout total, and the actual Paystack charge
are all in Nigerian Naira (₦ / NGN). This is set in `js/config.js`:

```js
CURRENCY_CODE: "NGN",
CURRENCY_SYMBOL: "₦",
```

## Required setup before going live

Open **`js/config.js`** and fill in two things:

### a) Google Sign-In (`GOOGLE_CLIENT_ID`)
✅ Already filled in with your Client ID from Google Cloud Console.
Only the **Client ID** is used — it's meant to be public and is safe to
ship in this file. The **Client Secret** from that same download is
never used anywhere in this site (this is a front-end-only, no-backend
build) and isn't stored here — keep it somewhere private, it isn't
needed for this to work.

One thing to double check on your end: in [Google Cloud
Console](https://console.cloud.google.com/) → **APIs & Services →
Credentials** → your OAuth client → **Authorized JavaScript origins**,
make sure the domain you're hosting `public/` on is listed (e.g.
`https://www.goldenedge.com`), plus `http://localhost:3000` (or
whichever port) while testing locally. This is a different setting
from "Authorized redirect URIs" — Google's Sign-In button and One Tap
only need the origins list.

The site shows Google's own official **"Sign in with Google"** button,
and also tries Google's automatic **One Tap** sign-in in the
background for returning shoppers — see "How sign-in works" above.

Google Sign-In needs `http://` or `https://` to work, not `file://` — see
"Running it locally" below.

### b) Paystack (`PAYSTACK_PUBLIC_KEY`)
There are two ways to set the Paystack public key checkout uses — a key
saved in the admin dashboard always wins over the one in `js/config.js`:

- **Admin → Payment tab** (no code editing, changeable any time): open
  `admin.html`, sign in, go to the **Payment** tab, paste the key, and
  save. This is stored in the browser's local storage alongside your
  products and orders.
- **`js/config.js`** (a fixed fallback, used only while the admin field
  above is empty):
  1. Create an account at [paystack.com](https://paystack.com) and complete verification.
  2. **Settings → API Keys & Webhooks** → copy your **Public Key**.
  3. Use the `pk_test_...` key while testing, and switch to your `pk_live_...` key when ready to accept real payments.
  4. Paste it into `PAYSTACK_PUBLIC_KEY` in `js/config.js`.

Until one of these is set, the checkout page shows a friendly reminder
instead of opening Paystack.

## The look — matched to your logo

The whole site now follows a marketplace-style template: a dark utility
bar, a sticky header with a search box, a scrollable category rail, a
flash-deals banner, a coupon strip, and a grid of white product cards —
all recolored into Golden Edge's navy-and-gold palette.

The page background color is sampled directly from your logo's cream
background and used as the header and page background site-wide, so the
logo blends into the page instead of sitting in its own box next to a
different color. Product cards, panels, and tables stay white on top of
that cream canvas for readability — the same layered look the template is
built around.

The header is now two rows: the top row has the logo and the cart/account
icons, and the search box sits alone on its own row underneath, full
width — so it's easy to find and doesn't compete for space with anything
else.

The splash screen uses your "Fast delivery, easy shopping" graphic and now
appears every time any page loads — not just the home page — so navigating
around the site always shows that same brief loading moment before the
page's content appears.

A white, rounded bottom navigation bar now sits fixed at the bottom of
every shopper-facing page (it's hidden on the admin dashboard, which has
its own tab navigation), with four tabs: **Home**, **Category**, **Cart**
(with the live item count), and **Account** — the account tab shows the
same profile picture/initial avatar as the header, and links to
`account.html`.

## How the data layer works

Product, order, and shipping-fee data lives in the visitor's browser
(`localStorage`) via `js/store.js`, so the site works immediately with
zero setup — and it can *also* be connected to a real shared Postgres
database on [Neon](https://neon.tech), which is what the next section
walks through.

- ✅ Everything works the moment you open `index.html` (or host the
  folder), with or without Neon connected.
- ✅ Every page still only ever talks to `DB` (in `js/store.js`) —
  `DB.getProducts()`, `DB.createOrder()`, etc. — exactly as before.
  Nothing about how a page calls `DB` changed.
- With Neon connected (see below): the browser's local copy is
  refreshed from Neon in the background every time a page loads, and
  every write (admin adds/edits/deletes a product, changes shipping
  settings, or a shopper completes checkout) is pushed to Neon right
  after it's saved locally. This means every visitor sees the same
  catalogue, and every real order lands in one shared database instead
  of staying stuck on one browser.
- Without Neon connected (the placeholder URL left in `js/config.js`):
  behaves exactly like before — everything stays local to that one
  browser, and an admin change made on one computer won't appear on
  another.

Paystack payments themselves are real either way: the Inline JS popup
handles the actual charge. Final payment *verification* should also
happen on a server in production — Paystack recommends confirming the
transaction with your secret key on a backend before treating an order
as paid for good.

## Connecting a real database (Neon)

This section is only needed if you want every visitor to share one
catalogue and one set of orders. Skip it entirely and the site keeps
working exactly as it does today (see above).

### 1. Run the setup SQL

Open your Neon project → **SQL Editor**, paste in the entire block
below, and run it. It creates every table the site needs, turns on Row
Level Security with policies that let the site's Data API read and
write them, and loads the 25 starter products already built into the
site so the catalogue isn't empty on day one.

```sql
-- ============================================================
-- GOLDEN EDGE — DATABASE SCHEMA + DATA API ACCESS (Neon / Postgres)
-- Paste this whole block into Neon's SQL Editor and run it once.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Users (shopper profiles, keyed by email) ----------
CREATE TABLE users (
  email            TEXT PRIMARY KEY,
  full_name        TEXT NOT NULL,
  picture_url      TEXT,
  dob              DATE,
  country          TEXT,
  country_code     TEXT,
  dial_code        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Products ----------
CREATE TABLE products (
  id            TEXT PRIMARY KEY,
  category      TEXT NOT NULL CHECK (category IN ('Phone','Phone Accessories','Small Gadgets','Fashion Accessories','Wears')),
  name          TEXT NOT NULL,
  price         NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image         TEXT NOT NULL,
  images        TEXT[],
  colors        JSONB,
  badge         TEXT,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON products(category);

-- ---------- Orders ----------
CREATE TABLE orders (
  id                 TEXT PRIMARY KEY,
  customer_email     TEXT REFERENCES users(email) ON DELETE SET NULL,
  customer_name      TEXT NOT NULL,
  phone              TEXT NOT NULL,
  whatsapp           TEXT,
  address            TEXT NOT NULL,
  city               TEXT,
  state              TEXT,
  country            TEXT,
  subtotal           NUMERIC(12,2) NOT NULL,
  shipping_fee       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total              NUMERIC(12,2) NOT NULL,
  status             TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','processing','shipped','delivered','cancelled')),
  paystack_ref       TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ---------- Order line items ----------
CREATE TABLE order_items (
  id            BIGSERIAL PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  price         NUMERIC(12,2) NOT NULL,
  qty           INTEGER NOT NULL CHECK (qty > 0),
  color         TEXT
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ---------- Cart ----------
CREATE TABLE cart_items (
  user_email    TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color         TEXT NOT NULL DEFAULT '',
  qty           INTEGER NOT NULL CHECK (qty > 0),
  selected      BOOLEAN NOT NULL DEFAULT true,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_email, product_id, color)
);

-- ---------- Notifications ----------
CREATE TABLE notifications (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  target_email   TEXT REFERENCES users(email) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_target_email ON notifications(target_email);

CREATE TABLE notification_reads (
  user_email        TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  notification_id   TEXT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  read_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_email, notification_id)
);

-- ---------- Store settings (single row) ----------
CREATE TABLE settings (
  id                     SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_shipping_fee   NUMERIC(12,2) NOT NULL DEFAULT 3500,
  free_shipping          BOOLEAN NOT NULL DEFAULT false,
  paystack_public_key    TEXT NOT NULL DEFAULT ''
);
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE country_shipping_fees (
  country   TEXT PRIMARY KEY,
  fee       NUMERIC(12,2) NOT NULL
);

-- ---------- Admin account ----------
CREATE TABLE admin_users (
  username        TEXT PRIMARY KEY,
  password_hash   TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE PRIVILEGES (GRANT) — required before RLS policies can do
-- anything at all. The site has no backend and no per-shopper login
-- tied to Neon, so every request from the browser hits the Data API
-- with no Authorization header, which Neon treats as the built-in
-- "anonymous" role. By default that role can touch nothing — these
-- GRANTs are what let it read and write the tables below. (This is
-- different from Supabase: there's no separate "anon key" string to
-- paste anywhere — access is controlled entirely by these GRANTs plus
-- the RLS policies further down.)
-- ============================================================
GRANT USAGE ON SCHEMA public TO anonymous;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  products, orders, order_items, cart_items, notifications,
  notification_reads, settings, country_shipping_fees, users
  TO anonymous;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anonymous;
-- admin_users gets NO grant at all, so the Data API can't touch it from
-- the browser no matter what — the admin password stays only in
-- js/config.js for now, not in a table the anon role can read.

-- ============================================================
-- ROW LEVEL SECURITY — a GRANT above says the anonymous role is
-- *allowed* to touch a table at all; RLS policies say *which rows*.
-- These are as tight as a no-backend, no-per-user-login setup allows
-- (see the security note further down in this README for what that
-- does and doesn't protect).
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_shipping_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Catalogue + shipping settings: public read, and writable so the
-- admin dashboard (which only has a client-side password gate, not a
-- real login) can save changes.
CREATE POLICY "products: anyone can read" ON products FOR SELECT TO anonymous USING (true);
CREATE POLICY "products: anyone can write" ON products FOR ALL TO anonymous USING (true) WITH CHECK (true);
CREATE POLICY "settings: anyone can read" ON settings FOR SELECT TO anonymous USING (true);
CREATE POLICY "settings: anyone can write" ON settings FOR ALL TO anonymous USING (true) WITH CHECK (true);
CREATE POLICY "country fees: anyone can read" ON country_shipping_fees FOR SELECT TO anonymous USING (true);
CREATE POLICY "country fees: anyone can write" ON country_shipping_fees FOR ALL TO anonymous USING (true) WITH CHECK (true);

-- Orders: anyone can create one (that's checkout), and — because there's
-- no real per-user login tying a browser session to a database role —
-- anyone can also read/update them, same caveat as above.
CREATE POLICY "orders: anyone can create" ON orders FOR INSERT TO anonymous WITH CHECK (true);
CREATE POLICY "orders: anyone can read" ON orders FOR SELECT TO anonymous USING (true);
CREATE POLICY "orders: anyone can update" ON orders FOR UPDATE TO anonymous USING (true) WITH CHECK (true);
CREATE POLICY "order items: anyone can create" ON order_items FOR INSERT TO anonymous WITH CHECK (true);
CREATE POLICY "order items: anyone can read" ON order_items FOR SELECT TO anonymous USING (true);

-- Not yet wired up to the front end (see the note below), but ready:
CREATE POLICY "users: anyone can read/write" ON users FOR ALL TO anonymous USING (true) WITH CHECK (true);
CREATE POLICY "cart: anyone can read/write" ON cart_items FOR ALL TO anonymous USING (true) WITH CHECK (true);
CREATE POLICY "notifications: anyone can read/write" ON notifications FOR ALL TO anonymous USING (true) WITH CHECK (true);
CREATE POLICY "notification reads: anyone can read/write" ON notification_reads FOR ALL TO anonymous USING (true) WITH CHECK (true);
-- admin_users has NO policies at all either, belt-and-braces with the
-- missing GRANT above.

-- ============================================================
-- SEED DATA — the 25 starter products already built into the site
-- ============================================================
INSERT INTO products (id, category, name, price, stock, image, description, badge) VALUES
('phone-001', 'Phone', 'Nova X12 Pro', 620000, 24, 'https://picsum.photos/seed/goldenedge-phone1/600/450', '6.7-inch OLED display, triple camera system and all-day battery life.', 'New'),
('phone-002', 'Phone', 'Pulse Lite 5G', 245000, 40, 'https://picsum.photos/seed/goldenedge-phone2/600/450', 'Affordable 5G phone with a smooth 120Hz display.', NULL),
('phone-003', 'Phone', 'Zenith Fold 2', 980000, 8, 'https://picsum.photos/seed/goldenedge-phone3/600/450', 'Foldable flagship with a crease-resistant display and stylus support.', 'New'),
('phone-004', 'Phone', 'Aria S8', 410000, 18, 'https://picsum.photos/seed/goldenedge-phone4/600/450', 'Mid-range all-rounder with a clean display and a reliable dual camera.', NULL),
('phone-005', 'Phone', 'Titan Max 5G', 530000, 14, 'https://picsum.photos/seed/goldenedge-phone5/600/450', 'Rugged, dust and splash-resistant phone built for everyday knocks.', 'Bestseller'),
('acc-001', 'Phone Accessories', 'ClearGuard Tempered Glass', 3500, 60, 'https://picsum.photos/seed/goldenedge-acc1/600/450', '9H hardness tempered glass screen protector with an easy-align tray.', NULL),
('acc-002', 'Phone Accessories', 'ArmorCase Shockproof Cover', 6500, 55, 'https://picsum.photos/seed/goldenedge-acc2/600/450', 'Reinforced-corner case that absorbs drops without adding bulk.', 'Bestseller'),
('acc-003', 'Phone Accessories', 'FastCharge 65W Wall Charger', 12000, 35, 'https://picsum.photos/seed/goldenedge-acc3/600/450', 'Compact GaN charger that fast-charges phones and laptops alike.', NULL),
('acc-004', 'Phone Accessories', 'MagSnap Wireless Charging Pad', 15000, 30, 'https://picsum.photos/seed/goldenedge-acc4/600/450', 'Magnetic snap-on wireless charger for a clutter-free desk.', 'New'),
('acc-005', 'Phone Accessories', 'SoundBuds Pro Wireless Earbuds', 28000, 26, 'https://picsum.photos/seed/goldenedge-acc5/600/450', 'Noise-isolating earbuds with a compact charging case.', NULL),
('gad-001', 'Small Gadgets', 'PulseFit Smartwatch', 65000, 22, 'https://picsum.photos/seed/goldenedge-gad1/600/450', 'Tracks heart rate, sleep and workouts, with call and message alerts.', 'Bestseller'),
('gad-002', 'Small Gadgets', 'BoomBox Mini Bluetooth Speaker', 22000, 32, 'https://picsum.photos/seed/goldenedge-gad2/600/450', 'Pocket-sized speaker with surprisingly deep bass and 10-hour battery.', NULL),
('gad-003', 'Small Gadgets', 'SkyView Mini Drone', 85000, 10, 'https://picsum.photos/seed/goldenedge-gad3/600/450', 'Foldable camera drone with one-tap takeoff and return-home.', NULL),
('gad-004', 'Small Gadgets', 'PowerCore 20000mAh Power Bank', 18000, 40, 'https://picsum.photos/seed/goldenedge-gad4/600/450', 'High-capacity power bank with dual fast-charge output ports.', 'New'),
('gad-005', 'Small Gadgets', 'SnapCam Instant Mini Camera', 38000, 16, 'https://picsum.photos/seed/goldenedge-gad5/600/450', 'Fun instant-print camera that develops photos in seconds.', NULL),
('fash-001', 'Fashion Accessories', 'Chrono Classic Wrist Watch', 32000, 20, 'https://picsum.photos/seed/goldenedge-fash1/600/450', 'Stainless steel dress watch with a scratch-resistant crystal face.', 'Bestseller'),
('fash-002', 'Fashion Accessories', 'Aviator Sunglasses', 14000, 34, 'https://picsum.photos/seed/goldenedge-fash2/600/450', 'UV-protective aviator-style sunglasses with a metal frame.', NULL),
('fash-003', 'Fashion Accessories', 'Leather Craft Belt', 9500, 45, 'https://picsum.photos/seed/goldenedge-fash3/600/450', 'Genuine leather belt with a polished buckle, sized to fit most.', NULL),
('fash-004', 'Fashion Accessories', 'Urban Sling Bag', 17500, 28, 'https://picsum.photos/seed/goldenedge-fash4/600/450', 'Water-resistant sling bag with a padded pocket for a phone or tablet.', 'New'),
('fash-005', 'Fashion Accessories', 'Signature Leather Wallet', 11000, 38, 'https://picsum.photos/seed/goldenedge-fash5/600/450', 'Slim bifold wallet with card slots and a coin pocket.', NULL),
('wear-001', 'Wears', 'Everyday Crewneck T-Shirt', 8500, 50, 'https://picsum.photos/seed/goldenedge-wear1/600/450', 'Soft cotton t-shirt built for all-day comfort, true to size.', 'Bestseller'),
('wear-002', 'Wears', 'Urban Pullover Hoodie', 17500, 34, 'https://picsum.photos/seed/goldenedge-wear2/600/450', 'Fleece-lined hoodie with a kangaroo pocket and adjustable drawstring.', NULL),
('wear-003', 'Wears', 'Classic Slim-Fit Jeans', 21000, 28, 'https://picsum.photos/seed/goldenedge-wear3/600/450', 'Stretch denim jeans with a tapered, slim-fit cut.', 'New'),
('wear-004', 'Wears', 'Street Runner Sneakers', 32000, 22, 'https://picsum.photos/seed/goldenedge-wear4/600/450', 'Lightweight everyday sneakers with a cushioned sole.', NULL),
('wear-005', 'Wears', 'Everyday Cap', 6000, 45, 'https://picsum.photos/seed/goldenedge-wear5/600/450', 'Adjustable cotton cap that pairs with almost any outfit.', NULL);
```

### 2. Confirm the URL in `js/config.js`

```js
NEON_DATA_API_URL: "https://ep-spring-meadow-b4m3g7bx.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1",
```

That's already your project's real URL — nothing else to paste. Unlike
Supabase, Neon's Data API has no separate "anon key" string: a request
with no `Authorization` header is automatically treated as the
database's built-in `anonymous` role, and the GRANT statements above
are what give that role permission to read and write. The moment this
URL points at a real project (as it already does), the site starts
pulling from and pushing to Neon automatically — nothing else to
change, and no page needs touching.

**One honest caveat:** your project also has an OAuth provider (Google)
configured for Neon Auth, which can mean the Data API expects every
request — anonymous ones included — to carry some JWT rather than
truly none at all. The GRANTs above are the standard, documented way to
open up the `anonymous` role, and they're what this site relies on. If,
once this is live, writes/reads to Neon are failing (check your
browser's console for `Neon GET/POST/PATCH ... → 401` or `403`), open
your project's **Data API → Settings** page in the Neon Console and
look for an anonymous-access option there — or send me the exact error
and I'll adjust the approach.

### What's actually wired up, and what isn't

**Connected to Neon:** the product catalogue (admin add/edit/delete
push to Neon; every page's product list refreshes from Neon in the
background on load), orders (checkout creates a real row in `orders` +
`order_items`; admin's order-status changes push too), and shipping
settings + the Paystack public key (admin's Payment and Shipping Fee
tabs push to Neon).

**Still local-storage-only, on purpose:** notifications and user
profiles. The cart is also local-only, but per shopper rather than
per-device — see "How sign-in works" above; each signed-in Google
account gets its own cart, kept apart by email. Syncing carts,
notifications and profiles *across devices* for the same shopper would
need their browser session tied to a real, verified identity Neon
itself recognizes (i.e. actually finishing the Neon Auth integration
your project already has the Google provider configured for) — a
meaningfully bigger job than adding a REST call. The tables and RLS
policies for all three are included above so that work is ready to
build on, they're just not called from any page yet.

### The security trade-off, plainly

This site has no backend server — every request to Neon happens
directly from the shopper's browser. RLS can restrict what the
`anonymous` role is *allowed* to touch, but it can't tell one visitor
apart from another — every visitor shares that one role. The policies
above are written to keep the site fully working under that
constraint, which means: **anyone who opens their browser's dev tools
and inspects the network requests can see exactly how to read or write
products, orders, and settings directly, with no key of any kind
required** — the admin "password" only gates the dashboard's UI, not
the database itself.

That's a reasonable trade-off for a personal project, a demo, or a
store you're the only one operating. It is **not** safe for a public
store handling real customers' names, addresses and phone numbers at
scale — the real fix is a small backend (even a single serverless
function) that enforces real authentication before touching the
database, with the browser never talking to Neon directly. That
backend is not part of this build.

## Running it locally


No build step is required — it's plain HTML/CSS/JS. Just serve it over
`http://` (e.g. `npx serve golden-edge`, or a "Live Server" VS Code
extension) rather than opening the files directly, since Google Sign-In
doesn't work over `file://`.

## Header account icon & WhatsApp button

The header has no "Sign in" button — in its place is a circular avatar
link straight to `account.html`, showing the signed-in user's Google
profile picture when one is available, and falling back to the first
letter of their email address when it isn't. The **Account** tab in the bottom nav bar
shows the same circular avatar. A floating WhatsApp button appears only
on the **About** and **Help** pages and opens a chat with
**+234 904 202 6195**.

## Goods shown across the site

Products aren't only on the home page:

- **Cart** — below the checkout button, a "More goods to explore" grid
  shows other products (excluding whatever's already in the cart), so
  there's always something to keep browsing.
- **Account** (`account.html`) — below your profile details (avatar, name,
  email) and quick links (My Orders, Notifications, Cart, Shop all), a
  "Goods you might like" grid rounds out the page.

Every product grid — home, shop, cart, and account — uses the same shared
card markup and "Add to cart" behavior (`productCardHTML` / `addProductToCart`
/ `renderGoodsGrid` in `js/main.js`), so they all look and behave
identically no matter where they appear.

## Bottom navigation bar

Every shopper-facing page has a white, rounded bottom navigation bar with
a black outline and a soft light-red shadow, with four icon-only tabs —
Home, Category, Cart (with the live item count), and Account. There are
no text labels; tapping a tab highlights just that icon with a soft
background circle, not the whole bar. It's hidden on the admin dashboard,
which has its own tab navigation instead.

## Notifications

Admin can send announcements from **Admin → Notifications**, choosing who
gets each one:
- **All members** — every signed-in shopper sees it
- **Specific user (by Gmail)** — only that exact Gmail address sees it

Write a title and message, pick the recipient, and hit **Send
notification**. It shows up immediately for whoever it was sent to: the
bell icon in the header gets an unread badge, and opening
**notifications.html** (via that bell) lists everything meant for that
shopper — broadcasts and anything sent directly to them — newest first,
marking them as read. **Viewing notifications requires signing in** first,
same as the cart; a guest tapping the bell is sent to `login.html`. The
admin's own table shows every notification sent, with its recipient, and
can delete any of them.

## Product detail page

Tapping a product's image or name (from the home page or the shop page)
opens `product.html`, which shows:
- An image gallery — a main photo with clickable thumbnails
- Availability ("In stock", "Only N left", or "Out of stock")
- Color options, if any apply to that product
- A quantity stepper
- **Add to cart** (adds the item and stays on the page) and **Order now**
  (adds the item and goes straight to checkout)

By default every product gets 2–3 gallery photos and a sensible set of
color options for its category automatically, so nothing extra is needed
to make the page work. To set exact photos or colors for a specific
product, open it in **Admin → Goods / Products → Edit** and choose
photos from your device or gallery in **Main image** / **Additional
images**, and fill in **Color options**.

1. Unzip the folder.
2. Open it with a local server, e.g.:
   ```
   npx serve golden-edge
   ```
3. Visit the printed local URL and you'll land straight on the home page,
   signed in and ready to shop.

## Hosting

**Upload only the `public/` folder to your host** — that's the whole
shopfront. Keep `server/` (the admin dashboard) on your computer only;
see "The Admin dashboard never goes online" above for why, and how it
still stays in sync with the live site through Neon.

Any static host works for `public/`: Netlify, Vercel, GitHub Pages,
Cloudflare Pages, or a normal web server. Just remember to add your
production domain to the Google OAuth "Authorized JavaScript origins"
list, and switch to your Paystack **live** key when you're ready to
accept real payments.

## Selecting which cart items to buy

Every item in the cart has a checkbox next to it (there's also a "Select
all items" checkbox at the top). Only checked items count toward the
order summary and get bought — unchecked items just stay in the cart for
later, they aren't removed or lost.

The **Proceed to checkout** button shows the running total of only the
selected items right on the button (e.g. "Proceed to checkout — ₦45,000"),
so it's always clear what you're about to pay before moving on to
payment. If nothing is checked, the button is disabled and asks you to
select at least one item. Checkout itself only ever charges for, and
creates an order from, the items that were checked — after a successful
payment, only those items are cleared from the cart.

The checkout page is also locked to the screen's width — its layout can't
scroll or overflow sideways on any device, so long product names, emails,
or addresses wrap instead of pushing the page wider than the screen.

## Shipping fees

Shipping is set under **Admin → Shipping Fee**, and can be a single
default for the whole store, customized per country, or free — a shopper
is charged based on the country they pick on the checkout page itself.

- **Default fee**: enter an amount and hit **Save** — that's what applies
  to any country that doesn't have its own fee (see below).
- **Free for everyone, everywhere**: check **"Free shipping for all
  orders, in every country"** and save — every order ships free
  regardless of country (cart, checkout, and the product page all show
  "FREE"). Unchecking it later restores the default fee and any
  per-country fees you'd set, exactly as they were.
- **A specific country's fee**: under "Shipping fee by country," pick a
  country, enter its fee, and save. That country now uses this fee
  instead of the default — e.g. set Nigeria to ₦1,500 while everywhere
  else stays at the ₦10,000 default.
- **Free for just one country**: same as above, but enter **0** as that
  country's fee. Only that country ships free; every other country still
  charges its own fee (or the default).
- Countries with a custom fee are listed in a table with a **Remove**
  button, which sends that country back to using the default fee.

Products themselves don't carry their own individual shipping cost —
shipping is always store-wide or per-country, never per-product.

## Sending order details on WhatsApp

Right after a successful payment, the shopper lands on a confirmation
page with a wide **"Send my order details on WhatsApp"** button. Tapping
it opens WhatsApp with a message already filled in — order ID, name,
phone, email, delivery address, every item with its quantity and price,
subtotal, shipping, and total — addressed to your WhatsApp number
(`GOLDENEDGE_CONFIG.WHATSAPP_NUMBER` in `js/config.js`, the same number the
floating WhatsApp button on the About and Help pages uses). The shopper still has to
hit send themselves; nothing is sent automatically.

The same button (as "Send details on WhatsApp") appears on every order in
**My Orders**, so a shopper can resend any past order's details the same
way — handy if they need to follow up.

## Adding/editing products

`admin.html` → **Goods / Products → + Add product** (or **Edit** on an
existing row). Categories match the five store sections: Phone, Phone
Accessories, Small Gadgets, Fashion Accessories, and Wears. Shoppers can
also pick **All** in the category rail to clear any filter and see
everything. Category chips in the rail are plain text (no icons) on a
butter-yellow background with a black outline and curved edges.

Product media is picked straight from the device or photo gallery (no
URLs to type in), and accepts **JPG, PNG, GIF, or MP4** files for both the
main media slot and the additional media slot. Images are automatically
resized and compressed before saving; MP4s are saved as-is (with a
warning if the file is large), and are rendered as a playable video
wherever that product's media shows up — the product grid, the product
detail page gallery, and the admin preview. All of this is stored in the
browser (`localStorage`), which has limited space — keep videos short and
small. If you move to a real backend later, swap this for actual file
uploads to your server or a storage bucket.

## Checkout: country, state, local government, and home address

Checkout asks for the delivery **country** first (defaulting to the
shopper's saved country if they set one under Account, but changeable
here), then **email**, then a **state** dropdown built from that
country's real states/provinces/regions (`STATES_BY_COUNTRY` in
`js/countries.js` — every one of the 54 African countries has a real
list, so this dropdown is never a plain text field), then a **local
government** dropdown built from the chosen state (full data for all 37
Nigerian states + FCT in `CITIES_BY_STATE`; any other state falls back
to a plain "City / local area" text field, since that level of detail
isn't filled in for every country yet), then **home address**, then
**full name**, **phone**, and **WhatsApp number** — phone and WhatsApp
both show a country-code prefix set from the country chosen at the top
of the form (e.g. a Nigerian shopper sees
"+234"), with a "Same as phone" checkbox to copy the number across.

---
Need changes to the design, more payment methods, or a real backend hooked
up? Everything is plain, commented HTML/CSS/JS, so any web developer can
extend it — or just ask for the next iteration.
