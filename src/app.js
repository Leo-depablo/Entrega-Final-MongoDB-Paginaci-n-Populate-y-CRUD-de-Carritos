const express = require("express");
const handlebars = require("express-handlebars");
const { Server } = require("socket.io");
const path = require("path");
const mongoose = require("mongoose"); // <-- NUEVO: Para la conexión a MongoDB

// Importar modelos de Mongoose (Necesarios para la lógica de Sockets)
const Product = require("./models/product.model");

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");

const app = express();
const PORT = 8080;
const MONGO_URI = "mongodb://localhost:27017/ecommerce"; // <-- URI de MongoDB

// ----------------------
// Conexión a MongoDB
// ----------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Conectado a la base de datos MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// ----------------------
// Configuración de Handlebars
// ----------------------
app.engine("handlebars", handlebars.engine());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

// ----------------------
// Configuración de Middlewares
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos (CSS, JS del cliente)
app.use(express.static(path.join(__dirname, "public")));

// ----------------------
// Inicialización del Servidor HTTP y Sockets
// ----------------------
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

const io = new Server(httpServer);

// ----------------------
// Middleware para Sockets e Intercambio de Datos (opcional si no se usa en routers)
// ----------------------
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ----------------------
// Configuración de Rutas
// ----------------------
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// ----------------------
// Lógica de Socket.IO (Actualizaciones en tiempo real)
// ----------------------
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Función auxiliar para emitir la lista actualizada de productos (usando Mongoose)
  const sendProductsUpdate = async () => {
    try {
      // Buscamos todos los productos en MongoDB
      const products = await Product.find().lean();
      io.emit("productsUpdate", products);
    } catch (error) {
      console.error("Error al obtener productos para socket:", error);
    }
  };

  // 1. Enviar productos al conectar
  sendProductsUpdate();

  // 2. Manejar la creación de un nuevo producto (por socket)
  socket.on("addProduct", async (newProduct) => {
    try {
      // Se asume que la validación se hace a nivel de modelo/router
      await Product.create(newProduct);
      await sendProductsUpdate(); // Notificar a todos los clientes del cambio
    } catch (error) {
      console.error("Error al agregar producto por socket:", error.message);
      socket.emit(
        "error",
        "Error al crear producto. Verifique los datos o si el código ya existe."
      );
    }
  });

  // 3. Manejar la eliminación de un producto (por socket)
  socket.on("deleteProduct", async (id) => {
    try {
      // Mongoose: Buscamos por ID y eliminamos
      await Product.findByIdAndDelete(id);
      await sendProductsUpdate(); // Notificar a todos los clientes del cambio
    } catch (error) {
      console.error("Error al eliminar producto por socket:", error.message);
      socket.emit("error", `No se pudo eliminar el producto con ID ${id}.`);
    }
  });
});
