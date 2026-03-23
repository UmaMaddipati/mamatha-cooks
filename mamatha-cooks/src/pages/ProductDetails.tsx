import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingCart, MessageCircle } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { getWhatsAppUrl } from "@/components/WhatsAppButton";
import StarRating from "@/components/StarRating";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const weightOptions = [
    { label: "1/4kg", value: 0.25, multiplier: 0.5 },
    { label: "1/2kg", value: 0.5, multiplier: 1 },
    { label: "1kg", value: 1, multiplier: 2 },
    { label: "2kg", value: 2, multiplier: 4 },
  ];
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[1]);
  const displayPrice = Math.round(product ? product.price * selectedWeight.multiplier : 0);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
        <Link to="/products" className="text-primary font-semibold mt-4 inline-block">← Back to Shop</Link>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product, qty, selectedWeight.label, selectedWeight.value, displayPrice);
    toast.success(`${product.name} (${selectedWeight.label}) added to cart!`);
  };

  return (
    <div className="container py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg overflow-hidden warm-shadow"
        >
          <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">{product.category}</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">{product.name}</h1>
          <StarRating rating={product.rating} />
          <p className="font-display text-3xl font-bold text-accent mt-4">₹{displayPrice}</p>
          <p className="text-muted-foreground leading-relaxed mt-4">{product.description}</p>

          <div className="mt-6">
            <h3 className="font-display font-semibold mb-2">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ing) => (
                <span key={ing} className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full font-body">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            <span className="font-semibold text-foreground">Shelf Life:</span> {product.shelfLife}
          </p>

          {/* Weight Options */}
          <div className="mt-6">
            <h3 className="font-display font-semibold mb-3">Select Weight</h3>
            <div className="flex flex-wrap gap-3">
              {weightOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setSelectedWeight(option)}
                  className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    selectedWeight.label === option.label
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-body font-bold text-lg w-8 text-center">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
            <a
              href={getWhatsAppUrl(`Hi, I want to order ${product.name} from Mamatha Cooks`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-primary-foreground font-body font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" /> Order via WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
