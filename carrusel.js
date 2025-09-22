document.addEventListener('DOMContentLoaded', function () {
  new Splide('#mi-carrusel', {
    type: 'loop',
    drag: 'free',
    focus: 'center',
    perPage: 3,
    autoScroll: {
      speed: 1,
    },
  }).mount(window.splide.Extensions);
});