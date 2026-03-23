import { motion } from "framer-motion";
import aboutImg from "@/assets/about-story.jpg";
import { Heart, Leaf, Users } from "lucide-react";

const About = () => {
  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="font-display text-3xl md:text-5xl font-bold text-center mb-4">
          Our Story ❤️
        </h1>
        <p className="text-center text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
          Behind every jar is a mother's love, a family recipe, and the authentic flavors of Andhra Pradesh.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
          <div className="rounded-lg overflow-hidden warm-shadow">
            <img src={aboutImg} alt="Mamatha cooking in her kitchen" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold">From Our Kitchen to Yours</h2>
            <p className="text-muted-foreground leading-relaxed">
              It all started in a small kitchen in Andhra Pradesh. Mamatha, a loving mother and passionate cook, 
              would spend hours preparing traditional pickles, snacks, and spice powders for her family. 
              The secret? Recipes passed down through four generations, made only with the freshest ingredients 
              and absolutely no preservatives.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              When friends and neighbors couldn't stop asking for more, Mamatha Cooks was born — 
              not as a business, but as a way to share the warmth of homemade food with families everywhere. 
              Every product is still made in small batches, by hand, with the same care as if we were cooking for our own family.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Heart,
              title: "Made with Love",
              desc: "Every product is handcrafted in small batches. We treat every order like we're cooking for family.",
            },
            {
              icon: Leaf,
              title: "100% Natural",
              desc: "No preservatives, no artificial colors, no shortcuts. Just pure, honest, homemade food.",
            },
            {
              icon: Users,
              title: "Family First",
              desc: "We're not a factory. We're a family kitchen that happens to ship joy across the country.",
            },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-lg p-6 warm-shadow text-center"
            >
              <div className="bg-primary/10 rounded-full p-3 w-14 h-14 mx-auto flex items-center justify-center mb-4">
                <v.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-card rounded-lg p-8 warm-shadow text-center">
          <h2 className="font-display text-2xl font-bold mb-3">Our Promise 🤝</h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            When you open a jar from Mamatha Cooks, we want you to close your eyes and be transported 
            to an Andhra kitchen — where the air smells of mustard and chili, where food is made with patience, 
            and where every bite tells a story of love. That's our promise to you.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
