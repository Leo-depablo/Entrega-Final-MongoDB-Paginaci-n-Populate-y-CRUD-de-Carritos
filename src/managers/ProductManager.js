const fs = require("fs/promises");

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
  }

  async getProducts() {
    try {
      const products = await fs.readFile(this.path, "utf-8");
      return JSON.parse(products);
    } catch (error) {
      // Si el archivo no existe o está vacío, retorna un array vacío.
      return [];
    }
  }

  async addProduct(product) {
    const products = await this.getProducts();
    // Genera un ID autoincrementable.
    product.id =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    products.push(product);
    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    return product;
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find((p) => p.id === id);
  }

  async updateProduct(id, updatedFields) {
    let products = await this.getProducts();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      throw new Error("Producto no encontrado.");
    }

    const productToUpdate = products[productIndex];
    // Actualiza los campos, pero evita que el ID sea modificado.
    products[productIndex] = {
      ...productToUpdate,
      ...updatedFields,
      id: productToUpdate.id,
    };

    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
  }

  async deleteProduct(id) {
    let products = await this.getProducts();
    const initialLength = products.length;
    products = products.filter((p) => p.id !== id);

    if (products.length === initialLength) {
      throw new Error("Producto no encontrado.");
    }

    await fs.writeFile(this.path, JSON.stringify(products, null, 2));
  }
}

module.exports = ProductManager;
