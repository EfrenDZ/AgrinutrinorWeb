const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Si estás muy cerca de la parte superior, siempre muestra la navbar
    if (currentScrollY <= 10) {
        navbar.classList.remove('navbar-hidden');
        return;
    }

    // Si bajas el scroll, oculta la navbar
    if (currentScrollY > lastScrollY) {
        navbar.classList.add('navbar-hidden');
    } else {
        // Si subes el scroll, muestra la navbar
        navbar.classList.remove('navbar-hidden');
    }

    // Actualiza la última posición de scroll
    lastScrollY = currentScrollY;
});