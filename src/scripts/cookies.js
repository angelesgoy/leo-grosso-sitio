const STORAGE_KEY = 'leo-cookie-consent-v1';
const CONSENT_VERSION = 1;
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;

const banner = document.getElementById('cookie-banner');
const preferences = document.getElementById('cookie-preferences');
const analyticsInput = document.querySelector('[data-cookie-category="analytics"]');
const externalInput = document.querySelector('[data-cookie-category="external"]');

const defaultConsent = () => ({
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  external: false,
  updatedAt: new Date().toISOString()
});

function readConsent() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!value || value.version !== CONSENT_VERSION || !value.updatedAt) return null;
    if (Date.now() - Date.parse(value.updatedAt) > MAX_AGE) return null;
    return { ...defaultConsent(), ...value, necessary: true };
  } catch {
    return null;
  }
}

function applyConsent(consent) {
  document.documentElement.dataset.consentAnalytics = String(consent.analytics);
  document.documentElement.dataset.consentExternal = String(consent.external);
  window.leoConsent = Object.freeze({ ...consent });
  window.dispatchEvent(new CustomEvent('leo:consentchange', { detail: window.leoConsent }));
}

function persistConsent(consent) {
  const next = { ...defaultConsent(), ...consent, necessary: true, updatedAt: new Date().toISOString() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Se aplica solo durante la sesión. */ }
  applyConsent(next);
  if (banner) banner.hidden = true;
  preferences?.close();
}

function syncInputs(consent = readConsent() || defaultConsent()) {
  if (analyticsInput instanceof HTMLInputElement) analyticsInput.checked = consent.analytics;
  if (externalInput instanceof HTMLInputElement) externalInput.checked = consent.external;
}

function openPreferences() {
  if (!(preferences instanceof HTMLDialogElement)) return;
  syncInputs();
  preferences.showModal();
}

const storedConsent = readConsent();
applyConsent(storedConsent || defaultConsent());
if (banner && !storedConsent) banner.hidden = false;

document.querySelectorAll('[data-cookie-accept]').forEach((button) => {
  button.addEventListener('click', () => persistConsent({ analytics: true, external: true }));
});
document.querySelectorAll('[data-cookie-reject], [data-cookie-dialog-reject]').forEach((button) => {
  button.addEventListener('click', () => persistConsent({ analytics: false, external: false }));
});
document.querySelectorAll('[data-cookie-configure], [data-cookie-settings]').forEach((button) => {
  button.addEventListener('click', openPreferences);
});
document.querySelectorAll('[data-cookie-close]').forEach((button) => {
  button.addEventListener('click', () => preferences?.close());
});
document.querySelectorAll('[data-cookie-save]').forEach((button) => {
  button.addEventListener('click', () => persistConsent({
    analytics: analyticsInput instanceof HTMLInputElement && analyticsInput.checked,
    external: externalInput instanceof HTMLInputElement && externalInput.checked
  }));
});
preferences?.addEventListener('click', (event) => {
  if (event.target === preferences) preferences.close();
});

