const fs = require("fs/promises");

class CartManager {
  constructor(filePath) {
    this.path = filePath;
  }

  async getCarts() {
    try {
      const carts = await fs.readFile(this.path, "utf-8");
      return JSON.parse(carts);
    } catch (error) {
      return [];
    }
  }

  async createCart() {
    const carts = await this.getCarts();
    const newCart = {
      id: carts.length > 0 ? Math.max(...carts.map((c) => c.id)) + 1 : 1,
      products: [],
    };
    carts.push(newCart);
    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find((c) => c.id === id);
  }

  async addProductToCart(cartId, productId) {
    const carts = await this.getCarts();
    const cartIndex = carts.findIndex((c) => c.id === cartId);

    if (cartIndex === -1) {
      throw new Error("Carrito no encontrado.");
    }

    const cart = carts[cartIndex];
    const productInCart = cart.products.find((p) => p.product === productId);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }
}

module.exports = CartManager;
