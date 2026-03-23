import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StarRating from "./StarRating";
import { Product } from "@/data/products";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card rounded-lg overflow-hidden warm-shadow hover:warm-shadow-lg transition-shadow"
    >
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            {product.category}
          </span>
          <h3 className="font-display font-semibold text-foreground mt-1 line-clamp-1">
            {product.name}
          </h3>
          <StarRating rating={product.rating} />
          <div className="flex items-center justify-between mt-3">
            <span className="font-body font-bold text-lg text-accent">₹{product.price}</span>
            <span className="text-xs font-body font-semibold text-primary hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
