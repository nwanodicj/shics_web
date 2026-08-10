// AUTO-COMMENT: File Overview - public/js/primary.js
// Purpose: Source file: implementation details for this application.
document.addEventListener('DOMContentLoaded', () => {

    const togglePrimary = document.querySelector('.toggle-primary');
    const prepSideBar = document.querySelector('.prep-side-bar');

    if (togglePrimary && prepSideBar) {
        togglePrimary.addEventListener('click', () => {
        togglePrimary.classList.toggle('show');
        prepSideBar.classList.toggle('show');
        console.log(prepSideBar)
    });
}});