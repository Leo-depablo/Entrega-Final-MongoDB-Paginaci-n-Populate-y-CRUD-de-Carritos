const socket = io();

// 1. Manejar la recepción inicial y actualizaciones de la lista de productos
socket.on("productsUpdate", (products) => {
  const productList = document.getElementById("realTimeProductList");
  let html = "";

  products.forEach((product) => {
    html += `
            <li>
                <strong>${product.title}</strong> (ID: ${product.id}) - $${product.price}
                <br>
                Stock: ${product.stock} | Código: ${product.code}
            </li>
        `;
  });

  productList.innerHTML = html;
});

// 2. Manejar el envío de nuevo producto
const addProductForm = document.getElementById("addProductForm");
addProductForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(addProductForm);
  const newProduct = {
    title: formData.get("title"),
    description: formData.get("description"),
    code: formData.get("code"),
    price: parseFloat(formData.get("price")),
    status: true, // Asumimos true por defecto
    stock: parseInt(formData.get("stock")),
    category: formData.get("category"),
    thumbnails: [],
  };

  // Emitir el evento de creación al servidor
  socket.emit("addProduct", newProduct);
  addProductForm.reset();
});

// 3. Manejar el envío de eliminación de producto
const deleteProductForm = document.getElementById("deleteProductForm");
deleteProductForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const idToDelete = parseInt(
    document.querySelector('#deleteProductForm input[name="id"]').value
  );

  // Emitir el evento de eliminación al servidor
  socket.emit("deleteProduct", idToDelete);
  deleteProductForm.reset();
});

// Escuchar posibles errores
socket.on("error", (error) => {
  alert(`Error: ${error}`);
});
