const { Router } = require("express");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model"); // Se importa para futuras validaciones

const router = Router();

// ----------------------------------------------------
// POST /api/carts/ (Crear un nuevo carrito)
// ----------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const cart = await Cart.create({}); // Crea un carrito vacío
    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al crear el carrito." });
  }
});

// ----------------------------------------------------
// GET /api/carts/:cid (CON POPULATE)
// Criterio: Se realiza correctamente un populate al momento de obtener un carrito.
// ----------------------------------------------------
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    // Uso de populate para traer la información completa del producto
    const cart = await Cart.findById(cid).populate("products.product").lean();

    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado." });
    }
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ----------------------------------------------------
// POST /api/carts/:cid/product/:pid (Agregar producto al carrito)
// ----------------------------------------------------
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);

    if (!cart)
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado." });

    // Verificar si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );

    if (productIndex !== -1) {
      // Si existe, incrementa la cantidad
      cart.products[productIndex].quantity += 1;
    } else {
      // Si no existe, agrégalo
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Error al agregar producto al carrito.",
      });
  }
});

// ----------------------------------------------------
// DELETE /api/carts/:cid/products/:pid (Eliminar producto del carrito)
// Criterio: Los métodos DELETE eliminan correctamente los productos.
// ----------------------------------------------------
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { $pull: { products: { product: pid } } }, // $pull elimina el elemento del array que coincide con la condición
      { new: true }
    );

    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado." });
    }
    res.json({
      status: "success",
      payload: cart,
      message: "Producto eliminado del carrito.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ----------------------------------------------------
// PUT /api/carts/:cid (Actualizar TODOS los productos del carrito)
// Criterio: Los métodos PUT actualizan correctamente los elementos del carrito.
// ----------------------------------------------------
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // Espera un array de productos: [{product: 'id', quantity: 5}]

    // VALIDACIÓN BÁSICA: Asegurarse de que 'products' es un array
    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({
          status: "error",
          message:
            "El cuerpo de la solicitud debe contener un array de productos.",
        });
    }

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: products }, // Sobreescribe el array completo
      { new: true }
    );

    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado." });
    }
    res.json({
      status: "success",
      payload: cart,
      message: "Carrito actualizado completamente.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ----------------------------------------------------
// PUT /api/carts/:cid/products/:pid (Actualizar SÓLO la cantidad)
// Criterio: Los métodos PUT actualizan correctamente la cantidad.
// ----------------------------------------------------
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body; // Espera { quantity: X }

    if (typeof quantity !== "number" || quantity <= 0) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "La cantidad debe ser un número positivo.",
        });
    }

    // Buscar y actualizar el producto específico dentro del array
    const cart = await Cart.findOneAndUpdate(
      { _id: cid, "products.product": pid },
      { $set: { "products.$.quantity": quantity } }, // $ hace referencia al elemento del array encontrado
      { new: true }
    );

    if (!cart) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "Carrito o Producto no encontrado en el carrito.",
        });
    }
    res.json({
      status: "success",
      payload: cart,
      message: "Cantidad de producto actualizada.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ----------------------------------------------------
// DELETE /api/carts/:cid (Eliminar TODOS los productos del carrito)
// Criterio: Los métodos DELETE eliminan correctamente todos los productos.
// ----------------------------------------------------
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] }, // Deja el array de productos vacío
      { new: true }
    );

    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado." });
    }
    res.json({
      status: "success",
      payload: cart,
      message: "Todos los productos eliminados del carrito.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
