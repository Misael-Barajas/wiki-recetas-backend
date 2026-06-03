CREATE DATABASE wiki_recetas_db;
USE wiki_recetas_db;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario'
);

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE ingredientes (
    id_ingrediente INT AUTO_INCREMENT PRIMARY KEY,
    nombre_ingrediente VARCHAR(100) NOT NULL UNIQUE,
    unidad_medida VARCHAR(20) NOT NULL 
);

CREATE TABLE recetas (
    id_receta INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    instrucciones TEXT NOT NULL,
    tiempo_preparacion INT NOT NULL, 
    porciones INT NOT NULL,
    id_categoria INT,
    id_usuario INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_receta INT NOT NULL,
    id_usuario INT NOT NULL,
    texto_comentario TEXT NOT NULL,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, correo, password_hash) VALUES 
('Misael Barajas', 'misael@gmail.com', 'misael123'),
('Alberto Molina', 'alberto@gmail.com', 'alberto123');

UPDATE usuarios SET rol = 'admin' WHERE id_usuario = 1;

INSERT INTO categorias (nombre_categoria, descripcion) VALUES 
('Desayunos', 'Recetas ideales para comenzar el día con energía.'),
('Postres', 'Platillos dulces para después de comer.'),
('Comida Mexicana', 'Platillos tradicionales de México.');

INSERT INTO ingredientes (nombre_ingrediente, unidad_medida) VALUES 
('Huevo', 'piezas'),
('Harina', 'kg'),
('Leche', 'litros'),
('Azúcar', 'g');

INSERT INTO recetas (titulo, instrucciones, tiempo_preparacion, porciones, id_categoria, id_usuario) VALUES 
('Hotcakes Clásicos', '1. Mezclar harina, leche y huevo. 2. Cocinar en sartén.', 15, 4, 1, 1),
('Flan Napolitano', '1. Licuar ingredientes. 2. Hornear a baño maría.', 60, 8, 2, 2);

INSERT INTO comentarios (id_receta, id_usuario, texto_comentario, calificacion) VALUES 
(1, 2, '¡Quedaron muy esponjosos!', 5),
(2, 1, 'Un poco dulce para mi gusto, pero buena textura.', 4);