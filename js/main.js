/* ============================================================
   GOLDEN EDGE — SHARED UI (utility bar, header, category rail, footer,
   bottom nav bar, splash screen, toast). Every page includes this
   after store.js and auth.js, with a single mount point:
   <div id="site-header"></div>
   There is no Admin link anywhere in this file, on purpose — the
   dashboard is only reachable by visiting admin.html directly.

   Note: there is NO global sign-in gate here. Browsing (home, shop,
   product pages) is always open. Only the specific pages that need
   an account — cart, checkout, orders, notifications, account — call
   Auth.requireLogin() themselves (see js/auth.js), which sends
   someone to login.html if they haven't signed in at all.
   ============================================================ */

const Toast = {
  show(message, ms = 2600) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), ms);
  }
};

/** All prices and payments are in Naira. */
function formatMoney(amount) {
  const n = Number(amount || 0);
  return `${GOLDENEDGE_CONFIG.CURRENCY_SYMBOL}${n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Turns a saved order into a plain-text message a shopper can send us on
 *  WhatsApp with their full order details, and the matching wa.me link.
 *  Used right after checkout (order-success.html) and again from "My
 *  Orders" for any past order. */
function buildOrderWhatsAppMessage(order) {
  const itemLines = order.items.map((item, i) =>
    `${i + 1}. ${item.name}${item.color ? ` (${item.color})` : ""} × ${item.qty} — ${formatMoney(item.price * item.qty)}`
  ).join("\n");
  return [
    "Hi Golden Edge, here are my order details:",
    "",
    `Order ID: ${order.id}`,
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.customerEmail}`,
    `Address: ${order.address}, ${order.city}, ${order.state}${order.country ? `, ${order.country}` : ""}`,
    "",
    "Items:",
    itemLines,
    "",
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Shipping: ${order.shippingFee === 0 ? "FREE" : formatMoney(order.shippingFee)}`,
    `Total: ${formatMoney(order.total)}`,
    `Payment reference: ${order.paystackRef || order.id}`
  ].join("\n");
}
function buildOrderWhatsAppLink(order) {
  return `https://wa.me/${GOLDENEDGE_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderWhatsAppMessage(order))}`;
}

/** Fades out and removes the splash screen. Every page has its own
 *  <div id="splashScreen"> markup (so it's visible instantly on first
 *  paint, before any script runs) — this just hides it once the page
 *  is ready. */
function hideSplashScreen() {
  const el = document.getElementById("splashScreen");
  if (!el) return;
  setTimeout(() => {
    el.classList.add("splash-hide");
    setTimeout(() => el.remove(), 500);
  }, 650);
}

function currentPageName() {
  const p = window.location.pathname.split("/").pop();
  return p || "index.html";
}

/** Shows the user's Google profile picture if they have one, otherwise a
 *  circle avatar with the first letter of their Gmail address. */
function renderAvatar(user) {
  if (!user) return "";
  if (user.picture) {
    return `<img src="${user.picture}" alt="${user.name}" class="avatar-circle" style="object-fit:cover;">`;
  }
  const initial = (user.email || user.name || "?").trim().charAt(0).toUpperCase();
  return `<span class="avatar-circle">${initial}</span>`;
}

/** The cart badge only ever shows a signed-in shopper's own count. A
 *  guest can still add items to cart from a product card (they get
 *  folded into that shopper's account cart the moment they sign in —
 *  see DB.claimGuestCart() in store.js), but the badge stays empty
 *  until then, so a returning guest's old/unclaimed cart never shows
 *  up as a mystery number while nobody's signed in. */
function visibleCartCount() {
  return Auth.currentUser() ? DB.cartCount() : 0;
}

function renderHeader() {
  // The admin dashboard lives in /server and has its own navigation, so
  // the shopper header (whose links are relative to /public) is skipped.
  if (currentPageName() === "admin.html") return;
  const mount = document.getElementById("site-header");
  if (!mount) return;
  const user = Auth.currentUser();
  const notifCount = user ? DB.unreadNotificationCountForUser(user.email) : 0;
  const params = new URLSearchParams(window.location.search);
  const activeCategory = params.get("category") || "";
  const navLink = (href, label) => `<a href="${href}" style="font-size:12.5px;font-weight:700;">${label}</a>`;

  mount.innerHTML = `
    <div class="util-bar">
      <div class="wrap">
        <div class="util-links">
          ${navLink("products.html", "Shop all")}
          ${navLink("orders.html", "Track order")}
        </div>
        <div class="util-links">
          <a href="cart.html">🚚 Fast delivery, easy shopping</a>
        </div>
      </div>
    </div>

    <header class="site-header">
      <div class="wrap">
        <div class="header-row1">
          <a href="index.html" class="logo-mark">
            <img src="assets/logo.png" alt="Golden Edge logo">
            <span class="brand-font">GOLDEN <em>EDGE</em></span>
          </a>
          <div class="header-actions">
            <a href="notifications.html" class="cart-icon-wrap" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;color:var(--navy);"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span id="notif-count" class="cart-badge" style="${notifCount ? "" : "display:none;"}">${notifCount}</span>
              Alerts
            </a>
            ${user ? `<a href="account.html" class="header-avatar-link" aria-label="My account">${renderAvatar(user)}</a>` : `<a href="login.html" class="header-avatar-link" aria-label="Sign in">${BOTTOM_NAV_ICONS.account}</a>`}
            <a href="cart.html" class="cart-icon-wrap" aria-label="View cart">
              <span style="font-size:18px;">🛒</span>
              <span id="cart-count" class="cart-badge" style="${visibleCartCount() ? "" : "display:none;"}">${visibleCartCount()}</span>
              Cart
            </a>
          </div>
        </div>
        <div class="header-row2">
          <form class="search-bar" id="site-search-form" onsubmit="return false;">
            <input type="text" id="site-search-input" placeholder="Search cars, phones, laptops…">
            <button type="submit" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/></svg></button>
          </form>
        </div>
      </div>
    </header>

    <nav class="category-rail">
      <div class="wrap" id="category-rail-track"></div>
    </nav>
  `;

  const track = document.getElementById("category-rail-track");
  const allChip = `
    <button data-cat="" class="${activeCategory === "" ? "active" : ""}">
      <span>All</span>
    </button>
  `;
  const categoryChips = CATEGORIES.map(c => `
    <button data-cat="${c}" class="${activeCategory === c ? "active" : ""}">
      <span>${c}</span>
    </button>
  `).join("");
  track.innerHTML = allChip + categoryChips;
  track.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      window.location.href = cat ? `products.html?category=${encodeURIComponent(cat)}` : "products.html";
    });
  });

  document.getElementById("site-search-form")?.addEventListener("submit", () => {
    const q = document.getElementById("site-search-input").value.trim();
    window.location.href = "products.html" + (q ? `?q=${encodeURIComponent(q)}` : "");
  });
  const existingQuery = params.get("q");
  if (existingQuery) {
    const input = document.getElementById("site-search-input");
    if (input) input.value = existingQuery;
  }
}

function renderFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  mount.innerHTML = `
    <div class="wrap">
      <div class="cols">
        <div>
          <div class="logo-mark" style="margin-bottom:10px;">
            <img src="assets/logo.png" alt="Golden Edge logo" style="height:34px;">
            <span class="brand-font" style="color:#fff;">GOLDEN <em style="color:var(--gold);">EDGE</em></span>
          </div>
          <p style="max-width:38ch;color:#a9b7c4;font-size:.85rem;">Fast delivery, easy shopping. Cars, electronics, bikes and home &amp; kitchen appliances, delivered to your door — payments in Naira.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <a href="products.html">All products</a>
          <a href="cart.html">Cart</a>
          <a href="orders.html">My orders</a>
        </div>
        <div>
          <h4>Customer care</h4>
          <a href="account.html">My account</a>
          <a href="orders.html">Track order</a>
          <a href="help.html">Shipping info</a>
          <a href="help.html">Help center</a>
        </div>
        <div>
          <h4>About</h4>
          <a href="about.html">About Golden Edge</a>
          <a href="help.html">Help &amp; Support</a>
          <a href="privacy.html">Privacy Policy</a>
          <p style="color:#a9b7c4;font-size:.83rem;max-width:30ch;margin-top:6px;">Every order you place is saved to your account and visible under My Orders.</p>
        </div>
      </div>
      <div class="footer-bottom">&copy; ${new Date().getFullYear()} Golden Edge. All rights reserved.</div>
    </div>
  `;
}

function refreshCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const count = visibleCartCount();
  el.textContent = count;
  el.style.display = count ? "" : "none";
  const bnEl = document.getElementById("bottom-nav-cart-count");
  if (bnEl) {
    bnEl.textContent = count;
    bnEl.style.display = count ? "" : "none";
  }
}

/** Floating WhatsApp button — only on the About and Help pages, links
 *  straight to a chat. Sits above the bottom nav bar so the two never
 *  overlap. */
function renderWhatsAppFloat() {
  const page = currentPageName();
  if (page !== "about.html" && page !== "help.html") return;
  if (document.getElementById("whatsapp-float")) return;
  const number = GOLDENEDGE_CONFIG.WHATSAPP_NUMBER;
  const message = encodeURIComponent("Hi Golden Edge, I have a question about your products");
  const a = document.createElement("a");
  a.id = "whatsapp-float";
  a.className = "whatsapp-float";
  a.href = `https://wa.me/${number}?text=${message}`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", "Chat with us on WhatsApp");
  a.innerHTML = `<svg viewBox="0 0 32 32"><path fill="#fff" d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.703 4.607 1.912 6.472L4 29l7.72-1.877A11.94 11.94 0 0 0 16.001 27C22.629 27 28 21.627 28 15S22.629 3 16.001 3zm0 21.818c-1.94 0-3.744-.57-5.26-1.55l-.377-.24-4.583 1.114 1.128-4.47-.246-.394A9.77 9.77 0 0 1 5.182 15c0-5.964 4.855-10.818 10.819-10.818S26.818 9.036 26.818 15 21.965 24.818 16.001 24.818zm5.98-8.132c-.328-.164-1.94-.957-2.241-1.066-.301-.11-.52-.164-.739.164-.219.328-.848 1.066-1.04 1.285-.191.219-.383.246-.71.082-.328-.164-1.386-.51-2.64-1.63-.976-.87-1.635-1.946-1.827-2.274-.191-.328-.02-.505.144-.668.148-.147.328-.383.492-.574.164-.191.219-.328.328-.547.11-.219.055-.41-.027-.574-.082-.164-.739-1.782-1.013-2.44-.267-.64-.539-.553-.739-.563l-.63-.011a1.21 1.21 0 0 0-.876.41c-.301.328-1.15 1.124-1.15 2.741 0 1.617 1.177 3.18 1.341 3.399.164.219 2.318 3.54 5.617 4.964.785.339 1.397.541 1.874.692.787.25 1.503.215 2.07.13.631-.094 1.94-.793 2.213-1.559.273-.766.273-1.422.191-1.559-.082-.137-.301-.219-.629-.383z"/></svg>`;
  document.body.appendChild(a);
}

const BOTTOM_NAV_ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9"/></svg>`,
  category: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none"/><path d="M2.5 3h2l2.2 11.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6"/></svg>`,
  account: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.4-3.8 4.5-5.8 7.5-5.8s6.1 2 7.5 5.8"/></svg>`
};

/** Fixed white pill bar at the bottom of the screen — Home, Category,
 *  Cart, and Account (the account tab shows the same avatar as the
 *  header, or an initial when there's no profile picture). Shown on
 *  every shopper-facing page; hidden on the admin dashboard, which has
 *  its own tab navigation. */
function renderBottomNav() {
  if (currentPageName() === "admin.html") return;
  if (document.getElementById("bottom-nav")) return;
  const user = Auth.currentUser();
  const page = currentPageName();
  const count = visibleCartCount();

  const tabs = [
    { href: "index.html", label: "Home", icon: BOTTOM_NAV_ICONS.home, active: page === "index.html" },
    { href: "products.html", label: "Category", icon: BOTTOM_NAV_ICONS.category, active: page === "products.html" || page === "product.html" },
    { href: "cart.html", label: "Cart", icon: BOTTOM_NAV_ICONS.cart, active: page === "cart.html", badge: true },
    { href: user ? "account.html" : "login.html", label: "Account", icon: user ? null : BOTTOM_NAV_ICONS.account, active: page === "account.html" }
  ];

  const nav = document.createElement("nav");
  nav.id = "bottom-nav";
  nav.className = "bottom-nav";
  nav.innerHTML = tabs.map(t => `
    <a href="${t.href}" class="${t.active ? "active" : ""}" aria-label="${t.label}" title="${t.label}">
      <span class="bn-icon">
        ${t.icon ? t.icon : renderAvatar(user) || BOTTOM_NAV_ICONS.category}
        ${t.badge ? `<span id="bottom-nav-cart-count" class="bn-badge" style="${count ? "" : "display:none;"}">${count}</span>` : ""}
      </span>
    </a>
  `).join("");
  document.body.appendChild(nav);
}

/** Shared product card markup — used on the home page, shop page, cart
 *  page, and account page so "goods" look and behave the same everywhere. */
function productCardHTML(p) {
  const low = p.stock > 0 && p.stock <= 3;
  return `
    <div class="product-card">
      <a href="product.html?id=${encodeURIComponent(p.id)}" class="product-thumb">
        ${p.stock === 0 ? `<span class="product-badge">Out of stock</span>` : p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
        ${typeof isVideoSrc === "function" && isVideoSrc(p.image)
          ? `<video src="${p.image}" muted loop autoplay playsinline></video>`
          : `<img src="${p.image}" alt="${p.name}" loading="lazy">`}
        ${low ? `<span class="stock-badge-low">Only ${p.stock} left</span>` : ""}
      </a>
      <div class="product-body">
        <span class="product-cat">${p.category}</span>
        <h3 class="product-name"><a href="product.html?id=${encodeURIComponent(p.id)}" style="color:inherit;">${p.name}</a></h3>
        <span class="product-price mono">${formatMoney(p.price)}</span>
        <button class="add-btn" ${p.stock === 0 ? "disabled" : ""} onclick="addProductToCart('${p.id}')">Add to cart</button>
      </div>
    </div>
  `;
}

function addProductToCart(id) {
  DB.addToCart(id, 1);
  refreshCartCount();
  Toast.show("Added to cart");
}

/** Renders a "Goods" grid into any container — used below the checkout
 *  button on the cart page and below the account details on the account
 *  page, as well as the home/shop pages. Excludes IDs already shown
 *  elsewhere on the same page when `excludeIds` is given. */
function renderGoodsGrid(containerId, options) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const exclude = new Set((options && options.excludeIds) || []);
  const limit = (options && options.limit) || 10;
  const products = DB.getProducts().filter(p => !exclude.has(p.id)).slice(0, limit);
  el.innerHTML = products.map(productCardHTML).join("");
}

/** Daily 24-hour countdown. Follows the shopper's real clock: at 12:00 AM
 *  it shows 24:00:00, and it counts down to 00:00:00 at the next midnight
 *  (11:59:59 PM shows 00:00:01), then starts again from 24:00:00. It is
 *  recalculated from the clock every second, so it never drifts and stays
 *  correct if the tab was sleeping. Used by the home banner and by the
 *  "Goods price will be updated in" bars on the cart and checkout pages. */
function startFlashCountdown(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  function tick() {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const remaining = Math.max(0, Math.ceil((nextMidnight - now) / 1000));
    const h = Math.floor(remaining / 3600).toString().padStart(2, "0");
    const m = Math.floor((remaining % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(remaining % 60).toString().padStart(2, "0");
    el.innerHTML = `<span class="box">${h}</span>:<span class="box">${m}</span>:<span class="box">${s}</span>`;
  }
  tick();
  setInterval(tick, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  renderWhatsAppFloat();
  renderBottomNav();
  hideSplashScreen();
});
