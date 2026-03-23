import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Heart, ShieldCheck } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import poster1 from "@/assets/poster-1.jpeg";
import poster2 from "@/assets/poster-2.jpeg";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { getWhatsAppUrl } from "@/components/WhatsAppButton";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const testimonials = [
  { name: "Priya R.", text: "Tastes exactly like my grandmother's pickle! The avakaya is absolutely divine. 🥭", rating: 5 },
  { name: "Suresh K.", text: "The lemon pickle is addictive — tangy, spicy, and so fresh. Best I've ever had!", rating: 5 },
  { name: "Anitha M.", text: "No preservatives, pure homemade taste. My whole family loves Mamatha Cooks! ❤️", rating: 5 },
];

const Index = () => {
  const featured = products.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative container py-24 md:py-36 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight"
          >
            Authentic Homemade <br />
            Andhra Pickles
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body text-primary-foreground/80 text-lg md:text-xl mt-4 max-w-xl mx-auto"
          >
            Prepared with love, no preservatives, traditional recipes passed down through generations
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={getWhatsAppUrl("Hi, I want to order from Mamatha Cooks")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary-foreground text-foreground font-body font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Order on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      {/* Summer Special Posters */}
      <section className="container py-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-bold text-center mb-2"
        >
          🥭 Summer Special Mango Pickles
        </motion.h2>
        <p className="text-center text-muted-foreground mb-8">
          Beat the heat with our authentic Andhra mango pickles — limited season, unlimited flavor!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[poster1, poster2].map((poster, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-xl overflow-hidden warm-shadow-lg"
            >
              <img
                src={poster}
                alt={`Summer special mango pickle poster ${i + 1}`}
                className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Order Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Leaf, title: "100% Natural", desc: "No preservatives or chemicals" },
            { icon: Heart, title: "Made with Love", desc: "Traditional family recipes" },
            { icon: ShieldCheck, title: "Quality Promise", desc: "Fresh ingredients, always" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex items-center gap-4 bg-card rounded-lg p-5 warm-shadow"
            >
              <div className="bg-primary/10 rounded-full p-3">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-10">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold">Our Bestsellers</h2>
          <p className="text-muted-foreground mt-2">Loved by thousands of families across India</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 font-body font-bold text-primary hover:underline"
          >
            View All Pickles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-10">
        <h2 className="font-display text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-card rounded-lg p-6 warm-shadow"
            >
              <p className="text-foreground italic leading-relaxed">"{t.text}"</p>
              <p className="mt-4 font-body font-bold text-primary">{t.name}</p>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-secondary">★</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
