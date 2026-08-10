// AUTO-COMMENT: File Overview - public/js/secondary.js
// Purpose: Source file: implementation details for this application.
document.addEventListener('DOMContentLoaded', () => {

    const toggleSecondary = document.querySelector('.toggle-secondary');
    const prepSideBar = document.querySelector('.prep-side-bar');

    if (toggleSecondary && prepSideBar) {
        toggleSecondary.addEventListener('click', () => {
        toggleSecondary.classList.toggle('show');
        prepSideBar.classList.toggle('show');
        console.log(prepSideBar)
    });
}});