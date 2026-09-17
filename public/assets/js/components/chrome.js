/* ===================================================================
   Shared site chrome — one header and one footer, used by every page.
   Change them here and both pages update.
   =================================================================== */

const Site = {
  name: 'The One Education',
  domain: 'quiz-the-one-education.vercel.app',
  nav: [
    { label: 'Home',     href: '/' },
    { label: 'Quiz', href: '/quiz' }
  ]
};

/** Marks the current page's nav link. */
function isActive(href) {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return href === path;
}

function renderHeader() {
  const links = Site.nav.map(item => `
    <a href="${item.href}"
       class="px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${isActive(item.href)
                ? 'text-ink-900 dark:text-white bg-ink-100 dark:bg-ink-800'
                : 'text-ink-500 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white'}">
      ${item.label}
    </a>`).join('');

  return `
  <header class="sticky top-0 z-40 border-b border-ink-200/70 dark:border-ink-800
                 bg-white/85 dark:bg-ink-950/85 backdrop-blur-md">
    <div class="mx-auto max-w-content px-5 h-16 flex items-center justify-between gap-4">

      <a href="/" class="flex items-center gap-2.5 group shrink-0">
        <span class="grid place-items-center w-9 h-9 rounded-xl bg-ink-900 dark:bg-amber-500
                     text-amber-400 dark:text-ink-950 font-display font-bold text-lg">1</span>
        <span class="leading-tight">
          <span class="block font-display font-semibold text-ink-900 dark:text-white text-[15px]">
            The One Education
          </span>
          <span class="block text-[11px] text-ink-400 dark:text-ink-400 tracking-wide">
            Practice Portal
          </span>
        </span>
      </a>

      <nav class="flex items-center gap-1">
        ${links}
        <button data-theme-toggle
                class="ml-1 grid place-items-center w-9 h-9 rounded-lg
                       text-ink-500 dark:text-ink-300
                       hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"></button>
      </nav>

    </div>
  </header>`;
}

function renderFooter() {
  const year = new Date().getFullYear();
  const links = Site.nav.map(item =>
    `<a href="${item.href}" class="hover:text-ink-900 dark:hover:text-white transition-colors">${item.label}</a>`
  ).join('');

  return `
  <footer class="mt-auto border-t border-ink-200/70 dark:border-ink-800
                 bg-ink-50/60 dark:bg-ink-950">
    <div class="mx-auto max-w-content px-5 py-10">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

        <div>
          <div class="flex items-center gap-2.5">
            <span class="grid place-items-center w-8 h-8 rounded-lg bg-ink-900 dark:bg-amber-500
                         text-amber-400 dark:text-ink-950 font-display font-bold">1</span>
            <span class="font-display font-semibold text-ink-900 dark:text-white">
              The One Education
            </span>
          </div>
          <p class="mt-3 text-sm text-ink-500 dark:text-ink-400 max-w-sm">
            Practice papers for Indian government and private-sector recruitment exams.
          </p>
        </div>

        <nav class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
          ${links}
          <a href="https://theoneeducation.com" class="hover:text-ink-900 dark:hover:text-white transition-colors">
            Main site
          </a>
        </nav>

      </div>

      <div class="mt-8 pt-6 border-t border-ink-200/70 dark:border-ink-800
                  flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2
                  text-xs text-ink-400 dark:text-ink-500">
        <p>&copy; ${year} The One Education. All rights reserved.</p>
        <p>${Site.domain}</p>
      </div>
    </div>
  </footer>`;
}

/** Injects the chrome into #site-header and #site-footer. */
function mountChrome() {
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  if (header) header.innerHTML = renderHeader();
  if (footer) footer.innerHTML = renderFooter();

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => Theme.toggle());
  });
  Theme.syncButtons();
}

document.addEventListener('DOMContentLoaded', mountChrome);
