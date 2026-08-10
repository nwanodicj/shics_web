// AUTO-COMMENT: File Overview - public/js/guardians.js
// Purpose: Source file: implementation details for this application.
document.addEventListener('DOMContentLoaded', () => {

    const toggleGuardians = document.querySelector('.toggle-guardians');
    const prepSideBar = document.querySelector('.prep-side-bar');

    if (toggleGuardians && prepSideBar) {
        toggleGuardians.addEventListener('click', () => {
        toggleGuardians.classList.toggle('show');
        prepSideBar.classList.toggle('show');
        console.log(prepSideBar)
    });
}});