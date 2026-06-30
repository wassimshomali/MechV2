/**
 * Lightweight i18n for MoMech SPA
 * Default locale: fr-CA (Montreal pilot)
 */

const STORAGE_KEY = 'momech-locale';
const DEFAULT_LOCALE = 'fr-CA';
const FALLBACK_LOCALE = 'en-CA';

const localeData = {};
let currentLocale = DEFAULT_LOCALE;
const listeners = new Set();

/**
 * Initialize i18n — load locale files and saved preference
 */
export async function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const preferred = saved && ['fr-CA', 'en-CA'].includes(saved) ? saved : DEFAULT_LOCALE;

    await Promise.all([
        loadLocaleFile('fr-CA'),
        loadLocaleFile('en-CA'),
    ]);

    currentLocale = preferred;
    document.documentElement.lang = currentLocale;
}

async function loadLocaleFile(locale) {
    const response = await fetch(`src/i18n/${locale}.json`);
    if (!response.ok) {
        throw new Error(`Failed to load locale: ${locale}`);
    }
    localeData[locale] = await response.json();
}

export function getLocale() {
    return currentLocale;
}

export function setLocale(locale) {
    if (!localeData[locale] || locale === currentLocale) return;
    currentLocale = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    listeners.forEach((fn) => fn(locale));
}

export function onLocaleChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function resolve(obj, key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

export function t(key, params = {}) {
    let value = resolve(localeData[currentLocale], key);
    if (value === undefined) {
        value = resolve(localeData[FALLBACK_LOCALE], key);
    }
    if (value === undefined || typeof value !== 'string') {
        return key;
    }
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        params[name] !== undefined ? String(params[name]) : `{{${name}}}`
    );
}

export function tStatus(status) {
    if (!status) return '';
    const key = `status.${status}`;
    const translated = t(key);
    return translated !== key ? translated : status;
}

export function tPriority(priority) {
    if (!priority) return '';
    const key = `priority.${priority}`;
    const translated = t(key);
    return translated !== key ? translated : priority;
}

export default { init, getLocale, setLocale, onLocaleChange, t, tStatus, tPriority };
