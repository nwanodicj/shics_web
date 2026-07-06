/** Get the html element for modification **/ 
const navButton = document.querySelector('#ham-btn');
const navLinks = document.querySelector('#nav-links');
const toggleAboutUs = document.querySelector('.toggle-about-us');
const firstScreen = document.querySelector('.first-screen');

/**toggle the show class off and on ****/
navButton.addEventListener('click', () => {
   navButton.classList.toggle('show');
   navLinks.classList.toggle('show');
   console.log('navigation bar loaded.')
});

toggleAboutUs.addEventListener('click', () => {
   toggleAboutUs.classList.toggle('show');
   firstScreen.classList.toggle('show');
})