document.addEventListener('DOMContentLoaded', () => {

    const togglePreNursery = document.querySelector('.toggle-pre-nursery');
    const prepSideBar = document.querySelector('.prep-side-bar');

    if (togglePreNursery && prepSideBar) {
        togglePreNursery.addEventListener('click', () => {
        togglePreNursery.classList.toggle('show');
        prepSideBar.classList.toggle('show');
        console.log(prepSideBar)
    });
}});