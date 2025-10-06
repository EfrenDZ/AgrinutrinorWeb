const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  ssl: { "rejectUnauthorized": true }
});

app.get('/api/marcas', (req, res) => {
    const sql = "SELECT id, nombre FROM marca ORDER BY nombre ASC";
    pool.query(sql, (err, results) => {
        if (err) {

            console.error("ERROR DETALLADO EN /api/marcas:", err);
            return res.status(500).json({ error: 'Error en el servidor al obtener marcas.' });
        }
        res.json(results);
    });
});

// api/server

app.get('/api/categorias', (req, res) => {
    const { marca } = req.query;


    if (!marca) {
        const sql = "SELECT id, nombre FROM categoria ORDER BY nombre ASC";
        pool.query(sql, (err, results) => {
            if (err) {
                console.error("Error en /api/categorias (general):", err);
                return res.status(500).json({ error: 'Error en el servidor al obtener categorías.' });
            }
            res.json(results);
        });
    } else {
 
        const sql = `
            SELECT DISTINCT c.id, c.nombre 
            FROM categoria c
            JOIN productos p ON c.id = p.categoria
            WHERE p.marca IN (?)
            ORDER BY c.nombre ASC
        `;
        pool.query(sql, [marca], (err, results) => {
            if (err) {
                console.error("Error en /api/categorias (filtrado):", err);
                return res.status(500).json({ error: 'Error en el servidor al obtener categorías filtradas.' });
            }
            res.json(results);
        });
    }
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
    
    if (marca) {
        baseQuery += ' AND p.marca IN (?)';
        params.push(marca);
    }
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
    
    const finalParamsProductos = [...params, productosPorPagina, offset];

    pool.query(sqlTotal, params, (errTotal, resTotal) => {
        if (errTotal) {
            console.error("ERROR DETALLADO EN /api/productos (total):", errTotal);
            return res.status(500).json({ error: 'Error al contar productos.' });
        }

        const totalProductos = resTotal[0].total;
        const totalPaginas = Math.ceil(totalProductos / productosPorPagina);

        pool.query(sqlProductos, finalParamsProductos, (errProductos, resProductos) => {
            if (errProductos) {
                console.error("ERROR DETALLADO EN /api/productos (lista):", errProductos);
                return res.status(500).json({ error: 'Error al obtener productos.' });
            }
            res.json({
                productos: resProductos,
                paginaActual: parseInt(page),
                totalPaginas: totalPaginas
            });
        });
    });
});


if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
    });
}

module.exports = app;