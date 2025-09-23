
    // cargar marcas en el Dropdown del Navbar
    document.addEventListener('DOMContentLoaded', () => {
        const marcasDropdown = document.getElementById('marcas-dropdown');
        if (marcasDropdown) {
            fetch('/api/marcas')
                .then(response => response.json())
                .then(marcas => {
                    marcasDropdown.innerHTML = ''; // Limpiar por si acaso
                    marcas.forEach(marca => {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.className = 'dropdown-item';
                        // enlace a la página de productos
                        // id como parametro del url
                        a.href = `productos.html?marca=${marca.id}`;
                        a.textContent = marca.nombre;
                        li.appendChild(a);
                        marcasDropdown.appendChild(li);
                    });
                })
                .catch(error => console.error('Error al cargar marcas en el dropdown:', error));
        }
    });
document.addEventListener('DOMContentLoaded', function() {
    // Revisa si la URL actual tiene un "hash" (ej. #nosotros)
    if (window.location.hash) {
        // Obtiene el elemento al que apunta el hash
        const targetElement = document.querySelector(window.location.hash);

        // Si el elemento existe en la página
        if (targetElement) {
            // Usa el método scrollIntoView para un desplazamiento suave
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
});