const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Se usa createPool y se renombra la variable a 'pool'
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST, // Asegúrate que las variables de entorno estén en Vercel
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

// ESTE BLOQUE SE HA ELIMINADO PORQUE NO ES COMPATIBLE CON createPool
/*
connection.connect(error => {
  if (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    return;
  }
  console.log('✅ Conexión exitosa a la base de datos.');
});
*/

app.get('/api/marcas', (req, res) => {
    const sql = "SELECT id, nombre FROM marca ORDER BY nombre ASC";
    // Se usa pool.query
    pool.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor al obtener marcas.' });
        res.json(results);
    });
});

app.get('/api/categorias', (req, res) => {
    const sql = "SELECT id, nombre FROM categoria ORDER BY nombre ASC";
    pool.query(sql, (err, results) => {
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
        if (errTotal) return res.status(500).json({ error: 'Error al contar productos.' });

        const totalProductos = resTotal[0].total;
        const totalPaginas = Math.ceil(totalProductos / productosPorPagina);

        pool.query(sqlProductos, finalParamsProductos, (errProductos, resProductos) => {
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