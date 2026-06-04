const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API de Wiki Recetas funcionando correctamente.');
});

app.post('/api/login', async (req, res) => {
    const { correo, password } = req.body;
    
    try {
        const [users] = await db.query(
            'SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE correo = ? AND password_hash = ?', 
            [correo, password]
        );

        if (users.length > 0) {
            res.json({ exito: true, usuario: users[0] });
        } else {
            res.status(401).json({ exito: false, mensaje: 'Correo o contraseña incorrectos' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/recetas/destacadas', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.id_receta, r.titulo, c.nombre_categoria, u.nombre AS autor, IFNULL(AVG(co.calificacion), 0) AS promedio
            FROM recetas r
            LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
            LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
            LEFT JOIN comentarios co ON r.id_receta = co.id_receta
            GROUP BY r.id_receta
            ORDER BY promedio DESC
            LIMIT 3
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener destacadas' });
    }
});

app.get('/api/recetas', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.id_receta, r.titulo, r.instrucciones, r.tiempo_preparacion, r.porciones, 
                   r.id_usuario, /* <-- ESTO ES LO NUEVO */
                   c.nombre_categoria, u.nombre AS autor,
                   IFNULL(AVG(co.calificacion), 0) AS promedio
            FROM recetas r
            LEFT JOIN categorias c ON r.id_categoria = c.id_categoria
            LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
            LEFT JOIN comentarios co ON r.id_receta = co.id_receta
            GROUP BY r.id_receta
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las recetas' });
    }
});

app.post('/api/recetas', async (req, res) => {
    const { titulo, instrucciones, tiempo_preparacion, porciones, id_categoria, id_usuario } = req.body;
    
    try {
        const [result] = await db.query(
            `INSERT INTO recetas (titulo, instrucciones, tiempo_preparacion, porciones, id_categoria, id_usuario) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo, instrucciones, tiempo_preparacion, porciones, id_categoria, id_usuario]
        );
        res.status(201).json({ id_receta: result.insertId, mensaje: 'Receta creada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la receta' });
    }
});

app.put('/api/recetas/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, instrucciones, tiempo_preparacion, porciones, id_categoria, id_usuario_req, rol_req } = req.body;
    
    try {
        let query = 'UPDATE recetas SET titulo=?, instrucciones=?, tiempo_preparacion=?, porciones=?, id_categoria=? WHERE id_receta=?';
        let params = [titulo, instrucciones, tiempo_preparacion, porciones, id_categoria, id];

        if (rol_req !== 'admin') {
            query += ' AND id_usuario = ?';
            params.push(id_usuario_req);
        }

        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) return res.status(403).json({ error: 'Sin permisos o receta no existe' });
        
        res.json({ mensaje: 'Receta actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno' });
    }
});

app.delete('/api/recetas/:id', async (req, res) => {
    const { id } = req.params;
    const { id_usuario, rol } = req.query;
    
    try {
        let query = 'DELETE FROM recetas WHERE id_receta = ?';
        let params = [id];

        if (rol !== 'admin') {
            query += ' AND id_usuario = ?';
            params.push(id_usuario);
        }

        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) return res.status(403).json({ error: 'Sin permisos o receta no existe' });
        
        res.json({ mensaje: 'Receta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno' });
    }
});

app.get('/api/categorias', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM categorias');
    res.json(rows);
});
app.post('/api/categorias', async (req, res) => {
    const { nombre_categoria, descripcion } = req.body;
    await db.query('INSERT INTO categorias (nombre_categoria, descripcion) VALUES (?, ?)', [nombre_categoria, descripcion]);
    res.json({ mensaje: 'Categoría creada' });
});
app.put('/api/categorias/:id', async (req, res) => {
    const { nombre_categoria, descripcion } = req.body;
    await db.query('UPDATE categorias SET nombre_categoria=?, descripcion=? WHERE id_categoria=?', [nombre_categoria, descripcion, req.params.id]);
    res.json({ mensaje: 'Categoría actualizada' });
});
app.delete('/api/categorias/:id', async (req, res) => {
    await db.query('DELETE FROM categorias WHERE id_categoria=?', [req.params.id]);
    res.json({ mensaje: 'Categoría eliminada' });
});

app.get('/api/ingredientes', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM ingredientes');
    res.json(rows);
});
app.post('/api/ingredientes', async (req, res) => {
    const { nombre_ingrediente, unidad_medida } = req.body;
    await db.query('INSERT INTO ingredientes (nombre_ingrediente, unidad_medida) VALUES (?, ?)', [nombre_ingrediente, unidad_medida]);
    res.json({ mensaje: 'Ingrediente creado' });
});
app.put('/api/ingredientes/:id', async (req, res) => {
    const { nombre_ingrediente, unidad_medida } = req.body;
    await db.query('UPDATE ingredientes SET nombre_ingrediente=?, unidad_medida=? WHERE id_ingrediente=?', [nombre_ingrediente, unidad_medida, req.params.id]);
    res.json({ mensaje: 'Ingrediente actualizado' });
});
app.delete('/api/ingredientes/:id', async (req, res) => {
    await db.query('DELETE FROM ingredientes WHERE id_ingrediente=?', [req.params.id]);
    res.json({ mensaje: 'Ingrediente eliminado' });
});

app.get('/api/usuarios', async (req, res) => {
    const [rows] = await db.query('SELECT id_usuario, nombre, correo, fecha_registro, rol FROM usuarios');
    res.json(rows);
});
app.post('/api/usuarios', async (req, res) => {
    const { nombre, correo, password_hash } = req.body;
    await db.query('INSERT INTO usuarios (nombre, correo, password_hash) VALUES (?, ?, ?)', [nombre, correo, password_hash]);
    res.json({ mensaje: 'Usuario creado' });
});
app.put('/api/usuarios/:id', async (req, res) => {
    const { nombre, correo, rol, password_hash } = req.body;
    try {
        if (password_hash) {
            await db.query('UPDATE usuarios SET nombre=?, correo=?, rol=?, password_hash=? WHERE id_usuario=?', 
            [nombre, correo, rol, password_hash, req.params.id]);
        } else {
            await db.query('UPDATE usuarios SET nombre=?, correo=?, rol=? WHERE id_usuario=?', 
            [nombre, correo, rol, req.params.id]);
        }
        res.json({ mensaje: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});
app.delete('/api/usuarios/:id', async (req, res) => {
    await db.query('DELETE FROM usuarios WHERE id_usuario=?', [req.params.id]);
    res.json({ mensaje: 'Usuario eliminado' });
});

app.get('/api/recetas/:id/comentarios', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.id_comentario, c.id_usuario, c.texto_comentario, c.calificacion, c.fecha_comentario, u.nombre AS autor
            FROM comentarios c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            WHERE c.id_receta = ?
            ORDER BY c.fecha_comentario DESC
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener comentarios' });
    }
});

app.post('/api/recetas/:id/comentarios', async (req, res) => {
    const id_receta = req.params.id;
    const { id_usuario, texto_comentario, calificacion } = req.body;
    try {
        await db.query(
            'INSERT INTO comentarios (id_receta, id_usuario, texto_comentario, calificacion) VALUES (?, ?, ?, ?)',
            [id_receta, id_usuario, texto_comentario, calificacion]
        );
        res.status(201).json({ mensaje: 'Comentario agregado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar comentario' });
    }
});

app.put('/api/comentarios/:id', async (req, res) => {
    const id_comentario = req.params.id;
    const { texto_comentario, calificacion, id_usuario_req, rol_req } = req.body;
    try {
        let query = 'UPDATE comentarios SET texto_comentario = ?, calificacion = ? WHERE id_comentario = ?';
        let params = [texto_comentario, calificacion, id_comentario];

        if (rol_req !== 'admin') {
            query += ' AND id_usuario = ?';
            params.push(id_usuario_req);
        }

        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) return res.status(403).json({ error: 'Sin permisos' });
        res.json({ mensaje: 'Comentario actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al editar comentario' });
    }
});

app.delete('/api/comentarios/:id', async (req, res) => {
    const id_comentario = req.params.id;
    const { id_usuario, rol } = req.query;
    try {
        let query = 'DELETE FROM comentarios WHERE id_comentario = ?';
        let params = [id_comentario];

        if (rol !== 'admin') {
            query += ' AND id_usuario = ?';
            params.push(id_usuario);
        }

        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) return res.status(403).json({ error: 'Sin permisos' });
        res.json({ mensaje: 'Comentario eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar comentario' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
