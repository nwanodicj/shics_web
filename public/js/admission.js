// AUTO-COMMENT: File Overview - public/js/admission.js
// Purpose: Source file: implementation details for this application.
document.addEventListener('DOMContentLoaded', () => {
  const toggleAdmission = document.querySelector('.toggle-admission');
  const firstScreen = document.querySelector('.first-screen');

  if (toggleAdmission && firstScreen) {
    toggleAdmission.addEventListener('click', () => {
      toggleAdmission.classList.toggle('show');
      firstScreen.classList.toggle('show');
    });
  }
});