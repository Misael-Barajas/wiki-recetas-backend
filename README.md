
# Backend - API REST - Wiki Recetas

## Descripción General

Esta API REST fue desarrollada con Node.js y Express para gestionar la plataforma "Wiki Recetas". El proyecto cumple con el requisito de implementar un CRUD completo para al menos 4 tablas de la base de datos y cuenta con un sistema de control de acceso basado en roles (RBAC) para administrar los permisos de edición y eliminación.

## ⚙️ Instrucciones de Despliegue

Para poner en marcha este servidor en un entorno local, sigue los siguientes pasos:

1.  **Configuración de la Base de Datos:**
    
    -   Ejecuta el script SQL proporcionado para crear la base de datos llamada `wiki_recetas_db`.
        
    -   Este script generará automáticamente las 5 tablas necesarias (`usuarios`, `categorias`, `ingredientes`, `recetas` y `comentarios`) e insertará datos de prueba, incluyendo un usuario con el rol de `admin`.
        
2.  **Instalación de Dependencias:**
    
    -   Asegúrate de tener Node.js instalado.
        
    -   Abre la terminal en la carpeta del backend y ejecuta `npm install` para instalar las librerías necesarias (como `express`, `cors`, `mysql2` y `dotenv`).
        
3.  **Variables de Entorno:**
    
    -   Crea un archivo `.env` en la raíz del proyecto para configurar la conexión a la base de datos.
        
    -   El archivo debe contener las siguientes variables: `DB_HOST` (por defecto 'localhost'), `DB_USER` (por defecto 'root'), `DB_PASSWORD` (por defecto 'Misa21a15') y `DB_NAME` (por defecto 'wiki_recetas_db').
        
4.  **Ejecución del Servidor:**
    
    -   Inicia el servidor ejecutando el comando `node index.js`.
        
    -   La consola mostrará el mensaje indicando que el servidor se está ejecutando en el puerto asignado, por defecto `http://localhost:3000`.
        

## 🛠️ Funcionamiento del Backend y Endpoints

El backend está construido con Express y utiliza el middleware `cors` para permitir peticiones desde el frontend en Angular, además de `express.json()` para procesar el cuerpo de las solicitudes. A continuación se detallan los 5 CRUDs completos implementados:

### 1. Autenticación y Usuarios (CRUD 1)

Gestiona el acceso a la plataforma y las cuentas.

-   **POST** `/api/login`: Valida las credenciales comprobando el `correo` y el `password_hash` en la base de datos; retorna los datos del usuario y su `rol` si la autenticación es exitosa.
    
-   **GET** `/api/usuarios`: Retorna la lista de todos los usuarios registrados.
    
-   **POST** `/api/usuarios`: Crea un nuevo usuario en la base de datos.
    
-   **PUT** `/api/usuarios/:id`: Actualiza el nombre y correo de un usuario existente.
    
-   **DELETE** `/api/usuarios/:id`: Elimina un usuario del sistema.
    

### 2. Recetas (CRUD 2)

Gestiona el catálogo principal. Cuenta con validación de roles: un usuario normal solo puede actualizar o eliminar sus propias recetas, mientras que un 'admin' puede modificar las de cualquier usuario.

-   **GET** `/api/recetas/destacadas`: Obtiene las 3 mejores recetas calculando el promedio de sus calificaciones.
    
-   **GET** `/api/recetas`: Obtiene el catálogo completo de recetas incluyendo el autor, categoría y calificación promedio.
    
-   **POST** `/api/recetas`: Inserta una nueva receta vinculada a un usuario y categoría.
    
-   **PUT** `/api/recetas/:id`: Actualiza los datos de una receta específica verificando los permisos mediante `rol_req` e `id_usuario_req`.
    
-   **DELETE** `/api/recetas/:id`: Elimina una receta verificando los permisos a través de parámetros en la URL (`rol` e `id_usuario`).
    

### 3. Categorías (CRUD 3)

-   **GET** `/api/categorias`: Lista todas las categorías disponibles.
    
-   **POST** `/api/categorias`: Crea una nueva categoría con nombre y descripción.
    
-   **PUT** `/api/categorias/:id`: Actualiza una categoría existente.
    
-   **DELETE** `/api/categorias/:id`: Elimina una categoría.
    

### 4. Ingredientes (CRUD 4)

-   **GET** `/api/ingredientes`: Lista todos los ingredientes y sus unidades de medida.
    
-   **POST** `/api/ingredientes`: Crea un nuevo ingrediente.
    
-   **PUT** `/api/ingredientes/:id`: Modifica los datos de un ingrediente.
    
-   **DELETE** `/api/ingredientes/:id`: Borra un ingrediente del catálogo.
    

### 5. Comentarios (CRUD 5 - Tabla Complementaria)

-   **GET** `/api/recetas/:id/comentarios`: Obtiene todos los comentarios y calificaciones asociados a una receta específica, ordenados por fecha.
    
-   **POST** `/api/recetas/:id/comentarios`: Permite a un usuario agregar una reseña y calificación a una receta.
    
-   **PUT** `/api/comentarios/:id`: Edita un comentario validando que el usuario que lo solicita sea el dueño o un administrador.
    
-   **DELETE** `/api/comentarios/:id`: Elimina un comentario validando los permisos de rol correspondientes.
