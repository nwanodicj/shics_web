document.addEventListener('DOMContentLoaded', () => {
  const selector = document.getElementById('languageSelector');
  const supported = ['en', 'es', 'fr'];

  // Built-in fallback translations (used when server files are not present)
  const fallback = {
    en: {
      'footer.officeAddress': 'Office Address',
      'footer.contactUs': 'Contact Us'
    },
    es: {
      'footer.officeAddress': 'Dirección de la oficina',
      'footer.contactUs': 'Contáctenos'
    },
    fr: {
      'footer.officeAddress': 'Adresse du bureau',
      'footer.contactUs': "Contactez-nous"
    }
  };

  async function loadServerTranslations(lang) {
    try {
      const res = await fetch(`/i18n/${lang}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error('No server translations');
      const data = await res.json();
      return data;
    } catch (e) {
      return null;
    }
  }

  async function applyLang(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('siteLang', lang);

    // try server first, fallback to built-in
    const server = await loadServerTranslations(lang);
    const translations = server || fallback[lang] || fallback.en;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations && translations[key]) {
        el.textContent = translations[key];
      }
    });

    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    // If the app supports server-side localization, reload with lang param.
    // To enable server-driven localization, set `window.SERVER_I18N = true` in a script.
    if (window.SERVER_I18N) {
      try {
        const url = new URL(window.location.href);
        const current = url.searchParams.get('lang')
        if (current !== lang) {
          url.searchParams.set('lang', lang);
          // force reload to allow server to render localized content
          window.location.href = url.toString();
          return // stop further client-side processing as page will reload
        }
      } catch (e) {
        // if URL parsing fails, fall back to no reload
      }
    }
  }

  window.changeLanguage = applyLang;

  // initialize selector and value
  const stored = localStorage.getItem('siteLang') || (navigator.language || 'en').split('-')[0];
  const initial = supported.includes(stored) ? stored : 'en';

  if (selector) {
    // ensure options match supported list (in case templates differ)
    const existing = Array.from(selector.options).map(o => o.value);
    if (JSON.stringify(existing) !== JSON.stringify(supported.slice(0, existing.length))) {
      // leave existing label text but ensure supported values are present
      selector.innerHTML = supported.map(s => {
        const label = s === 'en' ? 'English' : s === 'es' ? 'Español' : 'Français';
        return `<option value="${s}">${label}</option>`;
      }).join('');
    }

    selector.value = initial;
    selector.addEventListener('change', (e) => {
      applyLang(e.target.value);
    });
  }

  // apply initial language
  applyLang(initial);
});
