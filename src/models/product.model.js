const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // 'unique: true' asegura que no haya códigos duplicados
  price: { type: Number, required: true },
  status: { type: Boolean, default: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true, index: true }, // 'index: true' mejora la velocidad de búsqueda por categoría
  thumbnails: { type: [String], default: [] },
});

// Aplicar el plugin de paginación
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model("products", productSchema);
module.exports = Product;
