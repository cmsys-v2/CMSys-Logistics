/**
 * Direct-preview session helpers.
 *
 * The preview environment is meant to drop straight into the command deck, so
 * when there is no session we silently authenticate with the demo PIN instead
 * of stopping at the login wall. Signing out (or visiting `?login=1`) restores
 * the normal gate.
 */

export const GATE_COOKIE = "cmsys_gate";
export const DIRECT_PREVIEW_KEY = "cmsys-direct-preview";
export const LAST_USER_KEY = "cmsys-last-user";
export const DEFAULT_DIRECT_USER = "KMAU Kahandawa";
export const DEMO_PIN = "1234";

export function isDirectPreviewEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (new URLSearchParams(window.location.search).get("login") === "1") return false;
    if (document.cookie.split("; ").some((c) => c === `${GATE_COOKIE}=1`)) return false;
    return window.localStorage.getItem(DIRECT_PREVIEW_KEY) !== "off";
  } catch {
    return true;
  }
}

/** Re-arm the secure sign-in gate (used on sign-out). */
export function armLoginGate(): void {
  try {
    document.cookie = `${GATE_COOKIE}=1; path=/; max-age=2592000; samesite=lax`;
    window.localStorage.setItem(DIRECT_PREVIEW_KEY, "off");
  } catch {
    /* ignore */
  }
}

export function lastUsername(): string {
  if (typeof window === "undefined") return DEFAULT_DIRECT_USER;
  try {
    return window.localStorage.getItem(LAST_USER_KEY) || DEFAULT_DIRECT_USER;
  } catch {
    return DEFAULT_DIRECT_USER;
  }
}

export function rememberUsername(username: string): void {
  try {
    window.localStorage.setItem(LAST_USER_KEY, username);
    window.localStorage.setItem(DIRECT_PREVIEW_KEY, "on");
  } catch {
    /* storage unavailable — ignore */
  }
}

export function disableDirectPreview(): void {
  try {
    window.localStorage.setItem(DIRECT_PREVIEW_KEY, "off");
  } catch {
    /* ignore */
  }
}
