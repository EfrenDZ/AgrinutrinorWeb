document.addEventListener('DOMContentLoaded', function () {
    new Splide('#mi-carrusel', {
        type: 'loop',
        drag: 'free',
        focus: 'center',
        
        // Configuración para escritorios (pantallas grandes)
        perPage: 4, 

        // Configuración para dispositivos móviles
        breakpoints: {
            768: { // Cuando la pantalla es de 768px o menos
                perPage: 1, // Muestra solo 1 elemento
            }
        },

        autoScroll: {
            speed: 2,
        },
        arrows: true, 
        pagination: false,
    }).mount(window.splide.Extensions);
});