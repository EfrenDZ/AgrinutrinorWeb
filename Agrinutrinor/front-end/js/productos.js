document.addEventListener('DOMContentLoaded', () => {
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

    function actualizarFiltroCategorias() {
        const marcasSeleccionadas = Array.from(brandFiltersContainer.querySelectorAll('input:checked')).map(chk => chk.value);
        let url = `${apiUrlBase}/categorias`;
        
        if (marcasSeleccionadas.length > 0) {
            const params = new URLSearchParams();
            marcasSeleccionadas.forEach(id => params.append('marca', id));
            url += `?${params.toString()}`;
        }

        fetch(url).then(res => res.json())
            .then(categorias => {
                const categoriasSeleccionadasAntes = new Set(Array.from(categoryFiltersContainer.querySelectorAll('input:checked')).map(chk => chk.value));
                categoryFiltersContainer.innerHTML = '<h4>Categoría</h4>';
                categorias.forEach(cat => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'form-check';
                    const isChecked = categoriasSeleccionadasAntes.has(cat.id.toString()) ? 'checked' : '';
                    checkboxDiv.innerHTML = `<input class="form-check-input" type="checkbox" value="${cat.id}" id="cat-${cat.id}" ${isChecked}><label class="form-check-label" for="cat-${cat.id}">${cat.nombre}</label>`;
                    categoryFiltersContainer.appendChild(checkboxDiv);
                });
            });
    }

    function cargarProductos(page = 1) {
    const params = new URLSearchParams({ page });
    brandFiltersContainer.querySelectorAll('input:checked').forEach(chk => {
        params.append('marca', chk.value);
    });
    categoryFiltersContainer.querySelectorAll('input:checked').forEach(chk => {
        params.append('categoria', chk.value);
    });
    if (searchInput.value) params.append('search', searchInput.value);

    const activePill = brandCarousel.querySelector('a.active');
    productsTitle.textContent = (activePill?.textContent || 'TODOS LOS PRODUCTOS');

    fetch(`${apiUrlBase}/productos?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            productContainer.innerHTML = '';
            if (!data.productos || data.productos.length === 0) {
                productContainer.innerHTML = '<p class="text-center col-12">No se encontraron productos con estos filtros.</p>';
                crearPaginacion(0, 0);
                return;
            }
            data.productos.forEach(producto => {
                // --- INICIO DE CAMBIOS ---

                // 1. Lógica para la imagen
                let imagenHtml;
                if (producto.imagen) {
                    // Si hay imagen, usa la etiqueta <img>
                    imagenHtml = `<img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">`;
                } else {
                    // Si NO hay imagen, usa un div con el nombre del producto
                    imagenHtml = `<div class="textoCard" class="card-img-top placeholder-img">${producto.nombre}</div>`;
                }

               
                let fichaTecnicaButton = ''; // Vacío por defecto
                if (producto.fichaTecnica) {
                   
                    fichaTecnicaButton = `<a href="${producto.fichaTecnica}" target="_blank" rel="noopener noreferrer" class="card-button etiqueta3">Ficha técnica</a>`;
                }

              
const cardHtml = `
    <div class="col-sm-6 col-lg-3 d-flex align-items-stretch">
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
                
                // --- FIN DE CAMBIOS ---
                productContainer.innerHTML += cardHtml;
            });
            crearPaginacion(data.totalPaginas, data.paginaActual);
        })
        .catch(error => console.error('Error:', error));
}
    
    function crearPaginacion(totalPages, currentPage) {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;
        let ul = document.createElement('ul');
        ul.className = 'pagination';
        for (let i = 1; i <= totalPages; i++) {
            let li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            let a = document.createElement('a');
            a.className = 'page-link';
            a.textContent = i;
            a.onclick = () => cargarProductos(i);
            li.appendChild(a);
            ul.appendChild(li);
        }
        paginationControls.appendChild(ul);
    }

    function onFilterChange() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            cargarProductos(1);
        }, 500);
    }

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
    
    brandFiltersContainer.addEventListener('change', () => {
        brandCarousel.querySelectorAll('a').forEach(pill => pill.classList.remove('active'));
        actualizarFiltroCategorias();
        onFilterChange();
    });

    categoryFiltersContainer.addEventListener('change', onFilterChange);
    searchInput.addEventListener('keyup', onFilterChange);
    
    btnLimpiar.addEventListener('click', () => {
        searchInput.value = '';
        brandCarousel.querySelectorAll('a').forEach(pill => pill.classList.remove('active'));
        document.querySelectorAll('.sidebar-filters input:checked').forEach(chk => chk.checked = false);
        actualizarFiltroCategorias();
        cargarProductos(1);
    });

    async function init() {
        await poblarFiltroMarcas();
        actualizarFiltroCategorias();

        const urlParams = new URLSearchParams(window.location.search);
        const marcaIdDesdeUrl = urlParams.get('marca');
        if (marcaIdDesdeUrl) {
            const pill = brandCarousel.querySelector(`a[data-marca-id="${marcaIdDesdeUrl}"]`);
            if (pill) pill.classList.add('active');
            const checkbox = brandFiltersContainer.querySelector(`input[value="${marcaIdDesdeUrl}"]`);
            if (checkbox) checkbox.checked = true;
            actualizarFiltroCategorias();
        }
        cargarProductos(1);
    }
    init();
});