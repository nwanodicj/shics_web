/**
 * dialogbox.js
 * -----------------------------------------
 * Lightweight dialog manager for inline <dialog> elements
 * Works with the dashboard section dialogs in views/index.ejs
 */

(function () {
  'use strict'

  function openDialog(dialog) {
    if (!dialog) return
    if (typeof dialog.showModal === 'function') {
      try { dialog.showModal() } catch (e) { dialog.setAttribute('open', '') }
    } else {
      dialog.setAttribute('open', '')
      dialog.classList.add('fallback-open')
    }
    // focus first focusable element inside dialog
    const focusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    if (focusable) focusable.focus()
  }

  function closeDialog(dialog) {
    if (!dialog) return
    if (typeof dialog.close === 'function') {
      dialog.close()
    } else {
      dialog.removeAttribute('open')
      dialog.classList.remove('fallback-open')
    }
  }

  // Attach open handlers to buttons placed alongside their dialog in the same <aside>
  function initOpenButtons() {
    const openButtons = document.querySelectorAll('.open-dialog, .open-dialogbox')
    openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        // Prefer finding a dialog within the same aside/container
        const aside = btn.closest('aside')
        let dialog = aside ? aside.querySelector('dialog') : null

        // Fallback: use mapping by id. If button has data-target, use it.
        if (!dialog) {
          const target = btn.dataset.target || (btn.id && btn.id.startsWith('open-') ? (btn.id.slice(5).toLowerCase() + '-dialogbox') : null)
          if (target) dialog = document.getElementById(target)
        }

        if (dialog) openDialog(dialog)
        else console.warn('dialogbox.js: no dialog found for', btn)
      })
    })
  }

  // Attach close handlers to buttons inside dialogs
  function initCloseButtons() {
    const closeButtons = document.querySelectorAll('.close-dialog')
    closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const dialog = btn.closest('dialog') || (btn.closest('aside') ? btn.closest('aside').querySelector('dialog') : null)
        if (dialog) closeDialog(dialog)
      })
    })
  }

  // Close dialog when clicking backdrop (native <dialog> behavior is not always consistent)
  function initBackdropClose() {
    document.querySelectorAll('dialog').forEach(d => {
      d.addEventListener('click', (e) => {
        if (e.target === d) closeDialog(d)
      })
      // allow Esc/cancel to close
      d.addEventListener('cancel', (e) => {
        // default behavior closes dialog; no action required
      })
    })
  }

  document.addEventListener('DOMContentLoaded', () => {
    initOpenButtons()
    initCloseButtons()
    initBackdropClose()
  })
})()
