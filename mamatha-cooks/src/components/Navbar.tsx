import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/about", label: "Our Story" },
  { to: "/cart", label: "Cart" },
];

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-display text-xl md:text-2xl font-bold text-black">
          Mamatha Cooks
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.slice(0, 3).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`font-body text-sm font-semibold transition-colors hover:text-primary ${location.pathname === l.to ? "text-primary" : "text-foreground"
                }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-5 h-5 text-foreground hover:text-primary transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium flex items-center gap-2">
                 <User className="w-4 h-4"/>
                 <span className="truncate max-w-[100px]">{user.email.split('@')[0]}</span>
              </span>
              <Link to="/orders">
                <Button variant="ghost" size="sm">My Orders</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-4">
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`font-body font-semibold py-2 ${location.pathname === l.to ? "text-primary" : "text-foreground"
                    }`}
                >
                  {l.label}
                </Link>
              ))}
              
              <div className="h-px bg-border my-2" />
              {user ? (
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-2 text-sm font-medium py-2">
                     <User className="w-4 h-4" />
                     {user.email}
                   </div>
                   <Link to="/orders" onClick={() => setMobileOpen(false)}>
                     <Button variant="ghost" className="w-full justify-center">My Orders</Button>
                   </Link>
                   <Button variant="outline" className="w-full justify-center" onClick={() => { logout(); setMobileOpen(false); }}>
                     Logout
                   </Button>
                 </div>
              ) : (
                 <div className="flex flex-col gap-3">
                   <Link to="/login" onClick={() => setMobileOpen(false)}>
                     <Button variant="outline" className="w-full justify-center">Login</Button>
                   </Link>
                   <Link to="/signup" onClick={() => setMobileOpen(false)}>
                     <Button className="w-full justify-center">Sign Up</Button>
                   </Link>
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
