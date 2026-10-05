// ==UserScript==
// @name         Ejudge Auto Login
// @namespace    https://ejudge.kruzhokinf.com/
// @version      1.0.0
// @description  Автоматический ввод email и вход на ejudge.kruzhokinf.com
// @homepageURL  https://github.com/kash-ts/autologin-ejudge.kruzhokinf
// @supportURL   https://github.com/kash-ts/autologin-ejudge.kruzhokinf/issues
// @updateURL    https://raw.githubusercontent.com/kash-ts/autologin-ejudge.kruzhokinf/main/ejudge-autologin.user.js
// @downloadURL  https://raw.githubusercontent.com/kash-ts/autologin-ejudge.kruzhokinf/main/ejudge-autologin.user.js
// @match        https://ejudge.kruzhokinf.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'ejudge_user_email';
  const ATTEMPT_KEY = 'ejudge_login_attempt';

  function getStoredEmail() {
    return GM_getValue(STORAGE_KEY, '');
  }

  function promptForEmail() {
    const current = getStoredEmail();
    const entered = window.prompt('Введите свой email:', current);
    if (entered !== null) {
      const trimmed = entered.trim();
      if (trimmed) {
        GM_setValue(STORAGE_KEY, trimmed);
        return trimmed;
      }
    }
    return current;
  }

  GM_registerMenuCommand('Настроить email', () => {
    const updated = promptForEmail();
    if (updated) {
      const emailInput = document.querySelector('input[name="email"], input[type="email"]');
      if (emailInput) {
        emailInput.value = updated;
      }
    }
  });

  function run() {
    const form = document.querySelector('form[action="/login"], form');
    if (!form) return;

    const emailInput = form.querySelector('input[name="email"], input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (!emailInput || !submitBtn) return;

    const lastAttempt = sessionStorage.getItem(ATTEMPT_KEY);
    const now = Date.now();
    if (lastAttempt && now - Number(lastAttempt) < 5000) {
      return;
    }

    let email = getStoredEmail();
    if (!email) {
      email = promptForEmail();
    }
    if (!email) return;

    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));

    sessionStorage.setItem(ATTEMPT_KEY, String(now));
    submitBtn.click();
  }

  run();
})();
