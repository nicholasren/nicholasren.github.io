/**
 * Language Toggle — switches the site between English (en) and Chinese (zh).
 * Language preference is persisted in localStorage.
 *
 * How to use in posts:
 *   Wrap English content in:   <div class="lang-en">...</div>
 *   Wrap Chinese content in:   <div class="lang-zh">...</div>
 *
 *   Add a Chinese title to a post's frontmatter:
 *     title_zh: "文章标题"
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'preferred-lang';

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch (e) {
      return 'en';
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function applyLang(lang) {
    var html = document.documentElement;
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

    // Update toggle button label
    var btn = document.getElementById('lang-toggle-btn');
    if (btn) {
      btn.textContent = lang === 'zh' ? 'EN' : '中';
      btn.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
    }

    // Swap post title if a Chinese title was provided via data attributes
    var titleEl = document.querySelector('.post-title[data-title-zh]');
    if (titleEl) {
      titleEl.textContent =
        lang === 'zh'
          ? titleEl.getAttribute('data-title-zh')
          : titleEl.getAttribute('data-title-en');
    }

    // Show a "translation coming soon" notice when viewing a post in Chinese
    // but the post has no .lang-zh content blocks
    var notice = document.getElementById('no-translation-notice');
    if (notice) {
      var hasZhContent = document.querySelectorAll('.post-content .lang-zh').length > 0;
      notice.style.display = (lang === 'zh' && !hasZhContent) ? 'block' : 'none';
    }
  }

  /** Called by the toggle button's onclick handler */
  window.toggleLanguage = function () {
    var next = getStoredLang() === 'en' ? 'zh' : 'en';
    setStoredLang(next);
    applyLang(next);
  };

  // Apply language as soon as the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyLang(getStoredLang());
    });
  } else {
    applyLang(getStoredLang());
  }
}());
