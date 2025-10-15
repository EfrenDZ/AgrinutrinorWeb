document.addEventListener('DOMContentLoaded', function () {
    new Splide('#mi-carrusel', {
        type: 'loop',
        drag: 'free',
        focus: 'center',
        // pantallas grandes
        perPage: 4, 
        perMove:4,
        gap: "1rem",

        // Configuración para dispositivos móviles
        breakpoints: {
            768: { // Cuando la pantalla es de 768px
                perPage: 1, // Muestra 1 elemento
                speed: 3,
                perMove: 1,

            }
        },

        autoScroll: {
            speed: 1.5,
        },
        arrows: true, 
        pagination: false,
    }).mount(window.splide.Extensions);

    new Splide('#mi-carrusel-marcas', {
        type   : 'loop',    
        perPage: 4,         
        perMove: 1,       
        breakpoints: { 
            768: {
                perPage: 1.5,
                gap: ".5rem",
            },
        },

        autoScroll: {
            speed: 2,
        },
        arrows: false, 
        pagination: false,

        
    }).mount(window.splide.Extensions);
});