import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getWhatsAppUrl } from "@/components/WhatsAppButton";
import { CheckoutModal } from "@/components/CheckoutModal";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground mt-2">Looks like you haven't added anything yet!</p>
          <Link
            to="/products"
            className="inline-block mt-6 bg-primary text-primary-foreground font-body font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  const whatsappMsg = items
    .map((i) => `${i.product.name} (${i.weightLabel}) x${i.quantity} (₹${i.price * i.quantity})`)
    .join("\n");

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-4 bg-card rounded-lg p-4 warm-shadow"
          >
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-20 h-20 rounded-md object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-sm md:text-base truncate">
                {item.product.name}
                <span className="inline-block ml-2 text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 align-middle">
                  {item.weightLabel}
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">₹{item.price} each</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-body font-bold text-sm w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
              <span className="font-body font-bold text-accent">₹{item.price * item.quantity}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-8 bg-card rounded-lg p-6 warm-shadow">
        <div className="flex justify-between items-center mb-4">
          <span className="font-display text-lg font-semibold">Total</span>
          <span className="font-display text-2xl font-bold text-accent">₹{totalPrice}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <CheckoutModal items={items} totalPrice={totalPrice} whatsappMsg={whatsappMsg} />
        </div>
      </div>
    </div>
  );
};

export default Cart;
