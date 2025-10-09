document.addEventListener('DOMContentLoaded', () => {
    // Definición de variables globales y constantes
    const apiUrlBase = '/api';
    const productContainer = document.getElementById('productos-container');
    const paginationControls = document.getElementById('pagination-controls');
    const brandCarousel = document.getElementById('brand-carousel');
    const brandFiltersContainer = document.getElementById('filtro-marcas-container');
    const categoryFiltersContainer = document.getElementById('filtro-categorias-container');
    const searchInput = document.getElementById('search-input');
    const productsTitle = document.getElementById('productos-titulo');
    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    let debounceTimeout;
    let CargaInicial = true;

    // Muestra esqueletos de tarjetas de productos
    function mostrarSkeletonsDeProductos(cantidad = 8) {
        let skeletonsHtml = '';
        for (let i = 0; i < cantidad; i++) {
            skeletonsHtml += `
                <div class="col-12 col-md-4 col-xl-3 d-flex align-items-stretch">
                    <div class="skeleton-card w-100">
                        <div class="skeleton skeleton-image"></div>
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text skeleton-text-short"></div>
                        <div class="skeleton skeleton-text"></div>
                    </div>
                </div>
            `;
        }
        productContainer.innerHTML = skeletonsHtml;
    }
    
    // Pobla el carrusel y los filtros de marcas
    function poblarFiltroMarcas() {
        return fetch(`${apiUrlBase}/marcas`).then(res => res.json())
            .then(marcas => {
                const splideList = document.querySelector('#brand-carousel .splide__list');
                if (!splideList) return;

                splideList.innerHTML = '';
                brandFiltersContainer.innerHTML = '<h4>Marca</h4>';
                marcas.forEach(marca => {
                    const slide = document.createElement('li');
                    slide.className = 'splide__slide';
                    const pill = document.createElement('a');
                    pill.href = "#";
                    pill.textContent = marca.nombre;
                    pill.dataset.marcaId = marca.id;
                    pill.className = 'brand-pill';
                    slide.appendChild(pill);
                    splideList.appendChild(slide);

                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'form-check';
                    checkboxDiv.innerHTML = `<input class="form-check-input" type="checkbox" value="${marca.id}" id="marca-${marca.id}"><label class="form-check-label" for="marca-${marca.id}">${marca.nombre}</label>`;
                    brandFiltersContainer.appendChild(checkboxDiv);
                });
                new Splide('#brand-carousel', {
                    type: 'slide',
                    perPage: 5,
                    perMove: 1,
                    gap: '1rem',
                    pagination: false,
                    padding: { left: 0, right: '5rem' },
                    breakpoints: {
                        992: { perPage: 4 },
                        768: { perPage: 3 },
                        576: { perPage: 2, padding: { right: '3rem' } },
                    },
                }).mount();
            });
    }

    // Pobla los filtros de categorías por primera vez
    function poblarFiltroCategorias() {
        const sql = `${apiUrlBase}/categorias`;
        return fetch(sql).then(res => res.json())
            .then(categorias => {
                categoryFiltersContainer.innerHTML = '<h4>Categoría</h4>';
                categorias.forEach(cat => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'form-check';
                    checkboxDiv.innerHTML = `<input class="form-check-input" type="checkbox" value="${cat.id}" id="cat-${cat.id}"><label class="form-check-label" for="cat-${cat.id}">${cat.nombre}</label>`;
                    categoryFiltersContainer.appendChild(checkboxDiv);
                });
            });
    }

    // Actualiza los filtros de marcas (ocultando/mostrando)
    function actualizarFiltroMarcas() {
        const categoriasSeleccionadas = Array.from(categoryFiltersContainer.querySelectorAll('input:checked')).map(chk => chk.value);
        let url = `${apiUrlBase}/marcas`;
        
        if (categoriasSeleccionadas.length > 0) {
            const params = new URLSearchParams();
            categoriasSeleccionadas.forEach(id => params.append('categoria', id));
            url += `?${params.toString()}`;
        }

        return fetch(url).then(res => res.json())
            .then(marcasValidas => {
                const idsValidos = new Set(marcasValidas.map(m => m.id.toString()));
                const todosLosCheckboxesDeMarca = brandFiltersContainer.querySelectorAll('.form-check');

                todosLosCheckboxesDeMarca.forEach(checkboxDiv => {
                    const checkboxInput = checkboxDiv.querySelector('input');
                    if (idsValidos.has(checkboxInput.value)) {
                        checkboxDiv.style.display = 'block';
                    } else {
                        checkboxDiv.style.display = 'none';
                    }
                });
            });
    }

    // Actualiza los filtros de categorías (ocultando/mostrando)
    function actualizarFiltroCategorias() {
        const marcasSeleccionadas = Array.from(brandFiltersContainer.querySelectorAll('input:checked')).map(chk => chk.value);
        let url = `${apiUrlBase}/categorias`;
        
        if (marcasSeleccionadas.length > 0) {
            const params = new URLSearchParams();
            marcasSeleccionadas.forEach(id => params.append('marca', id));
            url += `?${params.toString()}`;
        }

        return fetch(url).then(res => res.json())
            .then(categoriasValidas => {
                const idsValidos = new Set(categoriasValidas.map(c => c.id.toString()));
                const todosLosCheckboxesDeCategoria = categoryFiltersContainer.querySelectorAll('.form-check');

                todosLosCheckboxesDeCategoria.forEach(checkboxDiv => {
                    const checkboxInput = checkboxDiv.querySelector('input');
                    if (idsValidos.has(checkboxInput.value)) {
                        checkboxDiv.style.display = 'block';
                    } else {
                        checkboxDiv.style.display = 'none';
                    }
                });
            });
    }

    // Carga los productos desde la API
    function cargarProductos(page = 1) {
        mostrarSkeletonsDeProductos();
        if (!CargaInicial) {
        productContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
        CargaInicial = false;

        const params = new URLSearchParams({ page });
        brandFiltersContainer.querySelectorAll('input:checked').forEach(chk => params.append('marca', chk.value));
        categoryFiltersContainer.querySelectorAll('input:checked').forEach(chk => params.append('categoria', chk.value));
        if (searchInput.value) params.append('search', searchInput.value);

        const activePill = brandCarousel.querySelector('a.active');
        productsTitle.textContent = (activePill?.textContent || 'TODOS LOS PRODUCTOS');

        fetch(`${apiUrlBase}/productos?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                if (!data.productos || data.productos.length === 0) {
                    productContainer.innerHTML = '<p class="text-center col-12">No se encontraron productos con estos filtros.</p>';
                    crearPaginacion(0, 0);
                    return;
                }

                const allCardsHtml = data.productos.map(producto => {
                    const imagenHtml = producto.imagen
                        ? `<img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">`
                        : `<div class="textoCard card-img-top placeholder-img">${producto.nombre}</div>`;
                    
                    const fichaTecnicaButton = producto.fichaTecnica
                        ? `<a href="${producto.fichaTecnica}" target="_blank" rel="noopener noreferrer" class="card-button etiqueta3">Ficha técnica</a>`
                        : '';

                    return `
                        <div class="col-12 col-md-4 col-xl-3 d-flex align-items-stretch">
                            <div class="card w-100">
                                ${imagenHtml}
                                <div class="card-body">
                                    <p class="card-text">
                                        <strong>Ingrediente Activo:</strong>
                                        <span class="ingredientes-lista">${producto.ingredienteActivo}</span> 
                                        <br/><strong>Presentación:</strong><br/>
                                        ${producto.presentacion}<br>
                                        <br/><strong>Categoría:</strong><br/>
                                        ${producto.categoria_nombre}
                                    </p>
                                    ${fichaTecnicaButton}
                                </div>
                            </div>
                        </div>`;
                }).join('');

                productContainer.innerHTML = allCardsHtml;
                crearPaginacion(data.totalPaginas, data.paginaActual);
            })
            .catch(error => console.error('Error:', error));
    }
    
    // Crea los controles de paginación
    function crearPaginacion(totalPages, currentPage) {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;

        let ul = document.createElement('ul');
        ul.className = 'pagination';

        const crearBoton = (texto, pageNum, isDisabled = false, isActive = false) => {
            let li = document.createElement('li');
            li.className = 'page-item';
            if (isDisabled) li.classList.add('disabled');
            if (isActive) li.classList.add('active');
            let a = document.createElement('a');
            a.className = 'page-link';
            a.textContent = texto;
            if (!isDisabled) {
                a.href = '#';
                a.onclick = (e) => {
                    e.preventDefault();
                    cargarProductos(pageNum);
                };
            }
            li.appendChild(a);
            return li;
        };

        ul.appendChild(crearBoton('«', 1, currentPage === 1));
        ul.appendChild(crearBoton('‹', currentPage - 1, currentPage === 1));

        const maxPaginasVisibles = 5;
        let inicio, fin;

        if (totalPages <= maxPaginasVisibles) {
            inicio = 1;
            fin = totalPages;
        } else {
            let offset = Math.floor(maxPaginasVisibles / 2);
            inicio = currentPage - offset;
            fin = currentPage + offset;
            if (inicio < 1) {
                fin += (1 - inicio);
                inicio = 1;
            }
            if (fin > totalPages) {
                inicio -= (fin - totalPages);
                fin = totalPages;
            }
        }
        
        if (inicio > 1) {
           ul.appendChild(crearBoton('...', inicio > 2 ? currentPage - 2 : 1));
        }

        for (let i = inicio; i <= fin; i++) {
            ul.appendChild(crearBoton(i, i, false, i === currentPage));
        }
        
        if (fin < totalPages) {
            ul.appendChild(crearBoton('...', fin < totalPages - 1 ? currentPage + 2 : totalPages));
        }

        ul.appendChild(crearBoton('›', currentPage + 1, currentPage === totalPages));
        ul.appendChild(crearBoton('»', totalPages, currentPage === totalPages));

        paginationControls.appendChild(ul);
    }

    // Ejecuta la carga de productos con un retardo
    function onFilterChange() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            cargarProductos(1);
        }, 500);
    }

    // Maneja clic en el carrusel de marcas
    brandCarousel.addEventListener('click', e => {
        if (e.target.tagName !== 'A') return;
        e.preventDefault();
        const wasActive = e.target.classList.contains('active');
        brandCarousel.querySelectorAll('a').forEach(pill => pill.classList.remove('active'));
        brandFiltersContainer.querySelectorAll('input').forEach(chk => chk.checked = false);
        if (!wasActive) {
            e.target.classList.add('active');
            const checkbox = document.getElementById(`marca-${e.target.dataset.marcaId}`);
            if (checkbox) checkbox.checked = true;
        }
        actualizarFiltroCategorias();
        onFilterChange();
    });
    
    // Maneja cambio en los filtros de marca
    brandFiltersContainer.addEventListener('change', () => {
        brandCarousel.querySelectorAll('a').forEach(pill => pill.classList.remove('active'));
        actualizarFiltroCategorias();
        onFilterChange();
    });

    // Maneja cambio en los filtros de categoría
    categoryFiltersContainer.addEventListener('change', () => {
        actualizarFiltroMarcas();
        onFilterChange();
    });

    // Maneja escritura en el campo de búsqueda
    searchInput.addEventListener('keyup', onFilterChange);
    
    // Maneja clic en el botón de limpiar filtros
    btnLimpiar.addEventListener('click', () => {
        searchInput.value = '';
        brandCarousel.querySelectorAll('a').forEach(pill => pill.classList.remove('active'));
        document.querySelectorAll('.sidebar-filters input:checked').forEach(chk => chk.checked = false);
        // Muestra todos los filtros de nuevo
        document.querySelectorAll('.sidebar-filters .form-check').forEach(el => el.style.display = 'block');
        cargarProductos(1);
    });

    // Función de inicialización
    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const marcaIdDesdeUrl = urlParams.get('marca');
        const categoriaIdDesdeUrl = urlParams.get('categoria');
    
        await poblarFiltroMarcas();
        await poblarFiltroCategorias(); 
    
        const sidebarFiltros = document.querySelector('.sidebar-filters');
        if (sidebarFiltros) {
            sidebarFiltros.classList.add('cargado');
        }

        if (marcaIdDesdeUrl) {
            const checkboxMarca = brandFiltersContainer.querySelector(`input[value="${marcaIdDesdeUrl}"]`);
            if (checkboxMarca) {
                checkboxMarca.checked = true;
                const pill = brandCarousel.querySelector(`a[data-marca-id="${marcaIdDesdeUrl}"]`);
                if (pill) pill.classList.add('active');
                await actualizarFiltroCategorias();
            }
        }
    
        if (categoriaIdDesdeUrl) {
            const checkboxCategoria = categoryFiltersContainer.querySelector(`input[value="${categoriaIdDesdeUrl}"]`);
            if (checkboxCategoria) {
                checkboxCategoria.checked = true;
                await actualizarFiltroMarcas();
            }
        }
    
        cargarProductos(1);
        history.replaceState(null, '', window.location.pathname);
    }

    // Ejecuta la inicialización
    init();
});