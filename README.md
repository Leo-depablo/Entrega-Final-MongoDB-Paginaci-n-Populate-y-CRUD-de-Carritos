# Entrega Final: Backend E-commerce con MongoDB

Este proyecto desarrolla el backend de una aplicación de e-commerce, cumpliendo con la migración completa a **MongoDB** y la implementación de todas las funcionalidades avanzadas requeridas por la rúbrica.

Se utiliza **Mongoose** para la persistencia de datos, y se implementa paginación, filtros, ordenamiento y la técnica de *populate* para la gestión de productos y carritos.

---

##  Tecnologías Utilizadas

* **Node.js**
* **Express.js** (Framework)
* **MongoDB** (Base de datos NoSQL)
* **Mongoose** (ODM para MongoDB)
* **Mongoose-paginate-v2** (Plugin para paginación)
* **Handlebars.js** (Motor de plantillas para Vistas)

---

##  Instalación y Ejecución

### 1. Requisitos Previos
* Tener instalado Node.js.
* Tener instalado y ejecutándose el servicio local de **MongoDB** (en `mongodb://localhost:27017`).

### 2. Clonar el Repositorio
```bash
git clone [https://github.com/Leo-depablo/Entrega-Final-MongoDB-Paginaci-n-Populate-y-CRUD-de-Carritos.git](https://github.com/Leo-depablo/Entrega-Final-MongoDB-Paginaci-n-Populate-y-CRUD-de-Carritos.git)
cd Entrega-Final-MongoDB-Paginaci-n-Populate-y-CRUD-de-Carritos


endpoints de prueba
Ruta,Descripción,Criterio de Rúbrica
http://localhost:8080/,Vista principal de productos con controles de paginación y links dinámicos.,"Productos, Paginación "
http://localhost:8080/carts/[CID],Vista del carrito que muestra la información completa de los productos (gracias al populate).,"Carrito, Populate "
