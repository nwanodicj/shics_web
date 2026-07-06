document.addEventListener('DOMContentLoaded', () => {
  const toggleContact = document.querySelector('.toggle-contact');
  const firstScreen = document.querySelector('.first-screen');

  if (toggleContact && firstScreen) {
    toggleContact.addEventListener('click', () => {
      toggleContact.classList.toggle('show');
      firstScreen.classList.toggle('show');
    });
  }
});