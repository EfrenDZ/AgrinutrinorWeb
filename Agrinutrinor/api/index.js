const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

const connection = mysql.createConnection({
  host: 'tramway.proxy.rlwy.net',
  user: 'root',
  password: 'osLGMABFjMwwdjOaTmkStQTTxxcnnjfu',
  database: 'agrinutrinor',
  port: 21985
});

connection.connect(error => {
  if (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    return;
  }
  console.log('✅ Conexión exitosa a la base de datos.');
});

app.get('/api/marcas', (req, res) => {
    const sql = "SELECT id, nombre FROM marca ORDER BY nombre ASC";
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor al obtener marcas.' });
        res.json(results);
    });
});

app.get('/api/categorias', (req, res) => {
    const sql = "SELECT id, nombre FROM categoria ORDER BY nombre ASC";
    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor al obtener categorías.' });
        res.json(results);
    });
});

app.get('/api/productos', (req, res) => {
    const { page = 1, marca, categoria, search } = req.query;
    const productosPorPagina = 20;
    const offset = (parseInt(page) - 1) * productosPorPagina;

    let baseQuery = `
        FROM productos p
        JOIN categoria c ON p.categoria = c.id
        JOIN marca m ON p.marca = m.id
        WHERE p.activo = 1
    `;
    const params = [];
    
    // Si 'marca' existe, usa el operador IN para aceptar uno o varios valores
    if (marca) {
        baseQuery += ' AND p.marca IN (?)';
        params.push(marca);
    }
    // Lo mismo para 'categoria'
    if (categoria) {
        baseQuery += ' AND p.categoria IN (?)';
        params.push(categoria);
    }
    if (search) {
        baseQuery += ' AND p.nombre LIKE ?';
        params.push(`%${search}%`);
    }

    const sqlTotal = `SELECT COUNT(*) as total ${baseQuery}`;
    const sqlProductos = `
        SELECT p.*, c.nombre as categoria_nombre, m.nombre as marca_nombre 
        ${baseQuery} 
        LIMIT ? OFFSET ?`;
    
    // Los parámetros para la consulta de productos incluyen los de paginación
    const finalParamsProductos = [...params, productosPorPagina, offset];

    connection.query(sqlTotal, params, (errTotal, resTotal) => {
        if (errTotal) return res.status(500).json({ error: 'Error al contar productos.' });

        const totalProductos = resTotal[0].total;
        const totalPaginas = Math.ceil(totalProductos / productosPorPagina);

        connection.query(sqlProductos, finalParamsProductos, (errProductos, resProductos) => {
            if (errProductos) return res.status(500).json({ error: 'Error al obtener productos.' });
            res.json({
                productos: resProductos,
                paginaActual: parseInt(page),
                totalPaginas: totalPaginas
            });
        });
    });
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});