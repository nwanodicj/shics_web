document.addEventListener('DOMContentLoaded', () => {

    const toggleNursery = document.querySelector('.toggle-nursery');
    const prepSideBar = document.querySelector('.prep-side-bar');

    if (toggleNursery && prepSideBar) {
        toggleNursery.addEventListener('click', () => {
        toggleNursery.classList.toggle('show');
        prepSideBar.classList.toggle('show');
        console.log(prepSideBar)
    });
}});