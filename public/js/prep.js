document.addEventListener('DOMContentLoaded', () => {

    const togglePrep = document.querySelector('.toggle-prep');
    const prepSideBar = document.querySelector('.prep-side-bar');

    if (togglePrep && prepSideBar) {
        togglePrep.addEventListener('click', () => {
        togglePrep.classList.toggle('show');
        prepSideBar.classList.toggle('show');
        console.log(prepSideBar)
    });
}});