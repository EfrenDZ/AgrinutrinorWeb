document.addEventListener('DOMContentLoaded', function () {
    new Splide('#mi-carrusel', {
        type: 'loop',
        drag: 'free',
        focus: 'center',
        
        // pantallas grandes
        perPage: 4, 

        // Configuración para dispositivos móviles
        breakpoints: {
            768: { // Cuando la pantalla es de 768px
                perPage: 1, // Muestra 1 elemento
            }
        },

        autoScroll: {
            speed: 2,
        },
        arrows: true, 
        pagination: false,
    }).mount(window.splide.Extensions);
});