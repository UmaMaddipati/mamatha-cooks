import { MessageCircle, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-lg font-bold text-accent mb-3">Mamatha Cooks</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Authentic homemade Andhra pickles, snacks & powders. Made with love, no preservatives.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <a href="/products" className="hover:text-primary transition-colors">Shop</a>
            <a href="/about" className="hover:text-primary transition-colors">Our Story</a>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Get in Touch</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" /> +91 9640483646
            </a>
            <a href="mailto:hello@mamathacooks.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" /> maddipatis111@gmail.com
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 Mamatha Cooks. All rights reserved. Made with ❤️
      </div>
    </footer>
  );
};

export default Footer;
