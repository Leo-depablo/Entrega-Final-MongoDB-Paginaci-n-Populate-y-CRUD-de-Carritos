const { Router } = require("express");
const Product = require("../models/product.model"); // Importar el modelo Mongoose

const router = Router();

// ----------------------------------------------------
// GET /api/products/ (Paginación, Filtros y Sort)
// ----------------------------------------------------
router.get("/", async (req, res) => {
  try {
    // Extraer y establecer defaults
    const { limit = 10, page = 1, sort, query } = req.query;

    // 1. Construir el filtro (query)
    let filter = {};
    if (query) {
      // Se puede buscar por categoría o por disponibilidad
      if (
        query.toLowerCase() === "disponible" ||
        query.toLowerCase() === "available"
      ) {
        filter.status = true; // Filtrar por productos con status true
      } else {
        // Asumimos que cualquier otro 'query' es una categoría
        filter.category = query;
      }
    }

    // 2. Construir el ordenamiento (sort) por precio
    let sortOptions = {};
    if (sort === "asc" || sort === "desc") {
      sortOptions.price = sort === "asc" ? 1 : -1; // 1 para ascendente, -1 para descendente
    }

    // 3. Opciones de paginación
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sortOptions,
      lean: true, // Para obtener objetos JS planos (esencial para Handlebars)
    };

    // Ejecutar la paginación
    const result = await Product.paginate(filter, options);

    // 4. Construir los links dinámicos
    const baseUrl =
      req.protocol + "://" + req.get("host") + req.originalUrl.split("?")[0];

    const getLink = (p) => {
      const params = new URLSearchParams(req.query);
      params.set("page", p);
      return `${baseUrl}?${params.toString()}`;
    };

    // 5. Devolver el objeto con el formato EXACTO solicitado en la consigna
    const response = {
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? getLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? getLink(result.nextPage) : null,
    };

    res.json(response);
  } catch (error) {
    // Captura de errores fatales
    console.error("Error al obtener productos:", error);
    res
      .status(500)
      .json({ status: "error", payload: "Error interno del servidor." });
  }
});

// ----------------------------------------------------
// CRUD RESTANTE (Debe ser migrado a Mongoose)
// ----------------------------------------------------

// GET /api/products/:pid
router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado." });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "ID inválido o error en la consulta." });
  }
});

// POST /api/products/
router.post("/", async (req, res) => {
  try {
    const newProduct = req.body;

    // ** Validaciones (Criterio de la Rúbrica: Validaciones) **
    if (!newProduct.title || !newProduct.price || !newProduct.code) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Faltan campos obligatorios: title, price y code.",
        });
    }

    const product = await Product.create(newProduct);

    // Si la creación es exitosa, notificamos por Sockets
    // Nota: Asegúrate de que el middleware req.io = io esté activo en app.js
    if (req.io) {
      const updatedProducts = await Product.find().lean();
      req.io.emit("productsUpdate", updatedProducts);
    }

    res.status(201).json({ status: "success", payload: product });
  } catch (error) {
    // Error de Mongoose (ej. código duplicado)
    res.status(400).json({ status: "error", message: error.message });
  }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true, runValidators: true } // new: devuelve el documento actualizado; runValidators: aplica las validaciones del esquema
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    // Notificar por Sockets
    if (req.io) {
      const updatedProducts = await Product.find().lean();
      req.io.emit("productsUpdate", updatedProducts);
    }

    res.json({ status: "success", payload: updatedProduct });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.pid);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    // Notificar por Sockets
    if (req.io) {
      const updatedProducts = await Product.find().lean();
      req.io.emit("productsUpdate", updatedProducts);
    }

    res.json({ status: "success", message: "Producto eliminado." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
