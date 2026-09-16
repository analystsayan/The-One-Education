/* ===================================================================
   Tailwind configuration + theme switching.
   Loaded on every page, immediately after the Tailwind CDN script.
   =================================================================== */

tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50:  '#f5f7fa',
          100: '#e9edf3',
          200: '#cfd8e3',
          300: '#a7b6c9',
          400: '#7888a8',
          500: '#546787',
          600: '#40516c',
          700: '#334158',
          800: '#1c2742',
          900: '#111b30',
          950: '#0a1120'
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      maxWidth: { content: '68rem' }
    }
  }
};

/* -------------------------------------------------------------------
   Theme switcher — light / dark, remembered between visits.
   The initial class is applied inline in <head> to avoid a flash of
   the wrong theme; this file handles toggling afterwards.
------------------------------------------------------------------- */
const Theme = {
  KEY: 'toe-theme',

  current() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  },

  apply(mode) {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    try { localStorage.setItem(Theme.KEY, mode); } catch (_) {}
    Theme.syncButtons();
  },

  toggle() {
    Theme.apply(Theme.current() === 'dark' ? 'light' : 'dark');
  },

  /** Updates every theme button's icon and label. */
  syncButtons() {
    const dark = Theme.current() === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      btn.innerHTML = dark ? Theme.ICON_SUN : Theme.ICON_MOON;
    });
  },

  ICON_SUN: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path stroke-linecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  ICON_MOON: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>`
};

window.Theme = Theme;
