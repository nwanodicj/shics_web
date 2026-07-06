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