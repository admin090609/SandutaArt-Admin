import mongoose, { model, Schema, models } from "mongoose";

const ProductSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  images: [{ type: String }],
  category: { type: mongoose.Types.ObjectId, ref: 'Category' },
  properties: { type: Object },
  options: [{ title: String, options: [String] }],
  minWidth: { type: Number, required: true },
  minHeight: { type: Number, required: true }
}, {
  timestamps: true,
});

export const Product = models.Product || model('Product', ProductSchema);