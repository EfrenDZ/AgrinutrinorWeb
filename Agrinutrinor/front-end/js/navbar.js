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

const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .contacto-movil .etiqueta3');
    const navbarCollapse = document.getElementById('navbarNavDropdown');
    
    
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
      toggle: false 
    });

   
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
         
            if (navbarCollapse.classList.contains('show')) {
                bsCollapse.hide();
            }

      
            setTimeout(() => {
              
                if (window.scrollY > 10) {
                    navbar.classList.add('navbar-hidden');
                }
            }, 300); 
        });
    });
