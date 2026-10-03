/* ============================================================
   GOLDEN EDGE — SITE CONFIGURATION
   See README.md for what each value does and how to change it.
   ============================================================ */

const GOLDENEDGE_CONFIG = {
  // 1. Google Sign-In — from Google Cloud Console > Credentials > OAuth Client ID (Web)
  //    Browsing the site (home, shop, product pages) never requires signing
  //    in; this is only needed once a shopper chooses to sign in, or when
  //    they reach a page that requires an account (cart checkout, orders,
  //    account page).
  GOOGLE_CLIENT_ID: "879171351078-1ru9a0h7r6s6b2tpl4bcbevgmdn4p35i.apps.googleusercontent.com",

  // 2. Paystack — from Paystack Dashboard > Settings > API Keys & Webhooks
  //    Use a pk_test_... key while testing, switch to pk_live_... to go live.
  PAYSTACK_PUBLIC_KEY: "pk_live_5a9f80c1d25371c1c639f21752fa8ab4e78fd02a",

  // 3. There is no "Admin" link anywhere on the site. The dashboard only
  //    opens by visiting admin.html directly, and even then only after
  //    entering this username and password.
  ADMIN_USERNAME: "Golden Edge",
  ADMIN_PASSWORD: "1gete112",

  // All prices and payments are in Naira.
  CURRENCY_CODE: "NGN",
  CURRENCY_SYMBOL: "₦",

  // Default shipping fee (in Naira), used for any country the admin
  // hasn't set a custom fee for. Change fees any time from Admin →
  // Shipping Fee — per-country overrides and the "free for everyone"
  // switch both live there too.
  DEFAULT_SHIPPING_FEE: 3500,

  // 4. The WhatsApp number that receives order details (the "Send my
  //    order details" button after checkout) and general customer
  //    questions (the floating WhatsApp button, shown only on the
  //    About and Help pages). Digits only, with country code, no "+"
  //    or leading zeros — e.g. a Nigerian number 0904 202 6195
  //    becomes "2349042026195".
  WHATSAPP_NUMBER: "2349042026195",

  // 5. Neon database (optional). When this is set to your real Data API
  //    URL, the site reads and writes products, orders and settings
  //    through Neon instead of (well, alongside — see js/store.js) just
  //    the browser's local storage, so every visitor sees the same
  //    catalogue and every order lands in one shared database. Unlike
  //    some other backends, Neon's Data API doesn't use a separate "anon
  //    key" string — this URL is all that's needed; access is controlled
  //    entirely by the GRANT + Row-Level-Security SQL you run in Neon
  //    (see README.md, "Connecting a real database (Neon)", for the
  //    full setup guide and the SQL to run). Leave this as the
  //    placeholder below to keep the site fully local-storage-only —
  //    nothing else about the site changes either way.
  NEON_DATA_API_URL: "https://ep-spring-meadow-b4m3g7bx.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1"
};
