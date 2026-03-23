import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

const Products = () => {
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<"all" | "under200" | "200to300" | "above300">("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (priceRange === "under200" && p.price >= 200) return false;
      if (priceRange === "200to300" && (p.price < 200 || p.price > 300)) return false;
      if (priceRange === "above300" && p.price <= 300) return false;
      return true;
    });
  }, [search, priceRange]);

  return (
    <div className="container py-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl md:text-4xl font-bold text-center mb-8"
      >
        Our Pickles
      </motion.h1>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search pickles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Price Filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {[
          { label: "All Prices", value: "all" as const },
          { label: "Under ₹200", value: "under200" as const },
          { label: "₹200 – ₹300", value: "200to300" as const },
          { label: "Above ₹300", value: "above300" as const },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPriceRange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-colors ${
              priceRange === opt.value
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-border"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 font-body">No pickles found. Try a different search or filter.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
