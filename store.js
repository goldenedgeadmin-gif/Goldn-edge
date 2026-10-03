/* ============================================================
   GOLDEN EDGE — DATA LAYER
   A tiny localStorage-backed "database" so the whole site works
   the moment you open it — no server required. Swap the internals
   of these functions for real API calls later without touching
   any page code, since every page only talks to `DB`.
   ============================================================ */

const DB_KEYS = {
  PRODUCTS: "goldenedge_products",
  ORDERS: "goldenedge_orders",
  SETTINGS: "goldenedge_settings",
  CART: "goldenedge_cart",
  SESSION: "goldenedge_session",
  NOTIFICATIONS: "goldenedge_notifications",
  NOTIFICATIONS_READ: "goldenedge_notifications_read",
  PROFILES: "goldenedge_profiles"
};

const SEED_PRODUCTS = [
  // ---- Phone ----
  { id: "phone-001", category: "Phone", name: "Nova X12 Pro", price: 620000, stock: 24, image: "https://picsum.photos/seed/goldenedge-phone1/600/450", desc: "6.7-inch OLED display, triple camera system and all-day battery life.", badge: "New" },
  { id: "phone-002", category: "Phone", name: "Pulse Lite 5G", price: 245000, stock: 40, image: "https://picsum.photos/seed/goldenedge-phone2/600/450", desc: "Affordable 5G phone with a smooth 120Hz display." },
  { id: "phone-003", category: "Phone", name: "Zenith Fold 2", price: 980000, stock: 8, image: "https://picsum.photos/seed/goldenedge-phone3/600/450", desc: "Foldable flagship with a crease-resistant display and stylus support.", badge: "New" },
  { id: "phone-004", category: "Phone", name: "Aria S8", price: 410000, stock: 18, image: "https://picsum.photos/seed/goldenedge-phone4/600/450", desc: "Mid-range all-rounder with a clean display and a reliable dual camera." },
  { id: "phone-005", category: "Phone", name: "Titan Max 5G", price: 530000, stock: 14, image: "https://picsum.photos/seed/goldenedge-phone5/600/450", desc: "Rugged, dust and splash-resistant phone built for everyday knocks.", badge: "Bestseller" },
  // ---- Phone Accessories ----
  { id: "acc-001", category: "Phone Accessories", name: "ClearGuard Tempered Glass", price: 3500, stock: 60, image: "https://picsum.photos/seed/goldenedge-acc1/600/450", desc: "9H hardness tempered glass screen protector with an easy-align tray." },
  { id: "acc-002", category: "Phone Accessories", name: "ArmorCase Shockproof Cover", price: 6500, stock: 55, image: "https://picsum.photos/seed/goldenedge-acc2/600/450", desc: "Reinforced-corner case that absorbs drops without adding bulk.", badge: "Bestseller" },
  { id: "acc-003", category: "Phone Accessories", name: "FastCharge 65W Wall Charger", price: 12000, stock: 35, image: "https://picsum.photos/seed/goldenedge-acc3/600/450", desc: "Compact GaN charger that fast-charges phones and laptops alike." },
  { id: "acc-004", category: "Phone Accessories", name: "MagSnap Wireless Charging Pad", price: 15000, stock: 30, image: "https://picsum.photos/seed/goldenedge-acc4/600/450", desc: "Magnetic snap-on wireless charger for a clutter-free desk.", badge: "New" },
  { id: "acc-005", category: "Phone Accessories", name: "SoundBuds Pro Wireless Earbuds", price: 28000, stock: 26, image: "https://picsum.photos/seed/goldenedge-acc5/600/450", desc: "Noise-isolating earbuds with a compact charging case." },
  // ---- Small Gadgets ----
  { id: "gad-001", category: "Small Gadgets", name: "PulseFit Smartwatch", price: 65000, stock: 22, image: "https://picsum.photos/seed/goldenedge-gad1/600/450", desc: "Tracks heart rate, sleep and workouts, with call and message alerts.", badge: "Bestseller" },
  { id: "gad-002", category: "Small Gadgets", name: "BoomBox Mini Bluetooth Speaker", price: 22000, stock: 32, image: "https://picsum.photos/seed/goldenedge-gad2/600/450", desc: "Pocket-sized speaker with surprisingly deep bass and 10-hour battery." },
  { id: "gad-003", category: "Small Gadgets", name: "SkyView Mini Drone", price: 85000, stock: 10, image: "https://picsum.photos/seed/goldenedge-gad3/600/450", desc: "Foldable camera drone with one-tap takeoff and return-home." },
  { id: "gad-004", category: "Small Gadgets", name: "PowerCore 20000mAh Power Bank", price: 18000, stock: 40, image: "https://picsum.photos/seed/goldenedge-gad4/600/450", desc: "High-capacity power bank with dual fast-charge output ports.", badge: "New" },
  { id: "gad-005", category: "Small Gadgets", name: "SnapCam Instant Mini Camera", price: 38000, stock: 16, image: "https://picsum.photos/seed/goldenedge-gad5/600/450", desc: "Fun instant-print camera that develops photos in seconds." },
  // ---- Fashion Accessories ----
  { id: "fash-001", category: "Fashion Accessories", name: "Chrono Classic Wrist Watch", price: 32000, stock: 20, image: "https://picsum.photos/seed/goldenedge-fash1/600/450", desc: "Stainless steel dress watch with a scratch-resistant crystal face.", badge: "Bestseller" },
  { id: "fash-002", category: "Fashion Accessories", name: "Aviator Sunglasses", price: 14000, stock: 34, image: "https://picsum.photos/seed/goldenedge-fash2/600/450", desc: "UV-protective aviator-style sunglasses with a metal frame." },
  { id: "fash-003", category: "Fashion Accessories", name: "Leather Craft Belt", price: 9500, stock: 45, image: "https://picsum.photos/seed/goldenedge-fash3/600/450", desc: "Genuine leather belt with a polished buckle, sized to fit most." },
  { id: "fash-004", category: "Fashion Accessories", name: "Urban Sling Bag", price: 17500, stock: 28, image: "https://picsum.photos/seed/goldenedge-fash4/600/450", desc: "Water-resistant sling bag with a padded pocket for a phone or tablet.", badge: "New" },
  { id: "fash-005", category: "Fashion Accessories", name: "Signature Leather Wallet", price: 11000, stock: 38, image: "https://picsum.photos/seed/goldenedge-fash5/600/450", desc: "Slim bifold wallet with card slots and a coin pocket." },
  // ---- Wears ----
  { id: "wear-001", category: "Wears", name: "Everyday Crewneck T-Shirt", price: 8500, stock: 50, image: "https://picsum.photos/seed/goldenedge-wear1/600/450", desc: "Soft cotton t-shirt built for all-day comfort, true to size.", badge: "Bestseller" },
  { id: "wear-002", category: "Wears", name: "Urban Pullover Hoodie", price: 17500, stock: 34, image: "https://picsum.photos/seed/goldenedge-wear2/600/450", desc: "Fleece-lined hoodie with a kangaroo pocket and adjustable drawstring." },
  { id: "wear-003", category: "Wears", name: "Classic Slim-Fit Jeans", price: 21000, stock: 28, image: "https://picsum.photos/seed/goldenedge-wear3/600/450", desc: "Stretch denim jeans with a tapered, slim-fit cut.", badge: "New" },
  { id: "wear-004", category: "Wears", name: "Street Runner Sneakers", price: 32000, stock: 22, image: "https://picsum.photos/seed/goldenedge-wear4/600/450", desc: "Lightweight everyday sneakers with a cushioned sole." },
  { id: "wear-005", category: "Wears", name: "Everyday Cap", price: 6000, stock: 45, image: "https://picsum.photos/seed/goldenedge-wear5/600/450", desc: "Adjustable cotton cap that pairs with almost any outfit." }
];

const CATEGORIES = [
  "Phone", "Phone Accessories", "Small Gadgets", "Fashion Accessories", "Wears"
];

/* Fallback color options shown on the product page when a product doesn't
   define its own `colors` array. Admins can override this per product by
   setting `colors: [{ name, hex }, ...]` on that product. */
const DEFAULT_CATEGORY_COLORS = {
  "Phone": [{ name: "Space Grey", hex: "#4b4b4b" }, { name: "Gold", hex: "#d9a22b" }, { name: "Ocean Blue", hex: "#2f5d9e" }],
  "Phone Accessories": [{ name: "Black", hex: "#1c1c1c" }, { name: "White", hex: "#f2f2f2" }, { name: "Blue", hex: "#2f5d9e" }],
  "Small Gadgets": [{ name: "Black", hex: "#1c1c1c" }, { name: "Silver", hex: "#c9ccd1" }, { name: "Blue", hex: "#2f5d9e" }],
  "Fashion Accessories": [{ name: "Brown", hex: "#7a5230" }, { name: "Black", hex: "#1c1c1c" }, { name: "Tan", hex: "#c9a877" }],
  "Wears": [{ name: "Black", hex: "#1c1c1c" }, { name: "White", hex: "#f2f2f2" }, { name: "Navy", hex: "#0b1d33" }, { name: "Grey", hex: "#808080" }]
};

/** Returns the gallery of images to show for a product: its own explicit
 *  `images` array if set (from the admin form), otherwise the single
 *  product image repeated with light variations for a browsable gallery. */
function getProductImages(p) {
  if (Array.isArray(p.images) && p.images.length) return p.images;
  const match = /^(https:\/\/picsum\.photos\/seed\/)([a-z0-9-]+)(\/.+)$/i.exec(p.image || "");
  if (match) {
    return [p.image, `${match[1]}${match[2]}-b${match[3]}`, `${match[1]}${match[2]}-c${match[3]}`];
  }
  return [p.image];
}

/** True when a gallery entry is a video (MP4) rather than an image — either
 *  an uploaded video data URL, or a URL/file name ending in a video
 *  extension. Used to decide whether to render <video> or <img>. */
function isVideoSrc(src) {
  if (!src) return false;
  return /^data:video\//i.test(src) || /\.(mp4|webm|mov)(\?.*)?$/i.test(src);
}

/** Returns the color options to show for a product: its own explicit
 *  `colors` array if set, otherwise a sensible default for its category. */
function getProductColors(p) {
  if (Array.isArray(p.colors) && p.colors.length) return p.colors;
  return DEFAULT_CATEGORY_COLORS[p.category] || [];
}

/** Common color-name → hex lookup, used to turn the admin's comma-separated
 *  color names into swatches. Unrecognized names fall back to a neutral grey. */
const NAMED_COLOR_HEX = {
  black: "#1c1c1c", white: "#f2f2f2", silver: "#c9ccd1", grey: "#808080", gray: "#808080",
  red: "#c0392b", blue: "#2f5d9e", green: "#2f9e58", gold: "#d9a22b", yellow: "#e0c23a",
  orange: "#d9772b", purple: "#7d5ba6", pink: "#d97ba8", brown: "#7a5230", navy: "#0b1d33",
  beige: "#e6dcc3", "space grey": "#4b4b4b", "space gray": "#4b4b4b", "rose gold": "#caa08a"
};

/** Turns "Black, Gold, Blue" into [{name:"Black",hex:"#1c1c1c"}, ...]. */
function parseColorNames(text) {
  if (!text || !text.trim()) return [];
  return text.split(",").map(s => s.trim()).filter(Boolean).map(name => ({
    name,
    hex: NAMED_COLOR_HEX[name.toLowerCase()] || "#999999"
  }));
}

/** Human-readable availability line + a CSS class for styling it. */
function getAvailability(p) {
  if (p.stock === 0) return { text: "Out of stock", low: true };
  if (p.stock <= 3) return { text: `Only ${p.stock} left in stock — order soon`, low: true };
  return { text: `In stock (${p.stock} available)`, low: false };
}

function _read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("Storage read failed for", key, e);
    return fallback;
  }
}
function _write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("Storage write failed for", key, e);
    return false;
  }
}

/** Every shopper's cart is kept separate, keyed by their signed-in
 *  email — so signing out and into a different Google account never
 *  shows the previous account's cart. Items added before signing in
 *  (browsing as a guest, e.g. from a product card) live under the
 *  shared "_guest" bucket until that shopper signs in, at which point
 *  DB.claimGuestCart() folds them into that account's own cart. Reads
 *  localStorage directly (not through Auth) so store.js has no load
 *  order dependency on auth.js. */
function _currentCartOwner() {
  try {
    const raw = localStorage.getItem(DB_KEYS.SESSION);
    if (!raw) return "_guest";
    const u = JSON.parse(raw);
    return (u && u.email) ? u.email : "_guest";
  } catch (e) {
    return "_guest";
  }
}

/* ---------- Neon (optional real database) ----------
   A thin PostgREST client for Neon's Data API, plus a "pull on load,
   push in background" sync layer that sits ON TOP of the localStorage
   DB below — it doesn't replace it. Every DB.get___() function still
   reads from localStorage exactly as before, synchronously, so no page
   anywhere in the site had to change how it calls DB. What this adds:
     - DB.pullFromNeon(), called once near the bottom of this file,
       refreshes the local copy of products/settings from Neon in the
       background when the page loads (so the *next* page a shopper
       opens shows the latest data — the current page's first paint
       still comes from whatever was already cached locally, which
       keeps every page fast and working even if Neon is slow, blocked,
       or not configured at all).
     - DB.saveProduct(), deleteProduct(), createOrder(),
       setShippingSettings(), setCountryShippingFee(),
       removeCountryShippingFee(), setPaystackPublicKey(), and
       updateOrderStatus() each push the same change to Neon right
       after writing it locally — fire-and-forget, never awaited, and
       any failure (offline, blocked by RLS, etc.) is only logged to
       the console. The local write and the UI it feeds are never
       blocked or rolled back because of Neon.
   A no-op when GOLDENEDGE_CONFIG.NEON_DATA_API_URL is still the
   placeholder — see js/config.js. Unlike Supabase, there's no separate
   "anon key" to configure: Neon treats a request with no Authorization
   header as its built-in `anonymous` role, and access is controlled by
   the GRANT + RLS SQL in README.md ("Connecting a real database
   (Neon)"). */
/** Pulls the real reason out of a failed Neon/PostgREST response — e.g.
 *  "relation "products" does not exist" or "permission denied for table
 *  products" — so a failure in the console says what actually went
 *  wrong instead of just a bare status code. Falls back to the raw
 *  response text, or "(no response body)", if there's nothing
 *  JSON-shaped to read. Never throws itself. */
async function _neonErrorDetail(res) {
  try {
    const text = await res.text();
    if (!text) return "(no response body)";
    try {
      const json = JSON.parse(text);
      return json.message || json.error || json.hint || text;
    } catch (e) {
      return text;
    }
  } catch (e) {
    return "(couldn't read response body)";
  }
}

const NeonAPI = {
  isConfigured() {
    const url = GOLDENEDGE_CONFIG.NEON_DATA_API_URL;
    return !!(url && !url.includes("YOUR_") && !url.includes("xxxx"));
  },
  headers(extra) {
    // Neon's Data API doesn't use a static "anon key" the way Supabase
    // does — a request with no Authorization header is automatically
    // treated as the database's `anonymous` role. See the "Connecting a
    // real database (Neon)" section in README.md for the GRANT
    // statements that give that role the access it needs.
    return { "Content-Type": "application/json", ...extra };
  },
  async get(table, query = "") {
    const res = await fetch(`${GOLDENEDGE_CONFIG.NEON_DATA_API_URL}/${table}${query}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`Neon GET ${table} → ${res.status} ${await _neonErrorDetail(res)}`);
    return res.json();
  },
  /** Insert-or-update by primary key (PostgREST "upsert" via the
   *  Prefer: resolution=merge-duplicates header + ?on_conflict=). */
  async upsert(table, rows, onConflictColumn) {
    const url = `${GOLDENEDGE_CONFIG.NEON_DATA_API_URL}/${table}?on_conflict=${onConflictColumn}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.headers({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify(rows)
    });
    if (!res.ok) throw new Error(`Neon upsert ${table} → ${res.status} ${await _neonErrorDetail(res)}`);
  },
  /** Deletes rows matching a raw PostgREST filter, e.g. "id=eq.phone-001". */
  async remove(table, filter) {
    const res = await fetch(`${GOLDENEDGE_CONFIG.NEON_DATA_API_URL}/${table}?${filter}`, {
      method: "DELETE",
      headers: this.headers({ "Prefer": "return=minimal" })
    });
    if (!res.ok) throw new Error(`Neon DELETE ${table} → ${res.status} ${await _neonErrorDetail(res)}`);
  }
};

const DB = {
  init() {
    if (_read(DB_KEYS.PRODUCTS, null) === null) _write(DB_KEYS.PRODUCTS, SEED_PRODUCTS);
    if (_read(DB_KEYS.ORDERS, null) === null) _write(DB_KEYS.ORDERS, []);
    if (_read(DB_KEYS.SETTINGS, null) === null) {
      _write(DB_KEYS.SETTINGS, { shippingFee: GOLDENEDGE_CONFIG.DEFAULT_SHIPPING_FEE, freeShipping: false, countryFees: {}, paystackPublicKey: "" });
    }
    const existingCart = _read(DB_KEYS.CART, null);
    if (existingCart === null) {
      _write(DB_KEYS.CART, {});
    } else if (Array.isArray(existingCart)) {
      // Migrating from the old single-shared-cart format (every account
      // used to see the same cart) — keep whatever was in it as the
      // guest bucket rather than silently discarding it.
      _write(DB_KEYS.CART, { "_guest": existingCart });
    }
    if (_read(DB_KEYS.NOTIFICATIONS, null) === null) _write(DB_KEYS.NOTIFICATIONS, []);
    if (_read(DB_KEYS.NOTIFICATIONS_READ, null) === null) _write(DB_KEYS.NOTIFICATIONS_READ, []);
    if (_read(DB_KEYS.PROFILES, null) === null) _write(DB_KEYS.PROFILES, {});
  },

  /** Background refresh from Neon — see the big comment on NeonAPI above.
   *  Never awaited by callers; called once, fire-and-forget, near the
   *  bottom of this file. Safe to call repeatedly (e.g. after an admin
   *  save) since it always just re-reads everything and overwrites the
   *  local cache. No-op when Neon isn't configured. */
  async pullFromNeon() {
    if (!NeonAPI.isConfigured()) return;
    try {
      const [products, settingsRows, countryFeeRows] = await Promise.all([
        NeonAPI.get("products", "?order=category.asc,name.asc"),
        NeonAPI.get("settings", "?id=eq.1"),
        NeonAPI.get("country_shipping_fees")
      ]);
      const mappedProducts = products.map(p => ({
        id: p.id,
        category: p.category,
        name: p.name,
        price: Number(p.price),
        stock: p.stock,
        image: p.image,
        images: (p.images && p.images.length) ? p.images : undefined,
        colors: p.colors || undefined,
        badge: p.badge || undefined,
        desc: p.description || ""
      }));
      _write(DB_KEYS.PRODUCTS, mappedProducts);

      const s = settingsRows[0];
      if (s) {
        const countryFees = {};
        countryFeeRows.forEach(r => { countryFees[r.country] = Number(r.fee); });
        _write(DB_KEYS.SETTINGS, {
          shippingFee: Number(s.default_shipping_fee),
          freeShipping: !!s.free_shipping,
          countryFees,
          paystackPublicKey: s.paystack_public_key || ""
        });
      }
    } catch (e) {
      // Offline, misconfigured key, RLS blocking the anon role, etc. —
      // the site just keeps using whatever's already in localStorage.
      console.warn("Neon sync skipped, using local data instead:", e);
    }
  },

  // ---- User profiles (keyed by Gmail address) ----
  // Kept separate from the active session so a shopper who signs out and
  // signs back in with the same Google account keeps the name, photo and
  // details they saved under Account → Edit profile.
  getUserProfile(email) {
    const profiles = _read(DB_KEYS.PROFILES, {});
    return profiles[email] || null;
  },
  saveUserProfile(email, profile) {
    const profiles = _read(DB_KEYS.PROFILES, {});
    profiles[email] = { ...(profiles[email] || {}), ...profile };
    _write(DB_KEYS.PROFILES, profiles);
    return profiles[email];
  },

  // ---- Products ----
  getProducts() { return _read(DB_KEYS.PRODUCTS, []); },
  getProduct(id) { return this.getProducts().find(p => p.id === id) || null; },
  /** Returns true if the product was actually saved. Storage can fail
   *  silently (the browser's local-storage quota is a few MB, and a
   *  product with several full-size photos/videos can be large) — admin.js
   *  checks this return value so "Product saved" is never shown when
   *  nothing was actually written. */
  saveProduct(product) {
    const products = this.getProducts();
    const i = products.findIndex(p => p.id === product.id);
    if (i > -1) products[i] = product; else products.push(product);
    const ok = _write(DB_KEYS.PRODUCTS, products);
    if (ok && NeonAPI.isConfigured()) {
      NeonAPI.upsert("products", [{
        id: product.id, category: product.category, name: product.name,
        price: product.price, stock: product.stock, image: product.image,
        images: product.images || null, colors: product.colors || null,
        badge: product.badge || null, description: product.desc || null
      }], "id").catch(e => console.warn("Neon push (product save) failed:", e));
    }
    return ok;
  },
  deleteProduct(id) {
    const ok = _write(DB_KEYS.PRODUCTS, this.getProducts().filter(p => p.id !== id));
    if (ok && NeonAPI.isConfigured()) {
      NeonAPI.remove("products", `id=eq.${encodeURIComponent(id)}`)
        .catch(e => console.warn("Neon push (product delete) failed:", e));
    }
    return ok;
  },

  // ---- Settings (a default shipping fee, an optional global free-shipping
  // switch, and optional per-country fee overrides) ----
  getSettings() {
    const s = _read(DB_KEYS.SETTINGS, { shippingFee: GOLDENEDGE_CONFIG.DEFAULT_SHIPPING_FEE, freeShipping: false, countryFees: {} });
    if (!s.countryFees) s.countryFees = {};
    return s;
  },
  /** The fee to charge for a given country. Global free shipping (the
   *  "Free shipping for all orders" switch) always wins and returns 0
   *  for every country. Otherwise, a country with its own configured fee
   *  uses that (set it to 0 to make just that one country free);
   *  anything else falls back to the default fee. Pass no country (or
   *  one with no override) to get the default fee. */
  getShippingFee(country) {
    const s = this.getSettings();
    if (s.freeShipping) return 0;
    if (country && Object.prototype.hasOwnProperty.call(s.countryFees, country)) {
      return Number(s.countryFees[country]);
    }
    return Number(s.shippingFee);
  },
  /** The default fee to show/edit in the admin form, even while free
   *  shipping is on (so turning free shipping back off restores it). */
  getConfiguredShippingFee() { return this.getSettings().shippingFee; },
  isFreeShipping() { return !!this.getSettings().freeShipping; },
  setShippingSettings(fee, freeShipping) {
    const s = this.getSettings();
    s.shippingFee = Number(fee);
    s.freeShipping = !!freeShipping;
    _write(DB_KEYS.SETTINGS, s);
    this._pushSettingsToNeon(s);
  },
  /** Every country with a fee that's been customized away from the
   *  default — e.g. { "Nigeria": 1500, "Ghana": 0 }. A country with a fee
   *  of 0 here is free specifically because the admin set it that way,
   *  independent of the global free-shipping switch. */
  getCountryShippingFees() { return this.getSettings().countryFees; },
  setCountryShippingFee(country, fee) {
    const s = this.getSettings();
    s.countryFees[country] = Number(fee);
    _write(DB_KEYS.SETTINGS, s);
    if (NeonAPI.isConfigured()) {
      NeonAPI.upsert("country_shipping_fees", [{ country, fee: Number(fee) }], "country")
        .catch(e => console.warn("Neon push (country fee) failed:", e));
    }
  },
  removeCountryShippingFee(country) {
    const s = this.getSettings();
    delete s.countryFees[country];
    _write(DB_KEYS.SETTINGS, s);
    if (NeonAPI.isConfigured()) {
      NeonAPI.remove("country_shipping_fees", `country=eq.${encodeURIComponent(country)}`)
        .catch(e => console.warn("Neon push (country fee delete) failed:", e));
    }
  },

  // ---- Paystack public key ----
  // Set from Admin → Payment Settings. When empty, checkout.html falls
  // back to GOLDENEDGE_CONFIG.PAYSTACK_PUBLIC_KEY in js/config.js.
  getPaystackPublicKey() {
    return this.getSettings().paystackPublicKey || "";
  },
  setPaystackPublicKey(key) {
    const s = this.getSettings();
    s.paystackPublicKey = (key || "").trim();
    _write(DB_KEYS.SETTINGS, s);
    this._pushSettingsToNeon(s);
  },
  /** Shared by every settings writer above — upserts the single settings
   *  row to Neon. Fire-and-forget, no-op when Neon isn't configured. */
  _pushSettingsToNeon(s) {
    if (!NeonAPI.isConfigured()) return;
    NeonAPI.upsert("settings", [{
      id: 1,
      default_shipping_fee: s.shippingFee,
      free_shipping: s.freeShipping,
      paystack_public_key: s.paystackPublicKey || ""
    }], "id").catch(e => console.warn("Neon push (settings) failed:", e));
  },

  // ---- Cart ----
  // Each line is { productId, qty, color, selected } — `color` is optional,
  // so a product with no color options just omits it. Lines are matched by
  // productId + color together, so the same product in two different
  // colors is tracked as two separate lines. `selected` controls whether
  // a line is included when checking out — it defaults to true so newly
  // added items are checked out by default; a missing/undefined value on
  // older saved carts is also treated as selected.
  //
  // Carts are kept separate per shopper, keyed by their signed-in email
  // (see _currentCartOwner() above) — signing out and into a different
  // Google account always shows that account's own cart, never the
  // previous one. Items added while browsing as a guest (not signed in)
  // live under a shared "_guest" bucket until claimGuestCart() folds them
  // into that shopper's own cart right after they sign in.
  getCart() {
    const all = _read(DB_KEYS.CART, {});
    return all[_currentCartOwner()] || [];
  },
  saveCart(cart) {
    const all = _read(DB_KEYS.CART, {});
    all[_currentCartOwner()] = cart;
    _write(DB_KEYS.CART, all);
  },
  /** Called right after a shopper signs in (see Auth.handleGoogleCredential).
   *  Folds anything added to the cart before they signed in into their
   *  own account cart — merging quantities for a product+color already
   *  in their cart — then empties the shared guest bucket. A no-op if
   *  nobody's actually signed in yet, or the guest cart is empty. */
  claimGuestCart() {
    const owner = _currentCartOwner();
    if (owner === "_guest") return;
    const all = _read(DB_KEYS.CART, {});
    const guestLines = all["_guest"] || [];
    if (!guestLines.length) return;
    const ownerLines = all[owner] || [];
    guestLines.forEach(gLine => {
      const existing = ownerLines.find(c => c.productId === gLine.productId && (c.color || null) === (gLine.color || null));
      if (existing) existing.qty += gLine.qty; else ownerLines.push(gLine);
    });
    all[owner] = ownerLines;
    all["_guest"] = [];
    _write(DB_KEYS.CART, all);
  },
  addToCart(productId, qty = 1, color = null) {
    const cart = this.getCart();
    const line = cart.find(c => c.productId === productId && (c.color || null) === (color || null));
    if (line) line.qty += qty; else cart.push({ productId, qty, color: color || null, selected: true });
    this.saveCart(cart);
  },
  updateCartQty(productId, qty, color = null) {
    let cart = this.getCart();
    if (qty <= 0) {
      cart = cart.filter(c => !(c.productId === productId && (c.color || null) === (color || null)));
    } else {
      const line = cart.find(c => c.productId === productId && (c.color || null) === (color || null));
      if (line) line.qty = qty;
    }
    this.saveCart(cart);
  },
  removeFromCart(productId, color = null) {
    this.saveCart(this.getCart().filter(c => !(c.productId === productId && (c.color || null) === (color || null))));
  },
  /** Checks/unchecks a single cart line — this is what the checkbox next
   *  to each item in the cart controls. */
  setLineSelected(productId, color, selected) {
    const cart = this.getCart();
    const line = cart.find(c => c.productId === productId && (c.color || null) === (color || null));
    if (line) { line.selected = !!selected; this.saveCart(cart); }
  },
  clearCart() { this.saveCart([]); },
  /** Removes only the checked/selected lines from the cart after a
   *  successful order — anything left unchecked stays in the cart. */
  clearSelectedFromCart() {
    this.saveCart(this.getCart().filter(c => c.selected === false));
  },
  cartWithDetails() {
    const products = this.getProducts();
    return this.getCart().map(line => {
      const p = products.find(pr => pr.id === line.productId);
      return p ? { ...line, selected: line.selected !== false, product: p } : null;
    }).filter(Boolean);
  },
  /** Only the lines whose checkbox is ticked — this is what gets bought. */
  selectedCartWithDetails() {
    return this.cartWithDetails().filter(l => l.selected);
  },
  cartCount() { return this.getCart().reduce((sum, c) => sum + c.qty, 0); },
  cartSubtotal() {
    return this.cartWithDetails().reduce((sum, c) => sum + c.product.price * c.qty, 0);
  },
  /** Subtotal of just the checked/selected cart lines — used for the
   *  checkout button total and the actual amount charged. */
  selectedCartSubtotal() {
    return this.selectedCartWithDetails().reduce((sum, c) => sum + c.product.price * c.qty, 0);
  },

  // ---- Orders ----
  getOrders() { return _read(DB_KEYS.ORDERS, []); },
  getOrdersForUser(email) { return this.getOrders().filter(o => o.customerEmail === email); },
  getOrder(id) { return this.getOrders().find(o => o.id === id) || null; },
  createOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    _write(DB_KEYS.ORDERS, orders);
    if (NeonAPI.isConfigured()) {
      NeonAPI.upsert("orders", [{
        id: order.id,
        customer_email: order.customerEmail,
        customer_name: order.customerName,
        phone: order.phone,
        whatsapp: order.whatsapp || null,
        address: order.address,
        city: order.city || null,
        state: order.state || null,
        country: order.country || null,
        subtotal: order.subtotal,
        shipping_fee: order.shippingFee,
        total: order.total,
        status: order.status || "paid",
        paystack_ref: order.paystackRef || order.id
      }], "id")
        .then(() => {
          const items = (order.items || []).map(it => ({
            order_id: order.id, product_id: it.id, product_name: it.name,
            price: it.price, qty: it.qty, color: it.color || null
          }));
          if (items.length) {
            // Plain insert (not upsert) — order_items has no natural key
            // to upsert on, and each order is only ever created once.
            return fetch(`${GOLDENEDGE_CONFIG.NEON_DATA_API_URL}/order_items`, {
              method: "POST",
              headers: NeonAPI.headers({ "Prefer": "return=minimal" }),
              body: JSON.stringify(items)
            }).then(async res => { if (!res.ok) throw new Error(`Neon POST order_items → ${res.status} ${await _neonErrorDetail(res)}`); });
          }
        })
        .catch(e => console.warn("Neon push (order) failed:", e));
    }
    return order;
  },
  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const o = orders.find(x => x.id === id);
    if (o) {
      o.status = status;
      _write(DB_KEYS.ORDERS, orders);
      if (NeonAPI.isConfigured()) {
        fetch(`${GOLDENEDGE_CONFIG.NEON_DATA_API_URL}/orders?id=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: NeonAPI.headers({ "Prefer": "return=minimal" }),
          body: JSON.stringify({ status })
        }).then(async res => { if (!res.ok) throw new Error(`Neon PATCH orders → ${res.status} ${await _neonErrorDetail(res)}`); })
          .catch(e => console.warn("Neon push (order status) failed:", e));
      }
    }
  },

  // ---- Notifications (admin → shoppers announcements) ----
  // A notification with no `targetEmail` goes to every signed-in shopper
  // ("All members"); one with a `targetEmail` only ever shows up for that
  // Gmail address.
  getNotifications() { return _read(DB_KEYS.NOTIFICATIONS, []); },
  sendNotification({ title, message, targetEmail }) {
    const notifications = this.getNotifications();
    const note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      message: message.trim(),
      targetEmail: targetEmail ? targetEmail.trim().toLowerCase() : null,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(note);
    _write(DB_KEYS.NOTIFICATIONS, notifications);
    return note;
  },
  deleteNotification(id) {
    _write(DB_KEYS.NOTIFICATIONS, this.getNotifications().filter(n => n.id !== id));
  },
  /** The notifications a specific signed-in shopper should see: broadcasts
   *  to everyone, plus anything sent directly to their Gmail address. */
  getNotificationsForUser(email) {
    const normalized = (email || "").trim().toLowerCase();
    return this.getNotifications().filter(n => !n.targetEmail || n.targetEmail === normalized);
  },
  getReadNotificationIds() { return _read(DB_KEYS.NOTIFICATIONS_READ, []); },
  markAllNotificationsRead(ids) {
    const existing = new Set(this.getReadNotificationIds());
    (ids || this.getNotifications().map(n => n.id)).forEach(id => existing.add(id));
    _write(DB_KEYS.NOTIFICATIONS_READ, Array.from(existing));
  },
  /** Total unread count across every notification — used in the admin view. */
  unreadNotificationCount() {
    const read = new Set(this.getReadNotificationIds());
    return this.getNotifications().filter(n => !read.has(n.id)).length;
  },
  /** Unread count for one signed-in shopper (broadcasts + notes sent to them). */
  unreadNotificationCountForUser(email) {
    const read = new Set(this.getReadNotificationIds());
    return this.getNotificationsForUser(email).filter(n => !read.has(n.id)).length;
  }
};

DB.init();
DB.pullFromNeon(); // fire-and-forget background refresh — see the big comment on NeonAPI above
