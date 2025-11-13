const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Al estar muy cerca de la parte de arriba, se muestra la navbar
    if (currentScrollY <= 15) {
        navbar.classList.remove('navbar-hidden');
        return;
    }

    // al hacer scroll abajo se oculta la navbar
    if (currentScrollY > lastScrollY) {
        navbar.classList.add('navbar-hidden');
    } else {
        // scroll arriba muestra la navbar
        navbar.classList.remove('navbar-hidden');
    }

    // para actualizar la última posición del scroll
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
