const { Router } = require("express");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");

const router = Router();

// ----------------------------------------------------
// GET / (Visualizar productos paginados)
// Criterio: Modificar la vista index.handlebars en el router de views ‘/products’ para visualizar todos los productos con su respectiva paginación.
// ----------------------------------------------------
router.get("/", async (req, res) => {
  // Nota: El router de views 'index.handlebars' se mapea a la ruta '/'
  const { limit = 10, page = 1, sort, query } = req.query;

  let filter = {};
  if (query) {
    if (
      query.toLowerCase() === "disponible" ||
      query.toLowerCase() === "available"
    ) {
      filter.status = true;
    } else {
      filter.category = query;
    }
  }

  let sortOptions = {};
  if (sort === "asc" || sort === "desc") {
    sortOptions.price = sort === "asc" ? 1 : -1;
  }

  const options = {
    limit: parseInt(limit),
    page: parseInt(page),
    sort: sortOptions,
    lean: true,
  };

  try {
    const result = await Product.paginate(filter, options);

    // Construir el link base para la paginación
    // Esto crea el link 'http://localhost:8080/?page=X&limit=Y...'
    const baseUrl =
      req.protocol + "://" + req.get("host") + req.originalUrl.split("?")[0];
    const getLink = (p) => {
      const params = new URLSearchParams(req.query);
      params.set("page", p);
      return `${baseUrl}?${params.toString()}`;
    };

    res.render("products", {
      // Asumiendo que renombraste index.handlebars a 'products'
      products: result.docs,
      // Sustituye el ID de carrito para que el botón "Agregar al Carrito" funcione
      user: { role: "user", cartId: "68fc004319d7fb8c87b7ad5e" },
      pagination: {
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? getLink(result.prevPage) : null,
        nextLink: result.hasNextPage ? getLink(result.nextPage) : null,
      },
    });
  } catch (error) {
    console.error("Error en views router /:", error);
    res
      .status(500)
      .render("error", { message: "Error al cargar el catálogo." });
  }
});

// ----------------------------------------------------
// GET /carts/:cid (Vista de carrito específico)
// Criterio: Agregar una vista en ‘/carts/:cid’ para visualizar un carrito específico con productos populados.
// ----------------------------------------------------
router.get("/carts/:cid", async (req, res) => {
  try {
    // Uso de populate para traer la info completa del producto (como se hace en la API)
    const cart = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart)
      return res
        .status(404)
        .render("error", { message: "Carrito no encontrado" });

    res.render("cartDetail", { cart: cart });
  } catch (error) {
    res.status(500).render("error", { message: "Error al cargar el carrito" });
  }
});

// Mantenemos la vista de tiempo real
router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { title: "Productos en Tiempo Real" });
});

module.exports = router;
