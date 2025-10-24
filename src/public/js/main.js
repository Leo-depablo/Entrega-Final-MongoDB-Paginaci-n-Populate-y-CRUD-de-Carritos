document.addEventListener("DOMContentLoaded", () => {
  // 1. Escuchar los clics en todos los botones de "Agregar al Carrito"
  const cartButtons = document.querySelectorAll(".btn-cart");

  cartButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      // 2. Obtener los IDs necesarios del botón
      const productId = event.target.getAttribute("data-product-id");
      const cartId = event.target.getAttribute("data-cart-id");

      if (!cartId || !productId) {
        return console.error("Faltan IDs para agregar al carrito.");
      }

      // 3. Construir la URL del endpoint API
      const url = `/api/carts/${cartId}/product/${productId}`;

      try {
        // 4. Enviar la solicitud POST
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          alert(`✅ Producto agregado al carrito ${cartId} con éxito!`);
        } else {
          alert(
            `❌ Error al agregar producto: ${
              result.message || "Error desconocido"
            }`
          );
        }
      } catch (error) {
        console.error("Error de red:", error);
        alert("Ocurrió un error de conexión al servidor.");
      }
    });
  });
});
