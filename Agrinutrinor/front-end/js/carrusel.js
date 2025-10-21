/* === Contenido para tu archivo js/carrusel.js === */

document.addEventListener('DOMContentLoaded', function () {

    // --- 1. CARRUSEL DE CATEGORÍAS (ID: #mi-carrusel) ---
    new Splide('#mi-carrusel', {
        
        // --- Config. DESKTOP (Por defecto) ---
        // (Lo que se ve en pantallas GRANDES)
        perPage: 4,
        gap: '1rem',
        grid: false, // Grid desactivado en desktop
        arrows: true,
        pagination: false,
        
        // --- Config. MÓVIL (Puntos de quiebre) ---
        // (Lo que se ve en pantallas PEQUEÑAS)
        breakpoints: {
            // "Cuando la pantalla sea MÁS PEQUEÑA que 1200px..."
            1200: {
                perPage: 4,
            },
            
            // "Cuando la pantalla sea MÁS PEQUEÑA que 768px..."
            768: {
                grid: {         // Activa el grid
                    rows: 3,
                    cols: 2,
                    gap : {
                        row: '1.5rem',
                        col: '1rem'
                    }
                },
                perPage: 1,     // Muestra 1 "página" del grid
                arrows: true,
            }
        }
        
    }).mount(window.splide.Extensions);


    // --- 2. CARRUSEL DE MARCAS (ID: #mi-carrusel-marcas) ---
    // (Este ya estaba bien, pero incluyo la corrección de 'extensions')
    new Splide('#mi-carrusel-marcas', {
        type   : 'loop',    
        perPage: 4,         
        perMove: 1, 
        gap    : "0rem",      
        breakpoints: { 
            768: {
                perPage: 1.5,
                gap: ".5rem",
            },
        },

        // Corrección del AutoScroll
        extensions: {
            AutoScroll: {
                speed: 2,
                pauseOnHover: true,
            }
        },

        arrows: false, 
        pagination: false,
        
    }).mount(window.splide.Extensions);

});