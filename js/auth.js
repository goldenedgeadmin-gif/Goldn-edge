/* ============================================================
   GOLDEN EDGE — AUTH
   Browsing the site (home, shop, product pages) never requires an
   account. A shopper only reaches login.html when they choose to, or
   when a page that needs an account sends them there: cart,
   checkout, orders, notifications, and the account page.

   login.html signs shoppers in with Google only, using Google's own
   Identity Services widget — both an automatic silent sign-in
   (One Tap, for a returning shopper whose browser already remembers a
   Google session) and Google's official rendered button as the
   visible way in (see Auth.startGoogleSignIn() below). There is no
   manual/typed-email fallback.

   There is no onboarding step. When someone signs in, the site uses
   the real name and profile picture from their Google account
   straight away, greets them by that name, and sends them straight to
   the page they wanted. Country and date of birth are optional and
   can be added later under Account → Edit profile; checkout asks for
   the delivery country itself.

   The admin dashboard is separate and NOT reachable through any
   link in the site — see server/js/admin.js for its
   username/password lock, which is the only door into it.
   ============================================================ */

const MIN_SIGNUP_AGE = 15;

const Auth = {
  currentUser() {
    try {
      const raw = localStorage.getItem("goldenedge_session");
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  _decodeJwt(token) {
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
      );
      return JSON.parse(json);
    } catch (e) {
      console.error("Failed to decode Google credential", e);
      return null;
    }
  },

  /**
   * Called when Google returns a credential on login.html. Signs the
   * shopper straight in using the name and picture from their Gmail
   * account (or the details they've since saved under Edit profile),
   * then calls `onReady`. There is no onboarding step.
   */
  handleGoogleCredential(response, onReady) {
    const payload = this._decodeJwt(response.credential);
    if (!payload || !payload.email) {
      if (typeof Toast !== "undefined") Toast.show("Could not read your Google account. Please try again.");
      else console.error("Could not read your Google account credential.");
      return;
    }
    const existing = DB.getUserProfile(payload.email) || {};
    const user = {
      email: payload.email,
      name: existing.fullName || payload.name || payload.email.split("@")[0],
      picture: existing.picture || payload.picture || "",
      dob: existing.dob || "",
      country: existing.country || "",
      countryCode: existing.countryCode || "",
      dialCode: existing.dialCode || "",
      profileComplete: true,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem("goldenedge_session", JSON.stringify(user));
    DB.claimGuestCart();
    DB.saveUserProfile(user.email, {
      fullName: user.name, picture: user.picture, dob: user.dob,
      country: user.country, countryCode: user.countryCode, dialCode: user.dialCode,
      profileComplete: true
    });
    if (typeof onReady === "function") onReady(user);
  },

  /** Saves the shopper's name, picture, date of birth and country
   *  (used by Account → Edit profile). */
  completeProfile({ fullName, picture, dob, country }) {
    const u = this.currentUser();
    if (!u) return null;
    const countryInfo = getCountryByName(country);
    const updated = {
      ...u,
      name: fullName,
      picture: picture || u.picture || "",
      dob: dob,
      country: country,
      countryCode: countryInfo ? countryInfo.code : "",
      dialCode: countryInfo ? countryInfo.dial : "",
      profileComplete: true
    };
    localStorage.setItem("goldenedge_session", JSON.stringify(updated));
    DB.saveUserProfile(u.email, {
      fullName: updated.name,
      picture: updated.picture,
      dob: updated.dob,
      country: updated.country,
      countryCode: updated.countryCode,
      dialCode: updated.dialCode,
      profileComplete: true
    });
    return updated;
  },

  /** Whole years between a date-of-birth string (YYYY-MM-DD) and today. */
  calculateAge(dobString) {
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  },

  /** Google sign-in — the only way in. Renders Google's own official
   *  button (black pill, matching Google's "Sign in with Google"
   *  branding guidelines) into `buttonElementId`, and also tries
   *  Google's silent automatic sign-in (One Tap) in the background —
   *  so a returning shopper whose browser already remembers a Google
   *  session gets signed in without touching the button at all.
   *  `onUnavailable(reason)` fires only if One Tap couldn't show
   *  itself; the rendered button keeps working regardless, so there's
   *  always a visible way to sign in even when One Tap can't run
   *  (incognito, an in-app browser like WhatsApp's, etc).
   *
   *  use_fedcm_for_button / use_fedcm_for_prompt: opts into Google's
   *  newer FedCM-based sign-in flow (supported on Chrome and other
   *  Chromium browsers). Without this, some mobile browsers get stuck
   *  on a blank accounts.google.com page right after picking an
   *  account — a known issue with Google's older popup-based flow and
   *  browsers that restrict third-party cookies, not something
   *  specific to this site. Harmless to leave on for browsers that
   *  don't support FedCM yet — Google's script falls back to the
   *  older flow automatically. */
  startGoogleSignIn(buttonElementId, callback, onUnavailable) {
    if (typeof google === "undefined" || !google.accounts) {
      if (typeof onUnavailable === "function") onUnavailable("script-not-loaded");
      return;
    }
    google.accounts.id.initialize({
      client_id: GOLDENEDGE_CONFIG.GOOGLE_CLIENT_ID,
      callback: callback,
      auto_select: true,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: true
    });
    const el = document.getElementById(buttonElementId);
    if (el) {
      google.accounts.id.renderButton(el, {
        type: "standard",
        theme: "filled_black",
        shape: "pill",
        size: "large",
        text: "signin_with",
        logo_alignment: "left",
        use_fedcm_for_button: true
      });
    }
    google.accounts.id.prompt((notification) => {
      const notDisplayed = notification.isNotDisplayed && notification.isNotDisplayed();
      const skipped = notification.isSkippedMoment && notification.isSkippedMoment();
      if ((notDisplayed || skipped) && typeof onUnavailable === "function") {
        const reason = notDisplayed
          ? (notification.getNotDisplayedReason ? notification.getNotDisplayedReason() : "not_displayed")
          : (notification.getSkippedReason ? notification.getSkippedReason() : "skipped");
        onUnavailable(reason);
      }
    });
  },

  signOut() {
    localStorage.removeItem("goldenedge_session");
    if (typeof google !== "undefined" && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    window.location.href = "index.html";
  },

  /** Sends a guest to login.html if they're not signed in at all. Pages
   *  that need an account — cart, checkout, orders, notifications,
   *  account — call this themselves. */
  requireLogin(redirectTo) {
    const u = this.currentUser();
    const target = redirectTo || (window.location.pathname.split("/").pop() || "index.html");
    if (!u) {
      window.location.href = `login.html?redirect=${encodeURIComponent(target)}`;
      return null;
    }
    if (!u.profileComplete) {
      // Older sessions from before onboarding was removed: just upgrade them.
      u.profileComplete = true;
      localStorage.setItem("goldenedge_session", JSON.stringify(u));
    }
    return u;
  }
};
