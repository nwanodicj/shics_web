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