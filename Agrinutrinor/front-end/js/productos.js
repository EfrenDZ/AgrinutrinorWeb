document.addEventListener('DOMContentLoaded', () => {
    const apiUrlBase = '/api'; //tomar la url de vercel
    
    const productContainer = document.getElementById('productos-container');
    const paginationControls = document.getElementById('pagination-controls');
    const brandPillsContainer = document.getElementById('brand-pills-container');
    const brandFiltersContainer = document.getElementById('filtro-marcas-container');
    const categoryFiltersContainer = document.getElementById('filtro-categorias-container');
    const searchInput = document.getElementById('search-input');
    const productsTitle = document.getElementById('productos-titulo');
    const btnLimpiar = document.getElementById('btn-limpiar-filtros');
    
    let debounceTimeout;

    function poblarFiltros() { //rellenar la parte de filtro
        return Promise.all([
            fetch(`${apiUrlBase}/marcas`).then(res => res.json()),
            fetch(`${apiUrlBase}/categorias`).then(res => res.json())
        ]).then(([marcas, categorias]) => {
            brandPillsContainer.innerHTML = '';
            brandFiltersContainer.innerHTML = '<h4>Marca</h4>'; // mete la marca con h4
            marcas.forEach(marca => {
                const pill = document.createElement('a');
                pill.href = "#";
                pill.textContent = marca.nombre;
                pill.dataset.marcaId = marca.id;
                brandPillsContainer.appendChild(pill);

                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'form-check';
                checkboxDiv.innerHTML = `<input class="form-check-input" type="checkbox" value="${marca.id}" id="marca-${marca.id}"><label class="form-check-label" for="marca-${marca.id}">${marca.nombre}</label>`;
                brandFiltersContainer.appendChild(checkboxDiv);
            });

            categoryFiltersContainer.innerHTML = '<h4>Categoría</h4>'; // mete la categoria con h4
            categorias.forEach(cat => {
                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'form-check';
                checkboxDiv.innerHTML = `<input class="form-check-input" type="checkbox" value="${cat.id}" id="cat-${cat.id}"><label class="form-check-label" for="cat-${cat.id}">${cat.nombre}</label>`;
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

        const activePill = brandPillsContainer.querySelector('a.active');
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
                    const cardHtml = `
                        <div class="col-sm-6 col-lg-3 mb-4 d-flex align-items-stretch">
                            <div class="card w-100">
                                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                                <div class="card-body">
                                    <h5 class="card-title">${producto.nombre}</h5>
                                    <p class="card-text">
                                        <strong>Ingrediente Activo:</strong> ${producto.ingredienteActivo}<br>
                                        <strong>Presentación:</strong> ${producto.presentacion}<br>
                                        <strong>Categoría:</strong> ${producto.categoria_nombre}
                                    </p>
                                </div>
                            </div>
                        </div>`;
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

    brandPillsContainer.addEventListener('click', e => {
        e.preventDefault();
        if (e.target.tagName !== 'A') return;

        const wasActive = e.target.classList.contains('active');
        brandPillsContainer.querySelectorAll('a').forEach(pill => pill.classList.remove('active'));
        brandFiltersContainer.querySelectorAll('input').forEach(chk => chk.checked = false);

        if (!wasActive) {
            e.target.classList.add('active');
            const correspondingCheckbox = document.getElementById(`marca-${e.target.dataset.marcaId}`);
            if (correspondingCheckbox) correspondingCheckbox.checked = true;
        }
        
        onFilterChange();
    });
    
    brandFiltersContainer.addEventListener('change', () => {
        brandPillsContainer.querySelectorAll('a').forEach(pill => pill.classList.remove('active'));
        onFilterChange();
    });

    categoryFiltersContainer.addEventListener('change', onFilterChange);
    searchInput.addEventListener('keyup', onFilterChange);
    
    btnLimpiar.addEventListener('click', () => {
        searchInput.value = '';
        brandPillsContainer.querySelectorAll('a').forEach(pill => pill.classList.remove('active'));
        document.querySelectorAll('.sidebar-filters input:checked').forEach(chk => chk.checked = false);
        cargarProductos(1);
    });

    async function init() {
        await poblarFiltros();

        const urlParams = new URLSearchParams(window.location.search);
        const marcaIdDesdeUrl = urlParams.get('marca');

        if (marcaIdDesdeUrl) {
            const pill = brandPillsContainer.querySelector(`a[data-marca-id="${marcaIdDesdeUrl}"]`);
            if (pill) pill.classList.add('active');

            const checkbox = brandFiltersContainer.querySelector(`input[value="${marcaIdDesdeUrl}"]`);
            if (checkbox) checkbox.checked = true;
        }

        cargarProductos(1);
    }

    init();
});