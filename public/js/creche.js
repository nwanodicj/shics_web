// AUTO-COMMENT: File Overview - public/js/creche.js
// Purpose: Source file: implementation details for this application.
document.addEventListener('DOMContentLoaded', () => {

    const toggleCreche = document.querySelector('.toggle-creche');
    const prepSideBar = document.querySelector('.prep-side-bar');

    if (toggleCreche && prepSideBar) {
        toggleCreche.addEventListener('click', () => {
        toggleCreche.classList.toggle('show');
        prepSideBar.classList.toggle('show');
        console.log(prepSideBar)
    });
}});